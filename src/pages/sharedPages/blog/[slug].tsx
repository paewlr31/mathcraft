// [slug].tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { marked } from 'marked';

type Section = {
  type: 'heading' | 'paragraph' | 'image';
  content: string;
};

type Post = {
  title: string;
  thumbnail_url: string | null;
  content: Section[];
  published_at: string;
};

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  async function fetchPost() {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) {
      setPost(data);
      fetchRelated(data.id);
    }
  }

  async function fetchRelated(currentId: string) {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, thumbnail_url, excerpt')
      .neq('id', currentId)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3);
      setRelated(data || []);
  }

  if (!post) return <div>Ładowanie...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
         {/* NOWY PRZYCISK – GÓRA STRONY */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold text-lg transition"
        >
          ← Wróć do bloga
        </Link>
      </div>
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Zdjęcie główne – teraz IDENTYCZNIE piękne na mobile i desktopie */}
{post.thumbnail_url && (
  <div className="relative -mx-6 md:mx-0 mb-8 md:mb-12 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
    <img
      src={post.thumbnail_url}
      alt={post.title}
      className="w-full h-64 sm:h-80 md:h-96 lg:h-[520px] object-cover object-center"
      loading="lazy"
    />
    {/* Elegancki gradient od dołu – wygląda jak z Medium / Notion */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
  </div>
)}
        <h1 className="text-6xl font-bold text-purple-800 mt-10">{post.title}</h1>
        <p className="text-gray-500 mt-4">
          {new Date(post.published_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

{/* TU JEST JEDYNA ZMIANA – Markdown zamiast surowego tekstu */}
        <div className="mt-12 space-y-16">
          {post.content.map((section: any, i: number) => (
            <div key={i} className="first:mt-0">
              <h2 className="text-3xl font-bold text-purple-800 mb-6">
                {section.title}
              </h2>
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: marked(section.content, { breaks: true, gfm: true })
                }}
              />
            </div>
          ))}
        </div>
      </article>

      {/* Footer – 3 inne posty */}
      {related.length > 0 && (
        <div className="bg-purple-50 py-16 mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-3xl font-bold text-purple-800 mb-10 text-center">Zobacz też</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-48 object-cover" />
                  ) : <div className="bg-gray-200 h-48" />}
                  <div className="p-6">
                    <h4 className="font-bold text-xl text-purple-700">{p.title}</h4>
                    <p className="text-gray-600 mt-2 line-clamp-2">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}