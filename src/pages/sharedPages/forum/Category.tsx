// src/pages/sharedPages/forum/Category.tsx
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

interface Topic {
  id: string;
  title: string;
  views: number;
  threads_count: number;
}

const categoryNames: Record<string, string> = {
  'klasa-8': 'Matematyka 8 klasa',
  'podstawowa': 'Matematyka podstawowa',
  'rozszerzona': 'Matematyka rozszerzona',
  'ib-sl': 'Matematyka IB/SL',
  'studia': 'Matematyka studia',
};

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('id, title, views, threads_count')
        .eq('category_slug', category)
        .order('title');

      if (error) console.error('Błąd:', error);
      else setTopics(data || []);
      setLoading(false);
    };

    fetchTopics();
  }, [category]);

  if (loading) return <div className="text-center py-32 text-3xl text-gray-600">Ładowanie tematów...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <button onClick={() => navigate('/forum')} className="text-cyan-300 hover:underline text-xl mb-6">
            ← Wróć do kategorii
          </button>
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">
            {categoryNames[category || ''] || category}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/forum/topic/${topic.id}`}  // ← WAŻNE!
              className="block transform hover:scale-105 transition duration-300"
            >
              <div className="bg-white rounded-2xl shadow-xl p-10 border-l-8 border-cyan-600 hover:border-cyan-400 hover:shadow-2xl">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">{topic.title}</h3>
                <div className="flex justify-between text-gray-600 text-lg">
                  <span>Wyświetlenia: {topic.views.toLocaleString()}</span>
                  <span className="text-cyan-600 font-bold">
                    {topic.threads_count} wątków
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}