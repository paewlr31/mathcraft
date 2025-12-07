// src/pages/sharedPages/blog/index.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import BlogPostCard from './components/BlogPostCard';
import Sidebar from '../../../components/Sidebar'; // ← DODAŁEM
import type { User } from '@supabase/supabase-js';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  published_at: string;
};

export default function BlogHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'GUEST' | 'STUDENT' | 'ADMIN'>('GUEST');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    checkUser();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, thumbnail_url, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    setPosts(data || []);
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setRole(data?.role || 'STUDENT');
    } else {
      setRole('GUEST');
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('GUEST');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar – tylko jak zalogowany */}
      {user && <Sidebar user={user} role={role} onLogout={handleLogout} />}

      {/* Główna treść */}
      <main className="flex-1">

        {/* Przycisk "Wróć do Home" – tylko jak niezalogowany */}
        {!user && (
          <div className="bg-linear-to-br from-purple-700 to-indigo-800 py-6 px-6">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-cyan-300 text-lg font-medium flex items-center gap-2 transition"
            >
              ← Wróć do strony głównej
            </button>
          </div>
        )}

        {/* HERO */}
        <div className="bg-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4">Blog Mathcraft</h1>
              <p className="text-xl">
                Nowości maturalne, zmiany w CKE, porady i przemyślenia twórcy Mathcraft.
              </p>
            </div>
            <img 
              src="/assets/michal-photo.jpg" 
              alt="Michał - właściciel Mathcraft"
              className="w-64 h-64 rounded-full object-cover shadow-2xl border-8 border-white"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Przycisk dodaj post – tylko ADMIN */}
          {role === 'ADMIN' && (
            <div className="mb-8 text-right">
              <Link 
                to="/blog/add"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
              >
                + Dodaj nowy post
              </Link>
            </div>
          )}

          {/* Lista postów */}
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-xl">
              Jeszcze nie ma żadnych wpisów. Wróć niedługo!
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}