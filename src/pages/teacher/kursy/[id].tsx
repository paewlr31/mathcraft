// src/pages/teacher/kursy/[id].tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import { ArrowLeft, Trash2, Link2, FileText, Users, Edit3, Save, X, CheckCircle, Calendar, Clock } from 'lucide-react';

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
  lesson_date: string | null; // teraz to np. "2025-12-07T14:30:00Z"
}

interface Student {
  id: string;
  email: string;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<{[key: string]: any}>({});

  useEffect(() => {
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

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', id)
        .eq('role', 'STUDENT');

      if (enrollmentsError) throw enrollmentsError;

      if (enrollments && enrollments.length > 0) {
        const studentIds = enrollments.map(e => e.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', studentIds);

        if (profilesError) throw profilesError;
        setStudents(profiles || []);
      } else {
        setStudents([]);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setTeacherName(profile?.email || user.email || 'Nauczyciel');
      }

      setCourse(courseData);
      setLessons(lessonsData || []);
      setEditedFields({});
    } catch (error) {
      console.error('Error in fetchCourseData:', error);
      alert('Błąd podczas ładowania danych kursu');
    } finally {
      setLoading(false);
    }
  };

  const uploadPdf = async (file: File, field: string, lessonId: string) => {
    setUploadingFile(`${lessonId}-${field}`);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${lessonId}/${field}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('course_lessons')
        .update({ [field]: publicUrl })
        .eq('id', lessonId);

      if (updateError) throw updateError;

      await fetchCourseData();
      alert('Plik został pomyślnie przesłany!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Błąd podczas wysyłania pliku');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleFieldChange = (lessonId: string, field: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [`${lessonId}-${field}`]: value
    }));
  };

  const saveAllChanges = async (lessonId: string) => {
    try {
      const updates: any = {};
      Object.keys(editedFields).forEach(key => {
        if (key.startsWith(`${lessonId}-`)) {
          const field = key.replace(`${lessonId}-`, '');
          let val = editedFields[key];

          // Jeśli to data z godziną – dodaj sekundy i Z
          if (field === 'lesson_date' && val) {
            val = val ? `${val}:00Z` : null;
          }

          updates[field] = val || null;
        }
      });

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('course_lessons')
          .update(updates)
          .eq('id', lessonId);

        if (error) throw error;
      }

      setEditingLesson(null);
      setEditedFields({});
      await fetchCourseData();
      alert('Zmiany zapisane pomyślnie!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Błąd podczas zapisywania');
    }
  };

  const deletePdf = async (lessonId: string, field: string, currentUrl: string | null) => {
    if (!currentUrl || !confirm('Na pewno usunąć plik?')) return;

    try {
      await supabase.from('course_lessons').update({ [field]: null }).eq('id', lessonId);

      const filePath = currentUrl.split('/course-materials/')[1];
      if (filePath) {
        await supabase.storage.from('course-materials').remove([filePath]);
      }

      await fetchCourseData();
      alert('Plik usunięty');
    } catch (error) {
      console.error(error);
      alert('Błąd usuwania');
    }
  };

  // Pomocnicza funkcja – formatuje datę z godziną do wyświetlania
  const formatLessonDate = (dateStr: string | null) => {
    if (!dateStr) return 'Brak daty';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
       timeZone: 'UTC'
    });
  };

  // Przygotowuje wartość dla inputa datetime-local (YYYY-MM-DDTHH:mm)
  const getFieldValue = (lessonId: string, field: string, originalValue: any) => {
    const key = `${lessonId}-${field}`;
    if (editedFields[key] !== undefined) return editedFields[key];

    if (field === 'lesson_date' && originalValue) {
      // Jeśli masz "2025-12-07T14:30:00Z" → zwróć "2025-12-07T14:30"
      return originalValue.includes('T') ? originalValue.slice(0, 16) : originalValue;
    }
    return originalValue || '';
  };

  if (loading) return <div className="p-10 text-center">Ładowanie kursu...</div>;
  if (!course) return <div className="p-10 text-center text-red-600">Kurs nie znaleziony</div>;

  return (
   <div className="flex min-h-screen bg-gray-100">
     <Sidebar user={null} role="TEACHER" onLogout={() => supabase.auth.signOut()} />

     <main className="flex-1 p-4 sm:p-6 md:ml-64">
       <div className="max-w-7xl mx-auto">
         <button
           onClick={() => navigate('/teacher/kursy')}
           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 sm:mb-6"
         >
           <ArrowLeft className="w-5 h-5" /> Wróć do listy kursów
         </button>

         <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-4 border-purple-300">
           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-700 mb-4">{course.title}</h1>
           <p className="text-lg sm:text-xl text-gray-700">
             Prowadzący: <strong>{teacherName}</strong>
           </p>
           <div className="mt-4 sm:mt-6 flex items-center gap-3">
             <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
             <span className="text-base sm:text-lg text-gray-600">{students.length} {students.length === 1 ? 'uczeń' : 'uczniów'}</span>
           </div>

           {students.length > 0 && (
             <div className="mt-4 sm:mt-6">
               <h3 className="text-base sm:text-lg font-semibold mb-3">Uczestnicy:</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {students.map(s => (
                   <div key={s.id} className="bg-gray-50 p-3 rounded-lg text-sm wrap-break-word">
                     {s.email}
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>

         <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 sm:mb-6 mt-6">Lekcje</h2>

         <div className="space-y-6 sm:space-y-8">
           {lessons.map((lesson) => {
             const isEditing = editingLesson === lesson.id;
             
             return (
               <div key={lesson.id} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-4 border-purple-300">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                   <div className="flex-1 min-w-0">
                     <h3 className="text-xl sm:text-2xl font-bold text-purple-700 wrap-break-word">
                       Lekcja {lesson.lesson_number}: {lesson.title}
                     </h3>
                     {lesson.lesson_date && !isEditing && (
                       <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                         <Calendar className="w-4 h-4 shrink-0" />
                         <Clock className="w-4 h-4 shrink-0" />
                         <span>{formatLessonDate(lesson.lesson_date)}</span>
                       </p>
                     )}
                   </div>
                   <button
                     onClick={() => {
                       if (isEditing) {
                         setEditingLesson(null);
                         setEditedFields({});
                       } else {
                         setEditingLesson(lesson.id);
                       }
                     }}
                     className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto shrink-0"
                   >
                     {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                     {isEditing ? 'Anuluj' : 'Edytuj'}
                   </button>
                 </div>

                 {isEditing ? (
                   <div className="space-y-4 text-gray-600 sm:space-y-6">

                     {/* DATA + GODZINA – TO JEST JEDYNA ZMIANA W KODZIE */}
                     <div>
                       <label className="flex items-center text-gray-600 gap-2 font-medium mb-2 text-sm sm:text-base">
                         <Calendar className="w-4 h-4 text-gray-600 sm:w-5 sm:h-5 shrink-0" /> Data i godzina lekcji
                       </label>
                       <input
                         type="datetime-local"
                         value={getFieldValue(lesson.id, 'lesson_date', lesson.lesson_date || '')}
                         onChange={(e) => handleFieldChange(lesson.id, 'lesson_date', e.target.value)}
                         className="w-full px-3 sm:px-4 text-gray-600 py-2 border rounded-lg text-sm sm:text-base"
                         step="1800" // co 30 minut
                       />
                     </div>
                     {/* KONIEC ZMIANY */}

                     {/* Reszta bez zmian – dokładnie jak miałeś */}
                     <div>
                       <label className="flex items-center gap-2 font-medium mb-2 text-sm sm:text-base">
                         <Link2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Link do nagrania
                       </label>
                       <input
                         type="url"
                         value={getFieldValue(lesson.id, 'recording_link', lesson.recording_link || '')}
                         onChange={(e) => handleFieldChange(lesson.id, 'recording_link', e.target.value)}
                         className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                         placeholder="https://..."
                       />
                     </div>

                     <div>
                       <label className="flex items-center gap-2 font-medium mb-2 text-sm sm:text-base">
                         <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Krótki opis lekcji
                       </label>
                       <textarea
                         value={getFieldValue(lesson.id, 'description', lesson.description || '')}
                         onChange={(e) => handleFieldChange(lesson.id, 'description', e.target.value)}
                         rows={3}
                         className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base resize-y"
                         placeholder="O czym była lekcja..."
                       />
                     </div>

                     {['quiz_pdf_url', 'tasks_pdf_url', 'answers_pdf_url', 'homework_pdf_url'].map((field) => {
                       const labels: any = {
                         quiz_pdf_url: 'Quiz PDF',
                         tasks_pdf_url: 'Zadania PDF',
                         answers_pdf_url: 'Odpowiedzi PDF',
                         homework_pdf_url: 'Zadanie domowe PDF'
                       };
                       const currentUrl = lesson[field as keyof Lesson] as string | null;
                       const isUploading = uploadingFile === `${lesson.id}-${field}`;

                       return (
                         <div key={field} className="border-t pt-4">
                           <label className="font-medium text-base sm:text-lg block mb-2">{labels[field]}</label>
                           <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                             <input
                               type="file"
                               accept=".pdf"
                               onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0], field, lesson.id)}
                               className="flex-1 text-sm sm:text-base w-full"
                               disabled={isUploading}
                             />
                             {isUploading ? (
                               <span className="text-blue-600 font-medium text-sm sm:text-base">Uploading...</span>
                             ) : currentUrl ? (
                               <div className="flex items-center gap-2 shrink-0">
                                 <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                 <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium text-sm sm:text-base">
                                   Pobierz
                                 </a>
                                 <button
                                   onClick={() => deletePdf(lesson.id, field, currentUrl)}
                                   className="text-red-600 hover:text-red-800 shrink-0"
                                   title="Usuń plik"
                                 >
                                   <Trash2 className="w-5 h-5" />
                                 </button>
                               </div>
                             ) : (
                               <span className="text-gray-400 text-sm sm:text-base">Brak pliku</span>
                             )}
                           </div>
                         </div>
                       );
                     })}

                     <div className="border-t pt-4">
                       <label className="font-medium text-base sm:text-lg block mb-2">Treść zadania domowego (opcjonalnie)</label>
                       <textarea
                         value={getFieldValue(lesson.id, 'homework_description', lesson.homework_description || '')}
                         onChange={(e) => handleFieldChange(lesson.id, 'homework_description', e.target.value)}
                         rows={4}
                         className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base resize-y"
                         placeholder="Opisz zadanie domowe..."
                       />
                     </div>

                     <button
                       onClick={() => saveAllChanges(lesson.id)}
                       className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-base sm:text-lg w-full sm:w-auto"
                     >
                       <Save className="w-5 h-5" /> Zapisz wszystkie zmiany
                     </button>
                   </div>
                 ) : (
                   <div className="space-y-4 text-gray-700">
                     {lesson.recording_link && (
                       <div className="bg-blue-50 p-3 sm:p-4 rounded-lg wrap-break-word">
                         <strong className="text-blue-900 text-sm sm:text-base">Nagranie:</strong>{' '}
                         <a href={lesson.recording_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm sm:text-base break-all">
                           Otwórz nagranie
                         </a>
                       </div>
                     )}
                     {lesson.description && (
                       <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                         <strong className="text-gray-900 text-sm sm:text-base">Opis:</strong> 
                         <p className="mt-2 text-sm sm:text-base wrap-break-word">{lesson.description}</p>
                       </div>
                     )}
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                       {lesson.quiz_pdf_url && (
                         <a href={lesson.quiz_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition">
                           <CheckCircle className="w-5 h-5 shrink-0" />
                           <span className="font-medium text-sm sm:text-base">Quiz PDF</span>
                         </a>
                       )}
                       {lesson.tasks_pdf_url && (
                         <a href={lesson.tasks_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition">
                           <CheckCircle className="w-5 h-5 shrink-0" />
                           <span className="font-medium text-sm sm:text-base">Zadania PDF</span>
                         </a>
                       )}
                       {lesson.answers_pdf_url && (
                         <a href={lesson.answers_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition">
                           <CheckCircle className="w-5 h-5 shrink-0" />
                           <span className="font-medium text-sm sm:text-base">Odpowiedzi PDF</span>
                         </a>
                       )}
                       {lesson.homework_pdf_url && (
                         <a href={lesson.homework_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 sm:p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition">
                           <CheckCircle className="w-5 h-5 shrink-0" />
                           <span className="font-medium text-sm sm:text-base">Zadanie domowe PDF</span>
                         </a>
                       )}
                     </div>

                     {lesson.homework_description && (
                       <div className="mt-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                         <strong className="text-yellow-900 text-sm sm:text-base">Zadanie domowe:</strong> 
                         <p className="mt-2 text-yellow-800 text-sm sm:text-base wrap-break-word">{lesson.homework_description}</p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             );
           })}
         </div>
       </div>
     </main>
   </div>
 );
}