// src/pages/student/kursy/[id].tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // stany do uploadu
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUserId(user?.id || null);
      });
    };
    getUser();
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('title')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', id)
        .order('lesson_number');

      if (lessonsError) throw lessonsError;

      // nauczyciel
      const { data: teacherEnrollment } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', id)
        .eq('role', 'TEACHER')
        .limit(1)
        .single();

      if (teacherEnrollment) {
        const { data: teacherProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', teacherEnrollment.user_id)
          .single();

        setTeacherName(teacherProfile?.email.split('@')[0] || 'Nauczyciel');
      }

      setCourse(courseData);
      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Błąd ładowania kursu:', error);
      alert('Nie udało się załadować kursu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const uploadHomework = async (lessonId: string) => {
    if (!selectedFiles || selectedFiles.length === 0 || !userId) {
      alert('Wybierz przynajmniej jedno zdjęcie/plik');
      return;
    }

    setUploadingLessonId(lessonId);
    setUploadProgress(0);

    const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${id}/${lessonId}/${Date.now()}_${index}.${fileExt}`;

      const { error } = await supabase.storage
        .from('homework')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // zapisujemy rekord w tabeli homework_submissions
      const { data: urlData } = supabase.storage.from('homework').getPublicUrl(fileName);

      await supabase.from('homework_submissions').insert({
        student_id: userId,
        course_id: id,
        lesson_id: lessonId,
        file_url: urlData.publicUrl,
        file_name: file.name,
      });
    });

    try {
      await Promise.all(uploadPromises);
      alert('Zadanie domowe zostało oddane!');
      setSelectedFiles(null);
      setUploadProgress(100);
    } catch (err) {
      console.error(err);
      alert('Błąd podczas wysyłania');
    } finally {
      setUploadingLessonId(null);
      setUploadProgress(0);
    }
  };

  if (loading) return <div className="p-10 text-center">Ładowanie kursu...</div>;
  if (!course) return <div className="p-10 text-center text-red-600">Kurs nie znaleziony</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={null} role="STUDENT" onLogout={() => supabase.auth.signOut()} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/student/kursy')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" /> Wróć do moich kursów
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-purple-700 mb-4">{course.title}</h1>
            <p className="text-xl text-gray-700 mb-4">
              Prowadzący: <strong>{teacherName}</strong>
            </p>
          </div>

          <h2 className="text-3xl font-bold text-blue-800 mb-8">Lekcje</h2>

          <div className="space-y-10">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl shadow-xl p-8 border-4 border-purple-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-700">
                      Lekcja {lesson.lesson_number}: {lesson.title}
                    </h3>
                    {lesson.lesson_date && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(lesson.lesson_date).toLocaleDateString('pl-PL')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Materiały */}
                <div className="space-y-6 text-gray-700">
                  {lesson.recording_link && (
                    <div className="bg-blue-50 p-5 rounded-lg">
                      <strong className="text-blue-900 flex items-center gap-2">
                        <Link2 className="w-5 h-5" /> Nagranie z lekcji
                      </strong>
                      <a
                        href={lesson.recording_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block mt-2"
                      >
                        Otwórz nagranie
                      </a>
                    </div>
                  )}

                  {lesson.description && (
                    <div className="bg-gray-50 p-5 rounded-lg">
                      <strong className="text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Opis lekcji
                      </strong>
                      <p className="mt-3 whitespace-pre-wrap">{lesson.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lesson.quiz_pdf_url && (
                      <a
                        href={lesson.quiz_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Quiz PDF</span>
                      </a>
                    )}
                    {lesson.tasks_pdf_url && (
                      <a
                        href={lesson.tasks_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Zadania PDF</span>
                      </a>
                    )}
                    {lesson.answers_pdf_url && (
                      <a
                        href={lesson.answers_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Odpowiedzi PDF</span>
                      </a>
                    )}
                    {lesson.homework_pdf_url && (
                      <a
                        href={lesson.homework_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Zadanie domowe (PDF)</span>
                      </a>
                    )}
                  </div>

                  {/* Zadanie domowe tekstowe + upload */}
                  {lesson.homework_description && (
                    <div className="mt-6 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <strong className="text-yellow-900 text-lg block mb-3">
                        Zadanie domowe:
                      </strong>
                      <p className="text-yellow-800 mb-5 whitespace-pre-wrap">
                        {lesson.homework_description}
                      </p>

                      <div className="space-y-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                        />

                        {selectedFiles && (
                          <div className="text-sm text-gray-600">
                            Wybrano {selectedFiles.length} plik(ów):
                            <ul className="list-disc list-inside">
                              {Array.from(selectedFiles).map((f, i) => (
                                <li key={i}>{f.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          onClick={() => uploadHomework(lesson.id)}
                          disabled={uploadingLessonId === lesson.id || !selectedFiles}
                          className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadingLessonId === lesson.id ? (
                            <>
                              <Upload className="w-5 h-5 animate-bounce" />
                              Wysyłanie... {uploadProgress}%
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Oddaj zadanie domowe
                            </>
                          )}
                        </button>
                      </div>
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