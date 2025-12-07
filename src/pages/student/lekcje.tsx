// src/pages/student/Lekcje.tsx (lub gdzie masz)
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar, FileText, Download, CheckCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  lesson_date: string; // np. "2025-12-07T14:30:00Z"
  recording_link?: string;
  quiz_pdf_url?: string;
  tasks_pdf_url?: string;
  answers_pdf_url?: string;
  homework_pdf_url?: string;
  homework_description?: string;
  course_title: string;
  is_past: boolean;
}

export default function Lekcje() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('STUDENT');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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

      if (userRole !== 'STUDENT') {
        alert('Ta strona jest tylko dla uczniów');
        return navigate('/');
      }

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', authUser.id)
        .eq('role', 'STUDENT');

      if (!enrollments || enrollments.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);

      const { data: rawLessons } = await supabase
        .from('course_lessons')
        .select(`
          id,
          title,
          lesson_date,
          recording_link,
          quiz_pdf_url,
          tasks_pdf_url,
          answers_pdf_url,
          homework_pdf_url,
          homework_description,
          course_id,
          courses!inner(title)
        `)
        .in('course_id', courseIds)
        .order('lesson_date', { ascending: true });

      if (!rawLessons) {
        setLessons([]);
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formatted: Lesson[] = rawLessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        lesson_date: l.lesson_date,
        recording_link: l.recording_link,
        quiz_pdf_url: l.quiz_pdf_url,
        tasks_pdf_url: l.tasks_pdf_url,
        answers_pdf_url: l.answers_pdf_url,
        homework_pdf_url: l.homework_pdf_url,
        homework_description: l.homework_description,
        course_title: l.courses.title,
        is_past: new Date(l.lesson_date) < today,
      }));

      setLessons(formatted);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // NOWA FUNKCJA – pokazuje dokładnie godzinę z bazy (UTC) bez przesunięcia
  const formatLessonDateTime = (dateStr: string) => {
    if (!dateStr) return 'Brak daty';

    // Bierzemy dokładnie to, co jest w bazie – np. "2025-12-07T14:30:00Z"
    const time = dateStr.substring(11, 16); // "14:30"
    const datePart = dateStr.substring(0, 10); // "2025-12-07"

    const date = new Date(datePart + 'T00:00:00'); // tylko data

    return `${format(date, 'EEEE, d MMMM yyyy', { locale: pl })} o ${time}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-2xl text-blue-700">Ładowanie lekcji...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} role={role} onLogout={handleLogout} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-8">
            Moje lekcje
          </h1>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <p className="text-2xl text-gray-700">Nie masz jeszcze żadnych lekcji</p>
              <p className="text-lg text-gray-500 mt-2">
                Zapisz się na kurs, a lekcje pojawią się tutaj
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {lessons.map(lesson => (
                <div
                  key={lesson.id}
                  className={`bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl ${
                    lesson.is_past ? 'opacity-90' : 'ring-4 ring-blue-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-semibold text-gray-800">
                          {formatLessonDateTime(lesson.lesson_date)}
                        </span>
                        {lesson.is_past ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            miniona
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            nadchodząca
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-blue-900 mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-lg text-purple-700 font-medium">
                        {lesson.course_title}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {lesson.recording_link && (
                        <a
                          href={lesson.recording_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Nagranie
                        </a>
                      )}

                      {lesson.quiz_pdf_url && (
                        <a
                          href={lesson.quiz_pdf_url}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <FileText className="w-5 h-5" />
                          Kartkówka
                        </a>
                      )}

                      {lesson.tasks_pdf_url && (
                        <a
                          href={lesson.tasks_pdf_url}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <FileText className="w-5 h-5" />
                          Zadania
                        </a>
                      )}

                      {lesson.answers_pdf_url && (
                        <a
                          href={lesson.answers_pdf_url}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                          <FileText className="w-5 h-5" />
                          Odpowiedzi
                        </a>
                      )}

                      {lesson.homework_pdf_url && (
                        <a
                          href={lesson.homework_pdf_url}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                          <Download className="w-5 h-5" />
                          Praca domowa
                        </a>
                      )}
                    </div>
                  </div>

                  {lesson.homework_description && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-medium text-orange-800">Opis pracy domowej:</p>
                      <p className="text-gray-700 mt-1">{lesson.homework_description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}