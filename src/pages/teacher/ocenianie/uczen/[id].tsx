// src/pages/teacher/uczen/[id].tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar';
import { ArrowLeft, FileText, Calendar, User, Download, Edit2, Check, X } from 'lucide-react';

interface Submission {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  course_id: string;
  lesson_id: string | null;
  course_title: string;
  lesson_number: number;
  lesson_title: string;
  max_points: number;
  grade?: {
    points_given: number;
    points_possible: number;
    feedback: string | null;
    graded_at: string;
  } | null;
}

export default function StudentHomework() {
  const { id: studentId } = useParams<{ id: string }>();
  const [studentEmail, setStudentEmail] = useState('');
  const [tasks, setTasks] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pointsGiven, setPointsGiven] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', studentId)
        .single();
      setStudentEmail(profile?.email || 'Nieznany');

      const { data: subs } = await supabase
        .from('homework_submissions')
        .select('id, file_name, file_url, created_at, course_id, lesson_id')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (!subs || subs.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const courseIds = [...new Set(subs.map(s => s.course_id))];
      const lessonIds = [...new Set(subs.map(s => s.lesson_id).filter(Boolean))] as string[];

      const [{ data: courses }, { data: lessons }, { data: grades }] = await Promise.all([
        supabase.from('courses').select('id, title').in('id', courseIds),
        supabase.from('course_lessons').select('id, lesson_number, title, max_homework_points').in('id', lessonIds),
        supabase.from('homework_grades').select('*').in('submission_id', subs.map(s => s.id))
      ]);

      const courseMap = Object.fromEntries(courses?.map(c => [c.id, c.title]) || []);
      const lessonMap = Object.fromEntries(
        lessons?.map(l => [l.id, { number: l.lesson_number, title: l.title, max_points: l.max_homework_points || 10 }]) || []
      );
      const gradeMap = Object.fromEntries(grades?.map(g => [g.submission_id, g]) || []);

      const enriched: Submission[] = subs.map(s => ({
        id: s.id,
        file_name: s.file_name,
        file_url: s.file_url,
        created_at: s.created_at,
        course_id: s.course_id,
        lesson_id: s.lesson_id,
        course_title: courseMap[s.course_id] || 'Nieznany kurs',
        lesson_number: lessonMap[s.lesson_id]?.number || 0,
        lesson_title: lessonMap[s.lesson_id]?.title || 'Brak tytułu',
        max_points: lessonMap[s.lesson_id]?.max_points || 10,
        grade: gradeMap[s.id] || null
      }));

      enriched.sort((a, b) => {
        const aUngraded = !a.grade || typeof (a.grade as any).points_given !== 'number';
        const bUngraded = !b.grade || typeof (b.grade as any).points_given !== 'number';
        if (aUngraded !== bUngraded) return aUngraded ? -1 : 1;
        if (a.course_title !== b.course_title) return a.course_title.localeCompare(b.course_title);
        if (a.lesson_number !== b.lesson_number) return a.lesson_number - b.lesson_number;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTasks(enriched);
    } catch (err) {
      console.error(err);
      alert('Błąd ładowania danych');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeOrUpdate = async (submissionId: string) => {
    const points = parseInt(pointsGiven);
    if (isNaN(points) || points < 0) return alert('Podaj poprawną liczbę punktów');

    const task = tasks.find(t => t.id === submissionId);
    if (!task) return;

    const payload = {
      submission_id: submissionId,
      teacher_id: (await supabase.auth.getUser()).data.user?.id,
      points_given: points,
      points_possible: task.max_points,
      feedback: feedback || null
    };

    const { error } = await supabase
      .from('homework_grades')
      .upsert(payload, { onConflict: 'submission_id' });

    if (error) {
      alert('Błąd zapisu oceny');
      console.error(error);
    } else {
      loadData();
      setEditingId(null);
      setPointsGiven('');
      setFeedback('');
    }
  };

  const startEdit = (task: Submission) => {
    if (!task.grade) return;
    setEditingId(task.id);
    setPointsGiven(task.grade.points_given.toString());
    setFeedback(task.grade.feedback || '');
  };

  const statsByLesson = tasks.reduce((acc, t) => {
    if (!t.lesson_id) return acc;
    const key = `${t.course_id}-${t.lesson_id}`;
    if (!acc[key]) acc[key] = { course: t.course_title, lesson: `${t.lesson_number}. ${t.lesson_title}`, points: 0, max: 0, count: 0 };
    if (t.grade) { acc[key].points += t.grade.points_given; acc[key].max += t.grade.points_possible; } 
    else acc[key].max += t.max_points;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const statsByCourse = tasks.reduce((acc, t) => {
    if (!acc[t.course_id]) acc[t.course_id] = { title: t.course_title, points: 0, max: 0 };
    if (t.grade) { acc[t.course_id].points += t.grade.points_given; acc[t.course_id].max += t.grade.points_possible; } 
    else acc[t.course_id].max += t.max_points;
    return acc;
  }, {} as Record<string, any>);

  const totalPoints = Object.values(statsByCourse).reduce((sum: number, c: any) => sum + c.points, 0);
  const totalMax = Object.values(statsByCourse).reduce((sum: number, c: any) => sum + c.max, 0);
  const totalPercent = totalMax > 0 ? (totalPoints / totalMax * 100).toFixed(1) : 0;

  if (loading) return <div className="flex min-h-screen items-center justify-center">Ładowanie...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={null} role="TEACHER" onLogout={() => supabase.auth.signOut()} />
      <main className="flex-1 p-4 sm:p-6 md:ml-64">
        <div className="max-w-5xl mx-auto">

          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-600 mt-1 lg:text-4xl font-bold">
                  Zadania od: <span className="text-blue-600">{studentEmail}</span>
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Razem: <strong>{totalPoints} / {totalMax} pkt</strong> ({totalPercent}%)
                </p>
              </div>
            </div>
          </div>

          <Link to="/teacher/ocenianie" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="w-5 h-5" /> Wróć
          </Link>

          {Object.values(statsByLesson).length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl text-gray-600 mt-1 font-bold mb-4">Podsumowanie według lekcji</h2>
              <div className="space-y-3">
                {Object.values(statsByLesson).map((s: any) => (
                  <div key={s.lesson} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-600 mt-1">{s.course}</p>
                      <p className="text-sm text-gray-600">{s.lesson}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-600 mt-1 text-lg">{s.points} / {s.max} pkt</p>
                      <p className="text-sm text-gray-500">({s.max > 0 ? (s.points / s.max * 100).toFixed(1) : 0}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl shadow hover:shadow-xl transition p-5 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                  <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-start gap-4">
                    <FileText className="w-10 h-10 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-600 mt-1 text-lg break-all">{task.file_name}</p>
                      <p className="text-gray-600">{task.course_title} → Lekcja {task.lesson_number}: {task.lesson_title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.created_at).toLocaleString('pl-PL')}
                      </p>
                    </div>
                    <Download className="w-6 h-6 text-gray-400" />
                  </a>

                  <div className="text-right mt-2 sm:mt-0">
                    {editingId === task.id ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                        <input
                          type="number"
                          min="0"
                          max={task.max_points}
                          value={pointsGiven}
                          onChange={(e) => setPointsGiven(e.target.value)}
                          className="w-full sm:w-20 px-3 text-gray-600 py-2 border rounded-lg text-center"
                          autoFocus
                        />
                        <textarea
                          placeholder="Komentarz (opcjonalny)"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full sm:w-auto text-sm text-gray-600 border rounded px-2 py-1"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <button onClick={() => handleGradeOrUpdate(task.id)} className="text-green-600">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => { setEditingId(null); setPointsGiven(''); setFeedback(''); }} className="text-red-600">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : task.grade ? (
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-bold text-2xl text-green-600">
                            {task.grade.points_given} / {task.grade.points_possible}
                          </p>
                          {task.grade.feedback && <p className="text-sm text-gray-600 mt-1">{task.grade.feedback}</p>}
                          <p className="text-xs text-gray-400">
                            oceniono {new Date(task.grade.graded_at).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit(task)}
                          className="text-blue-600 hover:text-blue-800 mt-2"
                          title="Popraw ocenę"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(task.id);
                          setPointsGiven(task.max_points.toString());
                          setFeedback('');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" /> Oceń
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow">
              <p className="text-xl text-gray-500">Uczeń jeszcze nic nie oddał</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
