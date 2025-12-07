// src/pages/teacher/ocenianie.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { User, FileText, ArrowRight, Files } from 'lucide-react';
import { CheckSquare } from 'lucide-react';

interface Submission {
  id: string;
  student_id: string;
  student_email: string;
  file_name: string;
  file_url: string;
  created_at: string;
  course_title: string;
  lesson_number: number;
  lesson_title: string;
}

export default function Ocenianie() {
  const [groupedByStudent, setGroupedByStudent] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const { data: subs, error } = await supabase
        .from('homework_submissions')
        .select('id, student_id, course_id, lesson_id, file_url, file_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!subs || subs.length === 0) {
        setGroupedByStudent({});
        setLoading(false);
        return;
      }

      const studentIds = [...new Set(subs.map(s => s.student_id))];
      const courseIds = [...new Set(subs.map(s => s.course_id))];
      const lessonIds = [...new Set(subs.map(s => s.lesson_id))];

      const [
        { data: profiles },
        { data: courses },
        { data: lessons }
      ] = await Promise.all([
        supabase.from('profiles').select('id, email').in('id', studentIds),
        supabase.from('courses').select('id, title').in('id', courseIds),
        supabase.from('course_lessons').select('id, lesson_number, title').in('id', lessonIds),
      ]);

      const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p.email]) || []);
      const courseMap = Object.fromEntries(courses?.map(c => [c.id, c.title]) || []);
      const lessonMap = Object.fromEntries(
        lessons?.map(l => [l.id, { number: l.lesson_number, title: l.title }]) || []
      );

      const formatted: Submission[] = subs.map(s => ({
        id: s.id,
        student_id: s.student_id,
        student_email: profileMap[s.student_id] || 'Nieznany',
        file_name: s.file_name,
        file_url: s.file_url,
        created_at: s.created_at,
        course_title: courseMap[s.course_id] || 'Nieznany kurs',
        lesson_number: lessonMap[s.lesson_id]?.number || 0,
        lesson_title: lessonMap[s.lesson_id]?.title || 'Nieznana lekcja',
      }));

      const grouped = formatted.reduce((acc, sub) => {
        if (!acc[sub.student_id]) acc[sub.student_id] = [];
        acc[sub.student_id].push(sub);
        return acc;
      }, {} as Record<string, Submission[]>);

      setGroupedByStudent(grouped);
    } catch (err: any) {
      console.error(err);
      alert('Błąd: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar user={null} role="TEACHER" onLogout={() => supabase.auth.signOut()} />
        <main className="flex-1 p-6 md:ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-600">Ładowanie zadań...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={null} role="TEACHER" onLogout={() => supabase.auth.signOut()} />

      <main className="flex-1 p-4 sm:p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
            {/* TEN SAM BOX CO W INNE STRONY – IDENTYCZNY STYL */}
          <div className="bg-white shadow rounded-2xl p-6 sm:p-8 mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <CheckSquare className="w-12 h-12 text-green-600 shrink-0" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-blue-700">
                  Ocenianie zadań domowych
                </h1>
                <p className="text-lg text-blue-800 mt-2">
                  Przeglądaj, oceniaj i komentuj prace oddane przez uczniów
                </p>
              </div>
            </div>
          </div>

          {Object.keys(groupedByStudent).length === 0 ? (
            <div className="text-center py-20">
              <Files className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl sm:text-2xl text-gray-500">Brak oddanych zadań domowych</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {Object.entries(groupedByStudent).map(([studentId, tasks]) => {
                const email = tasks[0].student_email;
                const totalTasks = tasks.length;

                return (
                  <div
                    key={studentId}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                  >
                    {/* Nagłówek z uczniem – klikalny */}
                    <Link
                      to={`/teacher/uczen/${studentId}`}
                      className="block p-5 sm:p-6 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-all">
                              {email}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                              {totalTasks} {totalTasks === 1 ? 'zadanie' : 'zadań'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-7 h-7 text-blue-600 shrink-0" />
                      </div>
                    </Link>

                    {/* Podgląd najnowszych zadań */}
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tasks.slice(0, 4).map(task => (
                          <a
                            key={task.id}
                            href={task.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm border border-gray-200"
                          >
                            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-600 truncate">{task.file_name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                L{task.lesson_number} – {task.course_title}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>

                      {totalTasks > 4 && (
                        <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                          i {totalTasks - 4} więcej → kliknij ucznia powyżej
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}