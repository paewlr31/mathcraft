import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type Section = { id: string; title: string; slug: string; order_num: number };

export default function LevelPage() {
  const { levelSlug } = useParams<{ levelSlug: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [levelTitle, setLevelTitle] = useState('');

  useEffect(() => {
    (async () => {
      const { data: level } = await supabase
        .from('knowledge_levels')
        .select('title')
        .eq('slug', levelSlug)
        .single();

      const { data: sectionsData } = await supabase
        .from('knowledge_sections')
        .select('id, title, slug, order_num')
        .eq('level_id', (await supabase.from('knowledge_levels').select('id').eq('slug', levelSlug).single()).data?.id)
        .order('order_num');

      setLevelTitle(level?.title || '');
      setSections(sectionsData || []);
    })();
  }, [levelSlug]);

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-800 via-yellow-600 to-orange-600 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* PRZYCISK POWRÓT */}
        <button
          onClick={() => navigate('/sharedPages/baza-wiedzy')}
          className="mb-12 text-white hover:text-cyan-300 text-xl font-bold flex items-center gap-3 transition"
        >
          ← Powrót do wyboru poziomu
        </button>

        <h1 className="text-5xl md:text-6xl font-black text-white text-center mb-16 drop-shadow-2xl">
          {levelTitle}
        </h1>

        <div className="space-y-6">
          {sections.map((sec, i) => (
            <Link
              key={sec.id}
              to={`/sharedPages/baza-wiedzy/${levelSlug}/${sec.slug}`}
              className="block bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-8 hover:bg-white/20 transition"
            >
              <div className="text-white text-3xl font-bold">
                {levelSlug === 'podstawa' ? `${i + 1}. ` : `${i + 1} `}{sec.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}