import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { User } from '@supabase/supabase-js';

export default function Chat() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('STUDENT');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
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

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} role={role} onLogout={handleLogout} />

     <div className="flex flex-1 md:ml-64 lg:ml-0">
        {/* Lista użytkowników */}
        <div className="w-full text-blue-800 md:w-80 border-r border-gray-200 bg-white">
          <ChatList
            currentUserId={user.id}
            currentRole={role}
            onSelectUser={setSelectedUserId}
            selectedUserId={selectedUserId}
          />
        </div>

        {/* Okno czatu – widoczne tylko na większych ekranach lub po wyborze */}
        <div className="hidden md:block flex-1 bg-gray-50">
          {selectedUserId ? (
            <ChatWindow
              currentUserId={user.id}
              recipientId={selectedUserId}
              onBack={() => setSelectedUserId(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Wybierz osobę, aby rozpocząć rozmowę
            </div>
          )}
        </div>

        {/* Mobile: pełny ekran czatu po kliknięciu */}
        {selectedUserId && (
          <div className="fixed inset-0 z-50 bg-white md:hidden">
            <ChatWindow
              currentUserId={user.id}
              recipientId={selectedUserId}
              onBack={() => setSelectedUserId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}