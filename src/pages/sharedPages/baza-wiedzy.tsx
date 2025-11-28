import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

export default function BazaWiedzy() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(data?.role || 'STUDENT');
      }
    };
    getData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar renderuje się tylko jeśli użytkownik jest zalogowany */}
      {user && <Sidebar user={user} role={role} onLogout={handleLogout} />}

      <main className={`flex-1 p-6 ${user ? 'md:ml-64' : ''}`}>
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Baza wiedzy</h1>
          <p className="text-lg text-blue-800">
            Tutaj znajdziesz materiały i artykuły.
          </p>
          {!user && (
            <p className="mt-4 text-gray-600">
              Funkcje dodatkowe są dostępne po zalogowaniu.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
