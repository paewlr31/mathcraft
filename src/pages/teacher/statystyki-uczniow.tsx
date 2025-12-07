// src/pages/teacher/StatystykiUczniow.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';
import { ChevronDown, Users, TrendingUp, Award } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface StudentStats {
  student_id: string;
  email: string;
  total_points: number;
  max_points: number;
  submissions_count: number;
  average: number;
}

export default function StatystykiUczniow() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [students, setStudents] = useState<StudentStats[]>([]);
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

      const { data: taught } = await supabase
        .from('course_enrollments')
        .select('course_id, courses!inner(title)')
        .eq('user_id', authUser.id)
        .eq('role', 'TEACHER');

      const courseList: Course[] = taught?.map(t => ({
        id: t.course_id as string,
        title: (t.courses as any).title
      })) || [];

      setCourses(courseList);
      if (courseList.length > 0) {
        setSelectedCourseId(courseList[0].id);
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchStats = async () => {
      setLoading(true);

      const { data: studentsEnrolled } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', selectedCourseId)
        .eq('role', 'STUDENT');

      const studentIds = studentsEnrolled?.map(e => e.user_id) || [];

      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', studentIds);

      const { data: submissions } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          student_id,
          lesson_id,
          course_lessons!inner(max_homework_points)
        `)
        .eq('course_id', selectedCourseId)
        .in('student_id', studentIds);

      const { data: grades } = await supabase
        .from('homework_grades')
        .select('submission_id, points_given, points_possible')
        .in('submission_id', submissions?.map(s => s.id) || ['']);

      const gradeMap = new Map<string, { given: number; possible: number }>();
      grades?.forEach(g => {
        gradeMap.set(g.submission_id as string, {
          given: g.points_given,
          possible: g.points_possible
        });
      });

      const statsMap = new Map<string, StudentStats>();

      studentIds.forEach(id => {
        statsMap.set(id, {
          student_id: id,
          email: profiles?.find(p => p.id === id)?.email || 'brak@email.pl',
          total_points: 0,
          max_points: 0,
          submissions_count: 0,
          average: 0
        });
      });

      submissions?.forEach(sub => {
        const stats = statsMap.get(sub.student_id as string);
        if (!stats) return;

        const grade = gradeMap.get(sub.id as string);
        const maxPoints = (sub.course_lessons as any).max_homework_points || 10;

        stats.submissions_count += 1;
        stats.max_points += maxPoints;

        if (grade) {
          stats.total_points += grade.given;
        }
      });

      const final = Array.from(statsMap.values())
        .map(s => ({
          ...s,
          average: s.max_points > 0 ? Math.round((s.total_points / s.max_points) * 100) : 0
        }))
        .sort((a, b) => b.average - a.average);

      setStudents(final);
      setLoading(false);
    };

    fetchStats();
  }, [selectedCourseId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} role="TEACHER" onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-10 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-10 flex items-center gap-4">
            <Award className="w-12 h-12 text-yellow-500" />
            Statystyki uczniów
          </h1>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10">
            <label className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" /> Wybierz kurs
            </label>
            <div className="relative max-w-md">
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full text-gray-800 px-6 py-4 text-lg bg-white border-2 border-blue-300 rounded-xl focus:border-blue-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Wybierz kurs --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-5 w-6 h-6 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {!selectedCourseId && (
            <div className="bg-blue-50 rounded-3xl p-14 text-center">
              <Users className="w-24 h-24 text-blue-400 mx-auto mb-6 opacity-50" />
              <p className="text-2xl text-gray-700">Wybierz kurs, aby zobaczyć statystyki uczniów</p>
            </div>
          )}

          {loading && selectedCourseId && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-6 text-xl text-blue-600">Ładowanie statystyk...</p>
            </div>
          )}

          {selectedCourseId && !loading && students.length > 0 && (
            <>
              {/* MOBILE — zamiana tabeli na karty */}
              <div className="grid  md:hidden gap-4">
                {students.map(s => (
                  <div
                    key={s.student_id}
                    className="bg-white text-gray-800 shadow-lg rounded-2xl p-5 border border-gray-200"
                  >
                    <p className="font-bold text-gray-800 text-lg break-all">{s.email}</p>

                    <div className="mt-3 text-gray-700 space-y-1">
                      <p><b>Oddane:</b> {s.submissions_count}</p>
                      <p><b>Punkty:</b> {s.total_points} / {s.max_points}</p>
                    </div>

                    <div className="mt-4">
                      <div
                        className={`inline-block px-6 py-3 rounded-full text-white font-bold text-xl shadow
                          ${s.average >= 90 ? 'bg-green-600' :
                            s.average >= 70 ? 'bg-yellow-600' :
                            s.average >= 50 ? 'bg-orange-600' :
                            'bg-red-600'}`}
                      >
                        {s.average}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP — pełna tabela */}
              <div className="hidden md:block bg-white rounded-3xl shadow-2xl overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-6 text-left text-lg font-bold">Uczeń</th>
                        <th className="px-6 py-6 text-center">Oddane</th>
                        <th className="px-6 py-6 text-center">Punkty</th>
                        <th className="px-6 py-6 text-center">Max</th>
                        <th className="px-6 py-6 text-center text-2xl font-bold">Średnia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr
                          key={s.student_id}
                          className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}
                        >
                          <td className="px-6 py-5 font-medium text-gray-800 break-all">
                            {s.email}
                          </td>
                          <td className="px-6 py-5 text-center text-gray-600">
                            {s.submissions_count}
                          </td>
                          <td className="px-6 py-5 text-center font-semibold text-gray-700">
                            {s.total_points}
                          </td>
                          <td className="px-6 py-5 text-center text-gray-600">
                            {s.max_points}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div
                              className={`inline-block px-8 py-4 rounded-full text-white font-bold text-2xl shadow-lg
                                ${s.average >= 90 ? 'bg-green-600' :
                                  s.average >= 70 ? 'bg-yellow-600' :
                                  s.average >= 50 ? 'bg-orange-600' :
                                  'bg-red-600'}`}
                            >
                              {s.average}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedCourseId && !loading && students.length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-16 text-center">
              <TrendingUp className="w-20 h-20 text-yellow-500 mx-auto mb-6 opacity-70" />
              <p className="text-2xl font-bold text-yellow-800 mb-3">
                Brak ocenionych zadań
              </p>
              <p className="text-lg text-yellow-700">
                Uczniowie jeszcze nie oddali zadań lub nikt nie został oceniony
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
