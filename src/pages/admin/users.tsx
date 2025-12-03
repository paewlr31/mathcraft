// src/pages/admin/Users.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER';
}

export default function Users() {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sprawdzenie sesji i roli zalogowanego użytkownika
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      setUser(user);
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        alert('Błąd podczas pobierania roli użytkownika');
        navigate('/');
        return;
      }

      const role = data.role;
      setCurrentUserRole(role);

      // Tylko ADMIN ma dostęp do tej strony
      if (role !== 'ADMIN') {
        alert('Brak uprawnień do zarządzania użytkownikami');
        navigate('/');
        return;
      }

      fetchAllProfiles();
    };

    checkUser();
  }, [navigate]);

  // Pobranie wszystkich profili (oprócz admina)
  const fetchAllProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('email', { ascending: true });

    if (error) {
      console.error('Błąd pobierania użytkowników:', error);
      alert('Nie udało się pobrać listy użytkowników');
    } else {
      // Filtrujemy – pomijamy aktualnie zalogowanego admina
      const filtered = (data as Profile[]).filter(p => p.id !== currentUserId);
      setProfiles(filtered);
    }
    setLoading(false);
  };

  // Zmiana roli użytkownika
  const changeRole = async (userId: string, newRole: 'STUDENT' | 'TEACHER') => {
    if (!confirm(`Czy na pewno chcesz zmienić rolę na ${newRole}?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Błąd aktualizacji roli:', error);
      alert('Nie udało się zmienić roli użytkownika');
    } else {
      alert('Rola została pomyślnie zmieniona');
      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, role: newRole } : p))
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Zabezpieczenie przed renderowaniem jeśli nie jest adminem
  if (currentUserRole !== 'ADMIN') return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role={currentUserRole} onLogout={handleLogout} />

      <main className="flex-1 p-6 md:ml-64">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">
            Zarządzanie użytkownikami
          </h1>

          {loading ? (
            <p className="text-gray-600">Ładowanie użytkowników...</p>
          ) : profiles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Brak użytkowników do wyświetlenia (lub jesteś jedynym adminem).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rola
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            profile.role === 'TEACHER'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => changeRole(profile.id, 'STUDENT')}
                            disabled={profile.role === 'STUDENT'}
                            className={`px-4 py-2 rounded text-white text-xs font-medium transition ${
                              profile.role === 'STUDENT'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            STUDENT
                          </button>
                          <button
                            onClick={() => changeRole(profile.id, 'TEACHER')}
                            disabled={profile.role === 'TEACHER'}
                            className={`px-4 py-2 rounded text-white text-xs font-medium transition ${
                              profile.role === 'TEACHER'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            TEACHER
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}