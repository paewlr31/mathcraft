// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import type { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('STUDENT');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>({});
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [pendingHomeworks, setPendingHomeworks] = useState<any[]>([]);
  const [enrolledCourseCount, setEnrolledCourseCount] = useState(0);

  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return navigate('/login');

      setUser(authUser);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      const userRole = profile?.role || 'STUDENT';
      setRole(userRole);

      if (userRole === 'ADMIN') {
      const [studentsRes, teachersRes, coursesRes, submissionsRes, gradedRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'STUDENT'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'TEACHER'),
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('homework_submissions').select('id', { count: 'exact' }),
        supabase.from('homework_grades').select('submission_id')
      ]);

      const gradedIds = new Set(gradedRes.data?.map(g => g.submission_id) || []);
      const pendingCount = (submissionsRes.count || 0) - gradedIds.size;

      setStats({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        pendingHomeworks: pendingCount > 0 ? pendingCount : 0,
      });


      } else if (userRole === 'TEACHER') {
        const { data: taught } = await supabase
          .from('course_enrollments')
          .select('course_id, courses(title)')
          .eq('user_id', authUser.id)
          .eq('role', 'TEACHER');

        const courseIds = taught?.map((c: any) => c.course_id) || [];

        const { data: lessons } = await supabase
          .from('course_lessons')
          .select('id, title, lesson_date, course_id, courses(title)')
          .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-0000-000000000000'])
          .gte('lesson_date', new Date().toISOString().split('T')[0])
          .order('lesson_date', { ascending: true })
          .limit(6);

        const { data: allSubmissions } = await supabase
          .from('homework_submissions')
          .select('id, file_name, file_url, created_at, student_id, lesson_id, course_id')
          .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-0000-000000000000'])
          .order('created_at', { ascending: false });

        const { data: gradedSubmissions } = await supabase
          .from('homework_grades')
          .select('submission_id');

        const gradedIds = new Set(gradedSubmissions?.map(g => g.submission_id) || []);
        const ungraded = allSubmissions?.filter(sub => !gradedIds.has(sub.id)) || [];

        const pending = await Promise.all(
          ungraded.slice(0, 10).map(async (sub) => {
            const { data: student } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', sub.student_id)
              .single();

            const { data: lesson } = await supabase
              .from('course_lessons')
              .select('title, courses(title)')
              .eq('id', sub.lesson_id)
              .single();

            return {
              ...sub,
              profiles: student,
              course_lessons: lesson
            };
          })
        );

        setUpcomingLessons(lessons || []);
        setPendingHomeworks(pending);

      } else {
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('user_id', authUser.id)
          .eq('role', 'STUDENT');

        const courseIds = enrollments?.map(e => e.course_id) || [];
        setEnrolledCourseCount(courseIds.length);

        const { data: lessons } = await supabase
          .from('course_lessons')
          .select(`
            id,
            title,
            lesson_date,
            course_id,
            courses!inner(title)
          `)
          .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-0000-000000000000'])
          .gte('lesson_date', new Date().toISOString().split('T')[0])
          .order('lesson_date', { ascending: true })
          .limit(8);

        const { data: homeworkLessons } = await supabase
          .from('course_lessons')
          .select(`
            id,
            title,
            homework_pdf_url,
            homework_description,
            lesson_date,
            course_id,
            courses!inner(title)
          `)
          .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-0000-000000000000'])
          .gte('lesson_date', new Date().toISOString().split('T')[0])
          .not('homework_pdf_url', 'is', null);

        const { data: submitted } = await supabase
          .from('homework_submissions')
          .select('lesson_id')
          .eq('student_id', authUser.id)
          .in('lesson_id', homeworkLessons?.map(l => l.id) || []);

        const submittedLessonIds = new Set(submitted?.map(s => s.lesson_id));
        const trulyPending = homeworkLessons?.filter(l => !submittedLessonIds.has(l.id)) || [];

        const { data: grades } = await supabase
          .from('homework_grades')
          .select(`
            points_given,
            points_possible,
            graded_at,
            homework_submissions!inner (
              course_id,
              lesson_id,
              courses!inner(title)
            )
          `)
          .eq('homework_submissions.student_id', authUser.id)
          .order('graded_at', { ascending: false })
          .limit(5);

        setUpcomingLessons(lessons || []);
        setPendingHomeworks(trulyPending);
        setRecentGrades(grades || []);
      }

      setLoading(false);
    };

    fetchAllData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // NOWA FUNKCJA – formatuje datę z godziną i minutami
 const formatWithTime = (dateStr: string | null) => {
  if (!dateStr) return 'Brak daty';
  const time = dateStr.substring(11, 16);
  const datePart = dateStr.substring(0, 10);
  const [year, month, day] = datePart.split('-');
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return `${format(date, 'd MMMM yyyy', { locale: pl })} o ${time}`;
};

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl text-blue-700">Ładowanie dashboardu...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} role={role} onLogout={handleLogout} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-8">
            Witaj w Mathcraft, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>

          {role === 'ADMIN' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Uczniowie" value={stats.totalStudents} color="blue" />
            <StatCard title="Nauczyciele" value={stats.totalTeachers} color="green" />
            <StatCard title="Kursy" value={stats.totalCourses} color="purple" />
            <StatCard title="Prace do sprawdzenia" value={stats.pendingHomeworks} color="yellow" />
          </div>

          )}

          {/* NAUCZYCIEL – z godzinami */}
          {role === 'TEACHER' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nadchodzące lekcje</h2>
                {upcomingLessons.length === 0 ? (
                  <p className="text-gray-500">Brak zaplanowanych lekcji</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingLessons.map(lesson => (
                      <div key={lesson.id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
                        <p className="font-semibold text-gray-700 text-lg">{lesson.courses.title}</p>
                        <p className="text-gray-700">{lesson.title}</p>
                        <p className="text-sm text-blue-600 mt-2">
                          {formatWithTime(lesson.lesson_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Prace do sprawdzenia</h2>
                {pendingHomeworks.length === 0 ? (
                  <p className="text-green-600 font-medium">Wszystko sprawdzone!</p>
                ) : (
                  <div className="space-y-3">
                    {pendingHomeworks.map(hw => (
                      <div key={hw.id} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="font-medium">{hw.profiles?.email || 'Uczeń'}</p>
                        <p className="text-sm text-gray-600">{hw.course_lessons?.title || 'Lekcja'}</p>
                        <p className="text-sm text-gray-500 truncate">{hw.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(hw.created_at), 'd MMM yyyy HH:mm', { locale: pl })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UCZEŃ – z godzinami */}
          {role === 'STUDENT' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Twoje kursy" value={enrolledCourseCount} color="indigo" />
                <StatCard title="Zadania do oddania" value={pendingHomeworks.length} color="orange" />
                <StatCard title="Ostatnie oceny" value={recentGrades.length} color="emerald" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Najbliższe lekcje i zadania</h2>
                  {(upcomingLessons.length === 0 && pendingHomeworks.length === 0) ? (
                    <p className="text-gray-500">Brak nadchodzących aktywności</p>
                  ) : (
                    <div className="space-y-4">
                      {[...upcomingLessons, ...pendingHomeworks]
                        .sort((a, b) => new Date(a.lesson_date || '').getTime() - new Date(b.lesson_date || '').getTime())
                        .slice(0, 8)
                        .map(item => (
                          <div key={item.id} className="bg-white p-5 rounded-xl shadow">
                            <p className="font-semibold text-gray-700">{item.courses?.title || 'Kurs'}</p>
                            <p className="text-gray-700 text-sm">
                              {item.homework_pdf_url ? 'Zadanie domowe: ' : ''}{item.title}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              {item.lesson_date
                                ? formatWithTime(item.lesson_date)
                                : 'Do oddania wkrótce'}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Ostatnie oceny</h2>
                  {recentGrades.length === 0 ? (
                    <p className="text-gray-500">Brak ocen</p>
                  ) : (
                    <div className="space-y-3">
                      {recentGrades.map(g => (
                        <div key={g.submission_id || g.homework_submissions.lesson_id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="font-medium">{g.homework_submissions.courses.title}</p>
                          <p className="text-2xl font-bold text-green-700">
                            {g.points_given} / {g.points_possible} pkt
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(g.graded_at), 'd MMM yyyy', { locale: pl })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className={`text-white rounded-2xl shadow-lg p-6 ${colors[color] || 'bg-blue-500'}`}>
      <p className="text-lg opacity-90">{title}</p>
      <p className="text-4xl font-extrabold mt-2">{value}</p>
    </div>
  );
}