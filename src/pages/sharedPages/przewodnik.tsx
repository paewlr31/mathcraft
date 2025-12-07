import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

export default function Przewodnik() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('STUDENT');
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(data?.role || 'STUDENT');
    };

    getData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ====================== PRZEWODNIKI DLA POSZCZEGÓLNYCH RÓL ======================
  const przewodnikADMIN = (
    <>
      <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-4">Panel ADMINISTRATORA – pełny przewodnik</h2>
      <ul className="space-y-4 text-gray-700 text-lg">
        <li><strong>🟦 Dashboard</strong> – statystyki całej szkoły (liczba uczniów, nauczycieli, aktywnych kursów, frekwencja).</li>
        <li><strong>👥 Użytkownicy</strong> – zarządzanie wszystkimi kontami:
          <ul className="ml-8 mt-2 list-disc">
            <li>dodawanie/edycja/usuwanie uczniów i nauczycieli</li>
            <li>przypisywanie roli (Student / Teacher / Admin)</li>
            <li>resetowanie haseł</li>
          </ul>
        </li>
        <li><strong>📚 Kursy</strong> – tworzenie nowych kursów, przypisywanie nauczycieli prowadzących, określanie poziomu (klasa 7, 8, matura itp.).</li>
        <li><strong>👨‍🏫 Nauczyciele</strong> – podgląd wszystkich nauczycieli i ich prowadzonych kursów.</li>
        <li><strong>📊 Raporty</strong> – generowanie zestawień frekwencji, wyników testów, postępów uczniów.</li>
        <li><strong>⚙️ Ustawienia szkoły</strong> – zmiana nazwy szkoły, logo, regulaminu, godziny lekcyjne.</li>
      </ul>
      <p className="mt-6 text-xl font-medium text-green-600">Jako Admin masz pełną kontrolę nad całą platformą!</p>
    </>
  );

  const przewodnikTEACHER = (
    <>
      <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-4">Panel NAUCZYCIELA – pełny przewodnik</h2>
      <ul className="space-y-4 text-gray-700 text-lg">
        <li><strong>🏠 Dashboard</strong> – Twoje najbliższe lekcje, powiadomienia od uczniów, statystyki Twoich klas.</li>
        <li><strong>📚 Moje kursy</strong> – tutaj ustalasz swoje lekcje. Mozesz je edytowac. Lista wszystkich kursów, które prowadzisz. Po kliknięciu w kurs widzisz:
          <ul className="ml-8 mt-2 list-disc">
            <li>listę zapisanych uczniów</li>
            <li>plan lekcji - do edycji przez ciebie</li>
            <li>materiały (pliki PDF, linki, filmy) - do dodania przez ciebie</li>
            <li>zadania domowe i testy - do dodania przez ciebie</li>
          </ul>
        </li>
        <li><strong>✍️ Zadania i testy</strong> – tworzenie nowych zadań, sprawdzianów, kartkówek; automatyczne ocenianie testów wielokrotnego wyboru.</li>
        <li><strong>📊 Oceny</strong> – wystawianie ocen, podgląd średnich, eksport do PDF/Excel.</li>
        <li><strong>💬 Wiadomości</strong> – czat z uczniami i rodzicami (jeśli włączyłeś tę funkcję).</li>
        <li><strong>🔔 Frekwencja</strong> – zaznaczanie obecności na każdej lekcji.</li>
      </ul>
      <p className="mt-6 text-xl font-medium text-green-600">Jako Nauczyciel masz pełny wpływ na swoje kursy i oceny uczniów.</p>
    </>
  );

  const przewodnikSTUDENT = (
    <>
      <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-4">Panel UCZNIA – pełny przewodnik</h2>
      <ul className="space-y-4 text-gray-700 text-lg">
        <li><strong>🏠 Strona główna / Dashboard</strong> – Twoje najbliższe lekcje, zadania do oddania i aktualne oceny.</li>
        <li><strong>📚 Moje kursy</strong> – wszystkie przedmioty, na które jesteś zapisany/a. Po wejściu w kurs widzisz:
          <ul className="ml-8 mt-2 list-disc">
            <li>plan lekcji na najbliższe tygodnie</li>
            <li>materiały od nauczyciela (PDF-y, filmy, linki)</li>
            <li>zadania domowe i terminy</li>
            <li>wyniki testów i sprawdzianów</li>
            <li><strong>UWAGA TYLKO W TEJ SEKCJI TJ. W KURSACH MOZESZ ODDAC ZADANIE DOMOWE</strong></li>
          </ul>
        </li>
        <li><strong>✏ Zadania</strong> – lista wszystkich zadań, które zostały wykonane - ładnie ocenione - wynik z poszczególnej lekcji i kursu.</li>
        <li><strong>📊 Moje oceny</strong> – pełna lista ocen z każdego przedmiotu, średnia ważona, wykres postępów.</li>
        <li><strong>🔔 Forum/Baza wiedzy</strong> – forum to miejsce, gdzie możesz spytać innych o pomoc, baza wiedzy - przykładowe zadania mauralne do poćwiczenia.</li>
        <li><strong>👤 Blog</strong> – tam znajdziesz wsyztskie najwazniejsze informacje.</li>
      </ul>
      <p className="mt-6 text-xl font-medium text-green-600">Wszystko, czego potrzebujesz do nauki, masz w jednym miejscu!</p>
    </>
  );
  // ============================================================================

  const renderPrzewodnik = () => {
    if (role === 'ADMIN') return przewodnikADMIN;
    if (role === 'TEACHER') return przewodnikTEACHER;
    return przewodnikSTUDENT; // domyślnie STUDENT
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role={role} onLogout={handleLogout} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">
            Przewodnik po platformie matematycznej
          </h1>

          {user && (
            <div className="text-center mb-10">
              <p className="text-xl text-gray-700">
                Zalogowano jako: <strong>{user.email}</strong>
              </p>
              <p className="text-2xl text-gray-700 mt-4">
                Twoja rola:{' '}
                <span className="ml-3 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">
                  {role.toUpperCase()}
                </span>
              </p>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {renderPrzewodnik()}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Jeśli masz pytania? Napisz do nas na <a href="mailto:kontakt@twojaszkola.pl" className="text-blue-600 underline">kontakt@twojaszkola.pl</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}