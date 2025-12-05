import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import { FileText, Calendar, Download, CheckCircle2, XCircle } from 'lucide-react';

interface Submission {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  course_id: string;
  course_title: string;
  lesson_id: string | null;
  lesson_number: number;
  lesson_title: string;
  max_points: number;
  grade?: {
    points_given: number;
    points_possible: number;
    feedback: string | null;
    graded_at?: string;
  } | null;
}

export default function Zadania() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subs } = await supabase
        .from('homework_submissions')
        .select('id, file_name, file_url, created_at, course_id, lesson_id')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (!subs || subs.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      const courseIds = [...new Set(subs.map(s => s.course_id))];
      const lessonIds = [...new Set(subs.map(s => s.lesson_id).filter(Boolean))] as string[];

      const [{ data: courses }, { data: lessons }, { data: grades }] = await Promise.all([
        supabase.from('courses').select('id, title').in('id', courseIds),
        supabase.from('course_lessons').select('id, title, lesson_number, max_homework_points').in('id', lessonIds),
        supabase.from('homework_grades').select('*').in('submission_id', subs.map(s => s.id))
      ]);

      const courseMap = Object.fromEntries(courses?.map(c => [c.id, c.title]) || []);
      const lessonMap = Object.fromEntries(
        lessons?.map(l => [l.id, {
          title: l.title,
          number: l.lesson_number,
          max_points: l.max_homework_points || 10
        }]) || []
      );
      const gradeMap = Object.fromEntries(grades?.map(g => [g.submission_id, g]) || []);

      const formatted: Submission[] = subs.map(s => ({
        id: s.id,
        file_name: s.file_name,
        file_url: s.file_url,
        created_at: s.created_at,
        course_id: s.course_id,
        course_title: courseMap[s.course_id] || 'Nieznany kurs',
        lesson_id: s.lesson_id,
        lesson_number: lessonMap[s.lesson_id]?.number || 0,
        lesson_title: lessonMap[s.lesson_id]?.title || 'Brak tytułu',
        max_points: lessonMap[s.lesson_id]?.max_points || 10,
        grade: gradeMap[s.id] || null
      }));

      setSubmissions(formatted);
      setLoading(false);
    };

    load();
  }, []);

  // === STATYSTYKI ===
  const statsByLesson = submissions.reduce((acc, s) => {
    if (!s.lesson_id) return acc;
    const key = `${s.course_id}-${s.lesson_id}`;
    if (!acc[key]) {
      acc[key] = {
        course: s.course_title,
        lesson: `${s.lesson_number}. ${s.lesson_title}`,
        points: 0,
        max: 0,
        count: 0
      };
    }
    if (s.grade) {
      acc[key].points += s.grade.points_given;
      acc[key].max += s.grade.points_possible;
    } else {
      acc[key].max += s.max_points;
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const statsByCourse = submissions.reduce((acc, s) => {
    if (!acc[s.course_id]) {
      acc[s.course_id] = { title: s.course_title, points: 0, max: 0 };
    }
    if (s.grade) {
      acc[s.course_id].points += s.grade.points_given;
      acc[s.course_id].max += s.grade.points_possible;
    } else {
      acc[s.course_id].max += s.max_points;
    }
    return acc;
  }, {} as Record<string, any>);

  const totalPoints = Object.values(statsByCourse).reduce((sum: number, c: any) => sum + c.points, 0);
  const totalMax = Object.values(statsByCourse).reduce((sum: number, c: any) => sum + c.max, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar user={null} role="STUDENT" onLogout={() => supabase.auth.signOut()} />
        <main className="flex-1 p-6 md:ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-600">Ładowanie...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={null} role="STUDENT" onLogout={() => supabase.auth.signOut()} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Ten sam box co w "Moje lekcje" */}
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h1 className="text-3xl font-bold text-blue-700 mb-4">Moje zadania domowe</h1>
            <p className="text-lg text-blue-800">
              Łącznie zdobytych punktów:{' '}
              <span className="font-bold text-2xl text-green-600">
                {totalPoints} / {totalMax}
              </span>{' '}
              ({totalMax > 0 ? (totalPoints / totalMax * 100).toFixed(1) : 0}%)
            </p>
          </div>

          {/* Podsumowanie według lekcji */}
          {Object.values(statsByLesson).length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Punkty z poszczególnych lekcji</h2>
              <div className="space-y-3">
                {Object.values(statsByLesson).map((l: any) => (
                  <div key={l.lesson} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{l.course}</p>
                      <p className="text-sm text-gray-600">{l.lesson} ({l.count} {l.count === 1 ? 'zadanie' : 'zadania'})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">{l.points} / {l.max} pkt</p>
                      <p className="text-sm text-gray-500">
                        ({l.max > 0 ? (l.points / l.max * 100).toFixed(1) : 0}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista oddanych zadań */}
          {submissions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-xl text-gray-500">Nie oddałeś jeszcze żadnego zadania domowego</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <a
                      href={s.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 flex-1"
                    >
                      <FileText className="w-12 h-12 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-lg text-gray-800 break-all">{s.file_name}</p>
                        <p className="text-gray-600 mt-1">
                          {s.course_title} → Lekcja {s.lesson_number}: {s.lesson_title}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(s.created_at).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </a>

                    <div className="text-right md:text-center">
                      {s.grade ? (
                        <div>
                          {s.grade.points_given >= s.grade.points_possible * 0.6 ? (
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          ) : (
                            <XCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                          )}
                          <p className="text-2xl font-bold text-gray-800">
                            {s.grade.points_given} <span className="text-gray-400">/</span> {s.grade.points_possible}
                          </p>
                          {s.grade.feedback && (
                            <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto italic">
                              "{s.grade.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">Oczekuje na ocenę</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}