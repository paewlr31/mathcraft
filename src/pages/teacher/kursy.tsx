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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (profile?.role !== 'TEACHER') {
        alert('Dostęp tylko dla nauczycieli');
        return navigate('/');
      }

      await fetchMyCourses(authUser.id);
    };

    init();
  }, [navigate]);

  const fetchMyCourses = async (userId: string) => {
    setLoading(true);

    const { data: enrollments, error: err1 } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('role', 'TEACHER');

    if (err1 || !enrollments || enrollments.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);

    const { data: coursesData, error: err2 } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        course_lessons(count)
      `)
      .in('id', courseIds);

    if (err2 || !coursesData) {
      setCourses([]);
      setLoading(false);
      return;
    }

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

      <main className="flex-1 p-4 sm:p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* ŁADNY BIAŁY BOX Z NAGŁÓWKIM – TAK SAMO JAK W "MOI UCZNIOWIE" */}
          <div className="bg-white shadow rounded-2xl p-6 sm:p-8 mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">
              Moje kursy
            </h1>
            <p className="text-lg text-blue-800 mt-2">
              Tutaj znajdziesz wszystkie kursy, które prowadzisz.
            </p>
          </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/teacher/kursy/${course.id}`)}
                  className="bg-white rounded-2xl shadow-xl p-8 text-left hover:shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-purple-500 group text-center sm:text-left"
                >
                  <h2 className="text-2xl font-bold text-purple-700 mb-6 line-clamp-2">
                    {course.title}
                  </h2>

                  <div className="space-y-4 text-gray-600">
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium">{course.lessons_count} lekcji</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Users className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="font-medium">{course.students_count} uczniów</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <Users className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">{course.teachers_count} nauczycieli</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-end mt-8 text-purple-700 font-bold group-hover:text-purple-900">
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