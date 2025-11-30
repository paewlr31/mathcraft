// src/pages/sharedPages/forum/index.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import Sidebar from '../../../components/Sidebar';
import type { User } from '@supabase/supabase-js';

const categories = [
  { slug: 'klasa-8', title: 'Matematyka 8 klasa', icon: '8️⃣', color: 'from-purple-600 to-pink-600' },
  { slug: 'podstawowa', title: 'Matematyka podstawowa', icon: '📐', color: 'from-blue-600 to-cyan-600' },
  { slug: 'rozszerzona', title: 'Matematyka rozszerzona', icon: '🔥', color: 'from-orange-600 to-red-600' },
  { slug: 'ib-sl', title: 'Matematyka IB/SL', icon: '🌍', color: 'from-green-600 to-teal-600' },
  { slug: 'studia', title: 'Matematyka studia', icon: '🎓', color: 'from-indigo-600 to-purple-600' },
];

export default function ForumHome() {
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
      {/* Sidebar tylko dla zalogowanych */}
      {user && <Sidebar user={user} role={role} onLogout={handleLogout} />}

      <main className="flex-1">
        {/* Przycisk "Wróć do Home" tylko dla niezalogowanych */}
        {!user && (
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-6 px-6">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-cyan-300 text-lg font-medium flex items-center gap-2"
            >
              ← Wróć do strony głównej
            </button>
          </div>
        )}

        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl">
                Forum Mathcraft
              </h1>
              <p className="text-2xl text-cyan-200 mt-6 max-w-4xl mx-auto">
                Zapytaj o zadanie, pomóż innym, znajdź rozwiązanie – razem zdamy maturę!
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link key={cat.slug} to={`/forum/${cat.slug}`}>
                  <div className={`bg-gradient-to-br ${cat.color} p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-4 border-white/30`}>
                    <div className="text-6xl mb-4">{cat.icon}</div>
                    <h2 className="text-3xl font-bold text-white">{cat.title}</h2>
                    <p className="text-white/90 mt-3 text-lg">Przejdź do działu →</p>
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