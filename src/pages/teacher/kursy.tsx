// src/pages/teacher/kursy.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { BookOpen, Users, Calendar, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  lessons_count: number;
  students_count: number;
  teachers_count: number;
}

export default function KursyTeacher() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return navigate('/login');

      setUser(authUser);

      // Sprawdź, czy użytkownik ma rolę TEACHER
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (profile?.role !== 'TEACHER') {
        alert('Dostęp tylko dla nauczycieli');
        return navigate('/');
      }

      // ← Teraz poprawnie przekazujemy ID użytkownika, nie "role"
      await fetchMyCourses(authUser.id);
      console.log('Aktualne user.id:', authUser.id);
    };

    init();
  }, [navigate]);

  const fetchMyCourses = async (userId: string) => {
    setLoading(true);

    // 1. Znajdź wszystkie kursy, w których bieżący użytkownik ma rolę TEACHER
    const { data: enrollments, error: err1 } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)           // ← tutaj musi być ID użytkownika!
      .eq('role', 'TEACHER');

    console.log('Enrollments (nauczyciel):', enrollments);
    

    if (err1) {
      console.error('Błąd enrollments:', err1);
      setCourses([]);
      setLoading(false);
      return;
    }

    if (!enrollments || enrollments.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);

    // 2. Pobierz podstawowe dane kursów + liczba lekcji
    const { data: coursesData, error: err2 } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        course_lessons(count)
      `)
      .in('id', courseIds);

    if (err2 || !coursesData) {
      console.error('Błąd pobierania kursów:', err2);
      setCourses([]);
      setLoading(false);
      return;
    }

    // 3. Policz uczniów i nauczycieli dla każdego kursu
    const { data: allEnrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, role')
      .in('course_id', courseIds);

    const statsMap = new Map<string, { students: number; teachers: number }>();
    allEnrollments?.forEach(e => {
      const stats = statsMap.get(e.course_id) || { students: 0, teachers: 0 };
      if (e.role === 'STUDENT') stats.students++;
      if (e.role === 'TEACHER') stats.teachers++;
      statsMap.set(e.course_id, stats);
    });

    // 4. Połącz wszystko w jedną tablicę
    const formattedCourses: Course[] = coursesData.map(c => {
      const stats = statsMap.get(c.id) || { students: 0, teachers: 0 };
      return {
        id: c.id,
        title: c.title,
        lessons_count: c.course_lessons[0]?.count || 0,
        students_count: stats.students,
        teachers_count: stats.teachers,
      };
    });

    setCourses(formattedCourses);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role="TEACHER" onLogout={handleLogout} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-800 mb-10">Moje kursy</h1>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-600">Ładowanie kursów...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
              <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <p className="text-2xl text-gray-700 mb-4">
                Nie jesteś jeszcze przypisany do żadnego kursu
              </p>
              <p className="text-lg text-gray-500">
                Skontaktuj się z administratorem
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/teacher/kursy/${course.id}`)}
                  className="bg-white rounded-2xl shadow-xl p-8 text-left hover:shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-purple-500 group"
                >
                  <h2 className="text-2xl font-bold text-purple-700 mb-6">
                    {course.title}
                  </h2>

                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                      <span className="font-medium">{course.lessons_count} lekcji</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-green-600" />
                      <span className="font-medium">{course.students_count} uczniów</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-600" />
                      <span className="font-medium">{course.teachers_count} nauczycieli</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-8 text-purple-700 font-bold group-hover:text-purple-900">
                    Przejdź do kursu
                    <ChevronRight className="w-8 h-8 ml-2 group-hover:translate-x-2 transition" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}