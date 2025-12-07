import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type Topic = { id: string; title: string; description: string | null; slug: string; order_num: number };

export default function SectionPage() {
  const { levelSlug, sectionSlug } = useParams<{ levelSlug: string; sectionSlug: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');

  useEffect(() => {
    (async () => {
      const { data: section } = await supabase
        .from('knowledge_sections')
        .select('title')
        .eq('slug', sectionSlug)
        .single();

      const { data: topicsData } = await supabase
        .from('knowledge_topics')
        .select('id, title, description, slug, order_num')
        .eq('section_id', (await supabase.from('knowledge_sections').select('id').eq('slug', sectionSlug).single()).data?.id)
        .order('order_num');

      setSectionTitle(section?.title || '');
      setTopics(topicsData || []);
    })();
  }, [levelSlug, sectionSlug]);

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-800 via-yellow-600 to-orange-600 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* PRZYCISK POWRÓT */}
        <button
          onClick={() => navigate(`/sharedPages/baza-wiedzy/${levelSlug}`)}
          className="mb-12 text-white hover:text-cyan-300 text-xl font-bold flex items-center gap-3 transition"
        >
          ← Powrót do {levelSlug === 'podstawa' ? 'poziomu podstawowego' : 'poziomu rozszerzonego'}
        </button>

        <h1 className="text-5xl md:text-6xl font-black text-white text-center mb-16 drop-shadow-2xl">
          {sectionTitle}
        </h1>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {topics.map((topic, i) => (
            <Link
              key={topic.id}
              to={`/sharedPages/baza-wiedzy/${levelSlug}/${sectionSlug}/${topic.slug}`}
              className="bg-white rounded-3xl shadow-2xl p-10 hover:shadow-3xl transform hover:-translate-y-2 transition block"
            >
              <div className="text-4xl font-black text-indigo-700 mb-4">{i + 1}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{topic.title}</h3>
              {topic.description && <p className="text-gray-600">{topic.description}</p>}
              <div className="mt-6 text-right text-indigo-600 font-bold text-xl">→ Przejdź do zadań</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}