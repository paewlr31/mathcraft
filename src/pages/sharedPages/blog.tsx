import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

export default function Blog() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('GUEST'); // niezalogowany = GUEST
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setRole('GUEST');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(data?.role || 'STUDENT');
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar TYLKO dla zalogowanych */}
      {user && (
        <Sidebar user={user} role={role} onLogout={handleLogout} />
      )}

      <main className={`flex-1 p-6 ${user ? 'md:ml-64' : ''}`}>
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          
          <h1 className="text-3xl font-bold text-purple-700 mb-4">Blog Mathcraft</h1>

          <p className="text-lg text-gray-700 mb-4">
            Witaj na blogu! Już wkrótce pojawią się tu wpisy dotyczące zmian w CKE, 
            nowości w maturach, porady edukacyjne oraz przemyślenia właściciela Mathcraft.
          </p>

          <div className="mt-6 p-4 bg-purple-100 text-purple-900 rounded-lg border border-purple-300">
            <p className="font-medium text-lg">
              Blog jeszcze nie jest dostępny — pracujemy nad nim. Wróć później!
            </p>
          </div>

          {role === 'ADMIN' && (
            <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-lg">
              <h2 className="text-xl font-bold text-green-700 mb-2">Panel administratora</h2>
              <p className="text-green-800">Tu pojawi się możliwość dodawania postów na bloga.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
