// src/pages/sharedPages/baza-wiedzy/index.tsx  ← GŁÓWNA STRONA BAZY WIEDZY (jak forum)
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import Sidebar from '../../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

const levels = [
  { slug: 'podstawa', title: 'Poziom podstawowy', icon: '📚', color: 'from-emerald-600 to-teal-600' },
  { slug: 'rozszerzenie', title: 'Poziom rozszerzony', icon: '🚀', color: 'from-purple-700 to-pink-600' },
];

export default function BazaWiedzyHome() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('');
  const navigate = useNavigate();

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
        
      {user && <Sidebar user={user} role={role} onLogout={handleLogout} />}

      <main className="flex-1">
        {!user && (
          <div className="bg-linear-to-br from-yellow-800 via-yellow-600 to-orange-600 py-6 px-6">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-cyan-300 text-lg font-medium flex items-center gap-2"
            >
              ← Wróć do strony głównej
            </button>
          </div>
        )}

        <div className="min-h-screen bg-linear-to-br from-yellow-800 via-yellow-600 to-orange-600 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl">
                Baza Wiedzy Mathcraft
              </h1>
              <p className="text-2xl md:text-3xl text-yellow-100 mt-6 max-w-5xl mx-auto font-medium">
                Setki zadań z pełnymi rozwiązaniami – dostępne dla każdego, bez logowania!
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2">
              {levels.map((level) => (
                <Link key={level.slug} to={`/sharedPages/baza-wiedzy/${level.slug}`}>
                  <div className={`bg-linear-to-br ${level.color} p-12 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-4 border-white/30`}>
                    <div className="text-8xl mb-6">{level.icon}</div>
                    <h2 className="text-4xl font-black text-white mb-4">{level.title}</h2>
                    <p className="text-white/90 text-xl">Przejdź do materiałów →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}