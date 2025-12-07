// src/pages/teacher/Kalendarz.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';
import { format, isToday, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface CourseWithNextLesson {
  course_id: string;
  course_title: string;
  next_lesson_title: string | null;
  next_lesson_date: string | null;
}

export default function Kalendarz() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<CourseWithNextLesson[]>([]);
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

      if (profile?.role !== 'TEACHER') {
        alert('Dostęp tylko dla nauczycieli');
        return navigate('/');
      }

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id, courses!inner(id, title)')
        .eq('user_id', authUser.id)
        .eq('role', 'TEACHER');

      if (!enrollments || enrollments.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);
      const today = new Date().toISOString().split('T')[0];

      const { data: lessons } = await supabase
        .from('course_lessons')
        .select(`id, title, lesson_date, course_id`)
        .in('course_id', courseIds)
        .gte('lesson_date', today)
        .order('lesson_date', { ascending: true });

      const nextLessonMap = new Map();

      lessons?.forEach(lesson => {
        if (!nextLessonMap.has(lesson.course_id)) {
          nextLessonMap.set(lesson.course_id, {
            title: lesson.title,
            date: lesson.lesson_date
          });
        }
      });

      const result = enrollments.map(enrollment => {
        const next = nextLessonMap.get(enrollment.course_id);
        return {
          course_id: enrollment.course_id,
          course_title: (enrollment.courses as any).title,
          next_lesson_title: next?.title || null,
          next_lesson_date: next?.date || null
        };
      });

      result.sort((a, b) => {
        if (!a.next_lesson_date) return 1;
        if (!b.next_lesson_date) return -1;
        return a.next_lesson_date.localeCompare(b.next_lesson_date);
      });

      setCourses(result);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Brak daty';

  // Bierzemy tylko część daty i godziny (YYYY-MM-DDTHH:mm)
  const datePart = dateStr.substring(0, 10); // "2025-12-07"
  const timePart = dateStr.substring(11, 16); // "14:30"

  const date = new Date(`${datePart}T${timePart}:00`);

  const dayName = format(date, 'EEEE', { locale: pl });
  const dayMonth = format(date, 'd MMMM', { locale: pl });
  const year = format(date, 'yyyy', { locale: pl });

  const fullDate = `${dayName}, ${dayMonth} ${year}`;

  // Sprawdź, czy to dzisiaj (tylko po dacie, nie po czasie)
  const todayStr = new Date().toISOString().substring(0, 10);
  if (datePart === todayStr) {
    return `Dzisiaj – ${dayName}, ${dayMonth} ${year} o ${timePart}`;
  }

  return `${fullDate} o ${timePart}`;
};

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role="TEACHER" onLogout={handleLogout} />

      <main className="flex-1 p-6 md:p-12 ">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-blue-800 mb-12 flex items-center gap-5">
            <Calendar className="w-14 h-14 text-blue-600" />
            Kalendarz lekcji
          </h1>

          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-20 w-20 border-8 border-blue-600 border-t-transparent"></div>
              <p className="mt-8 text-2xl text-blue-700">Ładowanie...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-20 text-center">
              <AlertCircle className="w-28 h-28 text-gray-400 mx-auto mb-8" />
              <p className="text-3xl font-bold text-gray-700">Brak kursów lub lekcji</p>
              <p className="text-xl text-gray-500 mt-4">Nie prowadzisz żadnych kursów z nadchodzącymi lekcjami</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {courses.map((course) => (
                <div
                  key={course.course_id}
                  className={`relative bg-white rounded-3xl shadow-xl p-10 border-l-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]
                    ${course.next_lesson_date && isToday(parseISO(course.next_lesson_date))
                      ? 'border-green-500 ring-4 ring-green-200'
                      : 'border-blue-500'}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 pr-8">
                      {course.course_title}
                    </h3>
                    <BookOpen className="w-10 h-10 text-blue-600 shrink-0" />
                  </div>

                  {course.next_lesson_date ? (
                    <>
                      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 shadow-sm">
                        <p className="text-xl font-semibold text-blue-900">
                          {course.next_lesson_title}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xl">
                        <Clock className="w-7 h-7 text-blue-600" />
                        <span className="font-bold text-gray-800">
                          {formatDate(course.next_lesson_date)}
                        </span>
                      </div>

                      {isToday(parseISO(course.next_lesson_date)) && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg animate-pulse">
                          DZISIAJ!
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-lg italic text-center py-10">
                      Brak zaplanowanych lekcji
                    </p>
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
