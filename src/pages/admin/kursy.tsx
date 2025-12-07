// src/pages/admin/kursy.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
}

interface UserProfile {
  id: string;
  email: string;
}

interface Enrollment {
  user_id: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
}

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
  enrollments: Enrollment[];
}

export default function KursyAdmin() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newLessons, setNewLessons] = useState<Lesson[]>([
    { id: 'temp-1', lesson_number: 1, title: 'Lekcja 1' },
    { id: 'temp-2', lesson_number: 2, title: 'Lekcja 2' },
  ]);

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState<'TEACHER' | 'STUDENT'>('TEACHER');

  const [allTeachers, setAllTeachers] = useState<UserProfile[]>([]);
  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'ADMIN') return navigate('/');

      fetchAllData();
      fetchUsers();
    };
    init();
  }, [navigate]);

  const fetchAllData = async () => {
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        course_lessons(id, lesson_number, title),
        course_enrollments(user_id, role)
      `)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('SUPABASE ERROR:', coursesError);
      alert('Błąd ładowania kursów');
      setLoading(false);
      return;
    }

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email');

    const profilesMap = new Map(profilesData?.map(p => [p.id, p.email]) || []);

    if (coursesData) {
      const formatted = coursesData.map((c: any) => ({
        id: c.id,
        title: c.title,
        lessons: (c.course_lessons || []).sort((a: any, b: any) => a.lesson_number - b.lesson_number),
        enrollments: (c.course_enrollments || []).map((e: any) => ({
          user_id: e.user_id,
          email: profilesMap.get(e.user_id) || 'brak email',
          role: e.role
        }))
      }));
      setCourses(formatted);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: teachers } = await supabase.from('profiles').select('id, email').eq('role', 'TEACHER');
    const { data: students } = await supabase.from('profiles').select('id, email').eq('role', 'STUDENT');
    setAllTeachers(teachers || []);
    setAllStudents(students || []);
  };

  const updateLessonTitle = async (lessonId: string, newTitle: string) => {
    await supabase.from('course_lessons').update({ title: newTitle }).eq('id', lessonId);
    fetchAllData();
  };

  const addLesson = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const nextNum = course!.lessons.length + 1;
    await supabase.from('course_lessons').insert({
      course_id: courseId,
      lesson_number: nextNum,
      title: `Lekcja ${nextNum}`
    });
    fetchAllData();
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Usunąć lekcję?')) return;
    await supabase.from('course_lessons').delete().eq('id', lessonId);
    fetchAllData();
  };

  const addUserToCourse = async (courseId: string, userId: string, role: 'TEACHER' | 'STUDENT') => {
    const { data: existing } = await supabase
      .from('course_enrollments')
      .select()
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      alert('Ten użytkownik już jest zapisany!');
      return;
    }

    await supabase.from('course_enrollments').insert({
      course_id: courseId,
      user_id: userId,
      role
    });

    fetchAllData();
  };

  const removeUserFromCourse = async (courseId: string, userId: string) => {
    if (!confirm('Usunąć użytkownika z kursu?')) return;
    await supabase.from('course_enrollments').delete().eq('course_id', courseId).eq('user_id', userId);
    fetchAllData();
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('USUNĄĆ CAŁY KURS? To nieodwracalne!')) return;
    await supabase.from('courses').delete().eq('id', courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (openCourseId === courseId) setOpenCourseId(null);
  };

  const createNewCourse = async () => {
    if (!newCourseTitle.trim()) return alert('Podaj tytuł kursu!');
    if (selectedTeachers.length === 0) return alert('Wybierz przynajmniej jednego nauczyciela!');

    const { data: course } = await supabase
      .from('courses')
      .insert({ title: newCourseTitle, created_by: user.id })
      .select()
      .single();

    if (!course) return alert('Błąd tworzenia kursu');

    const lessonsToInsert = newLessons.map((l, i) => ({
      course_id: course.id,
      lesson_number: i + 1,
      title: l.title
    }));
    await supabase.from('course_lessons').insert(lessonsToInsert);

    const enrollments = [
      ...selectedTeachers.map(id => ({ course_id: course.id, user_id: id, role: 'TEACHER' as const })),
      ...selectedStudents.map(id => ({ course_id: course.id, user_id: id, role: 'STUDENT' as const }))
    ];
    if (enrollments.length > 0) {
      await supabase.from('course_enrollments').insert(enrollments);
    }

    alert('Kurs utworzony!');
    setShowCreateModal(false);
    setNewCourseTitle('');
    setNewLessons([
      { id: 'temp-1', lesson_number: 1, title: 'Lekcja 1' },
      { id: 'temp-2', lesson_number: 2, title: 'Lekcja 2' }
    ]);
    setSelectedTeachers([]);
    setSelectedStudents([]);
    fetchAllData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role="ADMIN" onLogout={handleLogout} />

      <main className="flex-1 p-1 pt-20 pb-8 px-4 sm:px-6 lg:px-8 md:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* Nagłówek */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-700">Zarządzanie kursami</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg sm:text-xl transition flex items-center justify-center gap-3 shadow-lg"
              >
                <Plus className="w-7 h-7" /> Nowy kurs
              </button>
            </div>
          </div>

          {/* Lista kursów */}
          {loading ? (
            <div className="text-center py-20 text-gray-500 text-xl">Ładowanie kursów...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-2xl">Brak kursów. Utwórz pierwszy!</div>
          ) : (
            <div className="space-y-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-indigo-400">

                  {/* Nagłówek kursu */}
                  <div
                    className="bg-linear-to-r from-indigo-600 to-purple-700 text-white p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:from-indigo-700 hover:to-purple-800 transition"
                    onClick={() => setOpenCourseId(openCourseId === course.id ? null : course.id)}
                  >
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold wrap-break-word pr-8">{course.title}</h2>
                      <p className="text-base sm:text-lg opacity-90 mt-2">
                        {course.lessons.length} lekcji • {course.enrollments.filter(e => e.role === 'TEACHER').length} nauczycieli •{' '}
                        {course.enrollments.filter(e => e.role === 'STUDENT').length} uczniów
                      </p>
                    </div>
                    <div className="self-end sm:self-center">
                      {openCourseId === course.id ? <ChevronUp className="w-10 h-10" /> : <ChevronDown className="w-10 h-10" />}
                    </div>
                  </div>

                  {/* Zawartość kursu (rozwijana) */}
                  {openCourseId === course.id && (
                    <div className="p-6 sm:p-8 bg-gray-50">

                      {/* Lekcje */}
                      <section className="mb-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h3 className="text-2xl font-bold text-indigo-800">Lekcje</h3>
                          <button
                            onClick={() => addLesson(course.id)}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold"
                          >
                            <Plus className="w-5 h-5" /> Dodaj lekcję
                          </button>
                        </div>

                        <div className="space-y-4">
                          {course.lessons.map(lesson => (
                            <div
                              key={lesson.id}
                              className="flex text-gray-500 flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-md"
                            >
                              <span className="font-bold text-indigo-700 min-w-24 text-center sm:text-left">
                                Lekcja {lesson.lesson_number}
                              </span>
                              <input
                                type="text"
                                defaultValue={lesson.title}
                                onBlur={(e) => updateLessonTitle(lesson.id, e.target.value)}
                                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 outline-none w-full"
                              />
                              <button
                                onClick={() => deleteLesson(lesson.id)}
                                className="text-red-600 hover:text-red-800 self-end sm:self-center"
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Uczestnicy */}
                      <section className="mb-10">
                        <h3 className="text-2xl font-bold text-indigo-800 mb-6">Uczestnicy</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                          {/* Nauczyciele */}
                          <div className="space-y-4">
                            <h4 className="text-xl font-bold text-green-700">Nauczyciele</h4>
                            <div className="space-y-3">
                              {course.enrollments
                                .filter(e => e.role === 'TEACHER')
                                .map(e => (
                                  <div
                                    key={e.user_id}
                                    className="flex text-gray-500 flex-col sm:flex-row justify-between items-start sm:items-center bg-green-50 p-4 rounded-lg gap-3"
                                  >
                                    <span className="font-medium text-gray-500 break-all">{e.email}</span>
                                    <button
                                      onClick={() => removeUserFromCourse(course.id, e.user_id)}
                                      className="text-red-600 font-bold"
                                    >
                                      Usuń
                                    </button>
                                  </div>
                                ))}
                            </div>
                            <select
                              onChange={(e) => e.target.value && addUserToCourse(course.id, e.target.value, 'TEACHER')}
                              className="w-full border-2 text-gray-500 border-green-400 rounded-lg px-4 py-3"
                              defaultValue=""
                            >
                              <option value="" disabled>+ Dodaj nauczyciela</option>
                              {allTeachers
                                .filter(t => !course.enrollments.some(e => e.user_id === t.id && e.role === 'TEACHER'))
                                .map(t => (
                                  <option key={t.id} value={t.id}>{t.email}</option>
                                ))}
                            </select>
                          </div>

                          {/* Uczniowie */}
                          <div className="space-y-4">
                            <h4 className="text-xl font-bold text-blue-700">
                              Uczniowie ({course.enrollments.filter(e => e.role === 'STUDENT').length})
                            </h4>
                            <div className="space-y-3">
                              {course.enrollments
                                .filter(e => e.role === 'STUDENT')
                                .map(e => (
                                  <div
                                    key={e.user_id}
                                    className="flex flex-col  sm:flex-row justify-between items-start sm:items-center bg-blue-50 p-4 rounded-lg gap-3"
                                  >
                                    <span className="font-medium text-gray-500 break-all">{e.email}</span>
                                    <button
                                      onClick={() => removeUserFromCourse(course.id, e.user_id)}
                                      className="text-red-600 font-bold"
                                    >
                                      Usuń
                                    </button>
                                  </div>
                                ))}
                            </div>
                            <select
                              onChange={(e) => e.target.value && addUserToCourse(course.id, e.target.value, 'STUDENT')}
                              className="w-full border-2 text-gray-500 border-blue-400 rounded-lg px-4 py-3"
                              defaultValue=""
                            >
                              <option value="" disabled>+ Dodaj ucznia</option>
                              {allStudents
                                .filter(s => !course.enrollments.some(e => e.user_id === s.id && e.role === 'STUDENT'))
                                .map(s => (
                                  <option key={s.id} value={s.id}>{s.email}</option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </section>

                      {/* Usuń kurs */}
                      <div className="pt-8 border-t-4 border-red-300 text-center sm:text-left">
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl text-lg sm:text-xl transition shadow-lg"
                        >
                          USUŃ CAŁY KURS
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL – teraz naprawdę responsywny */}
      {showCreateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl shadow-2xl w-full sm:max-w-3xl md:max-w-4xl mx-auto my-8 overflow-y-auto max-h-screen">
      <div className="p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-6 sm:mb-8 text-center">
          Nowy kurs
        </h2>

        <input
          type="text"
          placeholder="Tytuł kursu"
          value={newCourseTitle}
          onChange={e => setNewCourseTitle(e.target.value)}
          className="w-full sm:w-full border-2 text-gray-500 border-indigo-400 rounded-xl px-4 py-3 mb-6 sm:mb-8 focus:outline-none focus:border-indigo-600 text-lg sm:text-xl"
        />

        {/* Lekcje */}
        <div className="mb-6 text-gray-500 sm:mb-10 space-y-4">
          {newLessons.map((lesson, i) => (
            <div key={lesson.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <span className="font-bold text-indigo-700 text-center sm:text-left w-full sm:w-32">
                Lekcja {i + 1}
              </span>
              <input
                type="text"
                value={lesson.title}
                onChange={e =>
                  setNewLessons(prev =>
                    prev.map(l => (l.id === lesson.id ? { ...l, title: e.target.value } : l))
                  )
                }
                className="flex-1 w-full border-2 border-gray-300 rounded-lg px-4 py-2"
              />
              <button
                onClick={() => setNewLessons(prev => prev.filter(l => l.id !== lesson.id))}
                className="text-red-600 self-start sm:self-center mt-2 sm:mt-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setNewLessons(prev => [
                ...prev,
                { id: Date.now().toString(), lesson_number: prev.length + 1, title: `Lekcja ${prev.length + 1}` }
              ])
            }
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Dodaj lekcję
          </button>
        </div>

        {/* Uczestnicy */}
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setUserFilter('TEACHER')}
              className={`px-4 py-2 rounded-lg font-bold text-sm sm:text-base ${
                userFilter === 'TEACHER' ? 'bg-indigo-600 text-white' : 'bg-gray-300'
              }`}
            >
              Nauczyciele
            </button>
            <button
              onClick={() => setUserFilter('STUDENT')}
              className={`px-4 py-2 rounded-lg font-bold text-sm sm:text-base ${
                userFilter === 'STUDENT' ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}
            >
              Uczniowie
            </button>
          </div>

          <div className="max-h-72 sm:max-h-96 overflow-y-auto border-2 border-gray-300 rounded-xl p-4">
            {(userFilter === 'TEACHER' ? allTeachers : allStudents).map(u => (
              <label
                key={u.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 py-2 border-b last:border-0 w-full"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      userFilter === 'TEACHER'
                        ? selectedTeachers.includes(u.id)
                        : selectedStudents.includes(u.id)
                    }
                    onChange={e => {
                      if (userFilter === 'TEACHER') {
                        setSelectedTeachers(prev =>
                          e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                        );
                      } else {
                        setSelectedStudents(prev =>
                          e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                        );
                      }
                    }}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-gray-700 wrap-break-word">{u.email}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-4 mt-4 sm:mt-8">
          <button
            onClick={createNewCourse}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl"
          >
            Utwórz kurs
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="w-full sm:w-auto border-2 border-gray-400 text-gray-700 font-bold py-3 sm:py-4 px-6 rounded-xl hover:bg-gray-100"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  </div>
)}

     
    </div>
  );
}