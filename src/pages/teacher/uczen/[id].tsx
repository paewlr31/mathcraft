// src/pages/teacher/uczen/[id].tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import { ArrowLeft, FileText, Calendar, User, Download } from 'lucide-react';

interface Task {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  course_title: string;
  lesson_number: number;
  lesson_title: string;
}

export default function StudentHomework() {
  const { id } = useParams<{ id: string }>();
  const [studentEmail, setStudentEmail] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadStudentData() {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', id)
          .single();
        setStudentEmail(profile?.email || 'Nieznany');

        const { data: subs } = await supabase
          .from('homework_submissions')
          .select('id, file_name, file_url, created_at, course_id, lesson_id')
          .eq('student_id', id)
          .order('created_at', { ascending: false });

        if (!subs || subs.length === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const courseIds = [...new Set(subs.map(s => s.course_id))];
        const lessonIds = [...new Set(subs.map(s => s.lesson_id))];

        const [{ data: courses }, { data: lessons }] = await Promise.all([
          supabase.from('courses').select('id, title').in('id', courseIds),
          supabase.from('course_lessons').select('id, lesson_number, title').in('id', lessonIds),
        ]);

        const courseMap = Object.fromEntries(courses?.map(c => [c.id, c.title]) || []);
        const lessonMap = Object.fromEntries(
          lessons?.map(l => [l.id, { number: l.lesson_number, title: l.title }]) || []
        );

        const enriched: Task[] = subs.map(s => ({
          id: s.id,
          file_name: s.file_name,
          file_url: s.file_url,
          created_at: s.created_at,
          course_title: courseMap[s.course_id] || 'Nieznany kurs',
          lesson_number: lessonMap[s.lesson_id]?.number || 0,
          lesson_title: lessonMap[s.lesson_id]?.title || 'Brak tytułu',
        }));

        enriched.sort((a, b) => {
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
    }

    loadStudentData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar user={null} role="TEACHER" onLogout={() => supabase.auth.signOut()} />
        <main className="flex-1 p-6 md:ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-600">Ładowanie...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={null} role="TEACHER" onLogout={() => supabase.auth.signOut()} />

      <main className="flex-1 p-4 sm:p-6 md:ml-64 overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <Link
            to="/teacher/ocenianie"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Wróć do listy uczniów
          </Link>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 sm:w-9 sm:h-9 text-blue-600" />
              </div>
              <div className="min-w-0 w-full sm:w-auto">
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800 break-words">
                  Zadania od: <span className="text-blue-600 block sm:inline mt-1 sm:mt-0">{studentEmail}</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-1">
                  {tasks.length} {tasks.length === 1 ? 'plik' : 'plików'} oddanych
                </p>
              </div>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow">
              <p className="text-lg sm:text-xl text-gray-500 px-4">Uczeń jeszcze nic nie oddał</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:hover:shadow-xl transition-all p-4 sm:p-5 border border-gray-200 hover:border-blue-300 group"
                >
                  <a
                    href={task.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0 mt-0.5" />
                    
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-semibold text-base sm:text-lg text-gray-800 group-hover:text-blue-600 break-all line-clamp-2">
                        {task.file_name}
                      </p>
                      
                      <div className="mt-1.5 sm:mt-2 space-y-1">
                        <p className="text-sm sm:text-base text-gray-600 break-words">
                          <span className="font-medium">{task.course_title}</span>
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 break-words">
                          <span className="text-gray-500">→ </span>
                          Lekcja {task.lesson_number}: {task.lesson_title}
                        </p>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-2 sm:mt-3">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {new Date(task.created_at).toLocaleString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>

                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}