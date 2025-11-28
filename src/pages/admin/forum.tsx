import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

export default function ForumAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('');
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
      setRole(data?.role || 'ADMIN');
    };
    getData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role={role} onLogout={handleLogout} />
      <main className="flex-1 p-6 md:ml-64">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Moderacja forum</h1>
          <p className="text-lg text-blue-800">Tutaj możesz moderować posty na forum.</p>
        </div>
      </main>
    </div>
  );
}
