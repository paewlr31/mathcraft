// src/pages/student/kursy/[id].tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

import {
  ArrowLeft,
  Link2,
  FileText,
  Calendar,
  Upload,
  CheckCircle,
} from 'lucide-react';

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  recording_link: string | null;
  description: string | null;
  quiz_pdf_url: string | null;
  tasks_pdf_url: string | null;
  answers_pdf_url: string | null;
  homework_pdf_url: string | null;
  homework_description: string | null;
  lesson_date: string | null;
}

export default function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Nowe: śledzimy, które lekcje uczeń już oddał
  const [submittedLessonIds, setSubmittedLessonIds] = useState<Set<string>>(new Set());

  // Upload
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);
      await fetchCourseData(user.id);
    };

    init();
  }, [id, navigate]);
  // Pokazuje dokładny czas z bazy (UTC) bez przesunięcia
  const formatLessonDateTime = (dateStr: string) => {
    if (!dateStr) return 'Brak daty';

    // z bazy np. "2025-12-07T14:30:00Z"
    const time = dateStr.substring(11, 16); // "14:30"
    const datePart = dateStr.substring(0, 10); // "2025-12-07"

    const date = new Date(datePart + 'T00:00:00'); // tylko data

    return `${format(date, 'EEEE, d MMMM yyyy', { locale: pl })} o ${time}`;
  };

  const fetchCourseData = async (currentUserId: string) => {
    setLoading(true);
    try {
      // Kurs
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('title')
        .eq('id', id)
        .single();
      if (courseError) throw courseError;

      // Lekcje
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', id)
        .order('lesson_number');
      if (lessonsError) throw lessonsError;

      // Nauczyciel
      const { data: teacherEnrollment } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', id)
        .eq('role', 'TEACHER')
        .single();

      if (teacherEnrollment) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', teacherEnrollment.user_id)
          .single();
        setTeacherName(profile?.email.split('@')[0] || 'Nauczyciel');
      }

      setCourse(courseData);
      setLessons(lessonsData || []);

      // Które zadania już oddane?
      const { data: submissions } = await supabase
        .from('homework_submissions')
        .select('lesson_id')
        .eq('student_id', currentUserId)
        .eq('course_id', id);

      const submitted = new Set(submissions?.map(s => s.lesson_id) || []);
      setSubmittedLessonIds(submitted);

    } catch (err) {
      console.error(err);
      alert('Nie udało się załadować kursu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(e.target.files);
  };

  const uploadHomework = async (lessonId: string) => {
    if (!selectedFiles || selectedFiles.length === 0 || !userId) {
      alert('Wybierz plik(i)');
      return;
    }

    setUploadingLessonId(lessonId);

    try {
      const promises = Array.from(selectedFiles).map(async (file, i) => {
        const ext = file.name.split('.').pop();
        const fileName = `${userId}/${id}/${lessonId}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('homework')
          .upload(fileName, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('homework')
          .getPublicUrl(fileName);

        await supabase.from('homework_submissions').insert({
          student_id: userId,
          course_id: id,
          lesson_id: lessonId,
          file_url: urlData.publicUrl,
          file_name: file.name,
        });
      });

      await Promise.all(promises);

      // Oznacz jako oddane
      setSubmittedLessonIds(prev => new Set(prev).add(lessonId));
      setSelectedFiles(null);
      alert('Zadanie domowe oddane pomyślnie!');
    } catch (err) {
      console.error(err);
      alert('Błąd podczas wysyłania');
    } finally {
      setUploadingLessonId(null);
    }
  };

  if (loading) return <div className="p-16 text-center text-xl">Ładowanie kursu...</div>;
  if (!course) return <div className="p-16 text-center text-red-600">Kurs nie znaleziony</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={null} role="STUDENT" onLogout={() => supabase.auth.signOut()} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/student/kursy')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 text-lg"
          >
            <ArrowLeft className="w-5 h-5" /> Wróć do moich kursów
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-10 mb-10">
            <h1 className="text-5xl font-extrabold text-purple-700 mb-4">{course.title}</h1>
            <p className="text-xl text-gray-700">
              Prowadzący: <strong>{teacherName}</strong>
            </p>
          </div>

          <h2 className="text-4xl font-bold text-blue-800 mb-10">Lekcje</h2>

          <div className="space-y-12">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-3xl shadow-xl p-10 border-4 border-purple-300"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-purple-700">
                      Lekcja {lesson.lesson_number}: {lesson.title}
                    </h3>
                    {lesson.lesson_date && (
                      <p className="text-lg text-gray-600 mt-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {formatLessonDateTime(lesson.lesson_date)}
                      </p>
                    )}

                  </div>
                </div>

                {/* Materiały lekcji */}
                <div className="space-y-6 text-gray-600">
                  {lesson.recording_link && (
                    <div className="bg-blue-50 text-gray-600 p-6 rounded-xl">
                      <strong className="flex items-center gap-2 text-blue-900 text-lg">
                        <Link2 className="w-6 h-6" /> Nagranie z lekcji
                      </strong>
                      <a href={lesson.recording_link} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline mt-2 inline-block">
                        Otwórz nagranie →
                      </a>
                    </div>
                  )}

                  {lesson.description && (
                    <div className="bg-gray-50 text-gray-600 p-6 rounded-xl">
                      <strong className="flex items-center gap-2 text-gray-900 text-lg">
                        <FileText className="w-6 h-6" /> Opis lekcji
                      </strong>
                      <p className="mt-3 text-gray-700 whitespace-pre-wrap">{lesson.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {lesson.quiz_pdf_url && (
                      <a href={lesson.quiz_pdf_url} target="_blank" className="btn-green">
                        <CheckCircle className="w-6 h-6 text-gray-600" /> Quiz PDF
                      </a>
                    )}
                    {lesson.tasks_pdf_url && (
                      <a href={lesson.tasks_pdf_url} target="_blank" className="btn-green">
                        <CheckCircle className="w-6 h-6 text-gray-600" /> Zadania PDF
                      </a>
                    )}
                    {lesson.answers_pdf_url && (
                      <a href={lesson.answers_pdf_url} target="_blank" className="btn-green">
                        <CheckCircle className="w-6 h-6 text-gray-600" /> Odpowiedzi PDF
                      </a>
                    )}
                    {lesson.homework_pdf_url && (
                      <a href={lesson.homework_pdf_url} target="_blank" className="btn-green">
                        <CheckCircle className="w-6 h-6 text-gray-600" /> Zadanie domowe PDF
                      </a>
                    )}
                  </div>

                  {/* ZADANIE DOMOWE – TYLKO RAZ! */}
                  {(lesson.homework_pdf_url || lesson.homework_description) && (
                    <div className="mt-10 p-8 rounded-2xl border-4 
                      ${submittedLessonIds.has(lesson.id) 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-yellow-400 bg-yellow-50'}"
                    >
                      <h4 className="text-2xl font-bold mb-6 
                        ${submittedLessonIds.has(lesson.id) ? 'text-green-800' : 'text-yellow-900'}"
                      >
                        {submittedLessonIds.has(lesson.id) ? 'Zadanie oddane' : 'Zadanie domowe do oddania'}
                      </h4>

                      {submittedLessonIds.has(lesson.id) ? (
                        // JUŻ ODDANE
                        <div className="text-green-700 flex items-center gap-3 text-lg">
                          <CheckCircle className="w-8 h-8" />
                          <div>
                            <p className="font-bold">Zadanie zostało już oddane</p>
                            <p className="text-sm opacity-80">Oczekuje na sprawdzenie przez nauczyciela</p>
                          </div>
                        </div>
                      ) : (
                        // JESZCZE NIE ODDANE
                        <>
                          {lesson.homework_description && (
                            <p className="text-gray-800 mb-6 whitespace-pre-wrap bg-white p-5 rounded-xl">
                              {lesson.homework_description}
                            </p>
                          )}

                          <div className="space-y-5">
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                              className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:bg-orange-600 file:text-white file:border-0 hover:file:bg-orange-700"
                            />

                            {selectedFiles && (
                              <p className="text-sm text-gray-600">
                                Wybrano {selectedFiles.length} plik(ów)
                              </p>
                            )}

                            <button
                              onClick={() => uploadHomework(lesson.id)}
                              disabled={uploadingLessonId === lesson.id || !selectedFiles}
                              className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 flex items-center gap-3 text-lg"
                            >
                              {uploadingLessonId === lesson.id ? (
                                <>Wysyłanie...</>
                              ) : (
                                <>
                                  <Upload className="w-6 h-6" />
                                  Oddaj zadanie (tylko raz!)
                                </>
                              )}
                            </button>

                            <p className="text-sm text-red-600 font-medium">
                              Uwaga: Zadanie możesz oddać tylko jeden raz. Sprawdź pliki przed wysłaniem!
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}