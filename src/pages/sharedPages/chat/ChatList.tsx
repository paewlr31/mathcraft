import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  role: string;
}

interface Props {
  currentUserId: string;
  currentRole: string;
  onSelectUser: (id: string) => void;
  selectedUserId: string | null;
}

export default function ChatList({ currentUserId, currentRole, onSelectUser, selectedUserId }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      let query;

      if (currentRole === 'ADMIN') {
        // Admin widzi wszystkich
        query = supabase
          .from('profiles')
          .select('id, email, role')
          .neq('id', currentUserId);
      } else if (currentRole === 'TEACHER') {
        // Nauczyciel widzi swoich uczniów + wszystkich adminów
        query = supabase
          .rpc('get_teacher_chat_users', { teacher_id: currentUserId });
      } else {
        // STUDENT widzi swoich nauczycieli + wszystkich adminów
        query = supabase
          .rpc('get_student_chat_users', { student_id: currentUserId });
      }

      const { data, error } = await query.order('email');
      if (!error && data) setUsers(data);
      setLoading(false);
    };

    fetchAvailableUsers();
  }, [currentUserId, currentRole]);

  if (loading) return <div className="p-4 text-center">Ładowanie...</div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-blue-700 text-white">
        <h2 className="text-xl font-semibold">Wiadomości</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Brak dostępnych kontaktów</p>
        ) : (
          users.map(u => (
            <div
              key={u.id}
              onClick={() => onSelectUser(u.id)}
              className={`p-4 flex items-center gap-3 hover:bg-gray-100 cursor-pointer transition ${
                selectedUserId === u.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {u.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{u.email}</p>
                <p className="text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    u.role === 'TEACHER' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}