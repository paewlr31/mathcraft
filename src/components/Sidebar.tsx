import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { User } from '@supabase/supabase-js';

interface SidebarProps {
  user: User | null;
  role: string;
  onLogout: () => void;
}

export default function Sidebar({ user, role, onLogout }: SidebarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // stan sidebaru na mobile

  const commonMenu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Chat', path: '/sharedPages/chat' },
    { name: 'Umowy', path: '/sharedPages/umowy' },
    { name: 'Przewodnik', path: '/sharedPages/przewodnik' },
    { name: 'Forum', path: '/forum' },
    { name: 'Baza wiedzy', path: '/sharedPages/baza-wiedzy' },
  ];

  const studentMenu = [
    { name: 'Moje lekcje', path: '/student/lekcje' },
    { name: 'Moje kursy', path: '/student/kursy' },
    { name: 'Zadania domowe', path: '/student/zadania' },
    { name: 'Arkusze maturalne', path: '/student/arkusze' },
    { name: 'Najważniejsze zadania', path: '/student/najwazniejsze' }
  ];

  const teacherMenu = [
    { name: 'Moi uczniowie', path: '/teacher/uczniowie' },
    { name: 'Zarządzanie kursami', path: '/teacher/kursy' },
    { name: 'Tworzenie i ocenianie zadań', path: '/teacher/ocenianie' },
    { name: 'Kalendarz lekcji', path: '/teacher/kalendarz' },
    { name: 'Repozytorium materiałów', path: '/teacher/repo' },
    { name: 'Statystyki uczniów', path: '/teacher/statystyki-uczniow' },
    { name: 'Arkusze', path: '/teacher/arkusze' },
    { name: 'Najważniejsze zadania', path: '/teacher/najwazniejsze' }
  ];

  const adminMenu = [
    { name: 'Zarządzanie użytkownikami', path: '/admin/users' },
    { name: 'Zarządzanie kursami', path: '/admin/kursy' },
    { name: 'Zarządzanie lekcjami', path: '/admin/lekcje' },
    { name: 'Finanse', path: '/admin/finanse' },
    { name: 'Statystyki globalne', path: '/admin/statystyki-globalne' },
    { name: 'Moderacja forum', path: '/admin/forum' },
    { name: 'Moderacja materiałów', path: '/admin/materialy' },
    { name: 'Ustawienia systemowe', path: '/admin/system' }
  ];

  const getMenu = () => {
    if (role === 'ADMIN') return [...commonMenu, ...adminMenu];
    if (role === 'TEACHER') return [...commonMenu, ...teacherMenu];
    return [...commonMenu, ...studentMenu];
  };

  return (
    <>
      {/* Hamburger button na mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Overlay dla mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 overflow-y-auto
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:block
          z-50
        `}
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Mathcraft</h2>

        <p className="text-sm text-gray-600 mb-4">
          Zalogowano jako:<br />
          <strong>{user?.email}</strong>
        </p>

        <p className="text-sm font-semibold mb-6  text-blue-800">
          Rola: {role?.toUpperCase()}
        </p>

        <nav className="space-y-2">
          {getMenu().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded text-gray-800 hover:bg-blue-100 transition
                ${location.pathname === item.path ? 'bg-blue-200 font-semibold' : ''}`}
              onClick={() => setIsOpen(false)} // zamyka menu po kliknięciu na mobile
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Wyloguj się
        </button>
      </aside>
    </>
  );
}
