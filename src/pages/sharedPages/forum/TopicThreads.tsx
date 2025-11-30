// src/pages/sharedPages/forum/TopicThreads.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { Heart, MessageCircle, X, Upload, Send } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  views: number;
  likes: number;
  comments_count: number;
  user_email: string;
}

export default function TopicThreads() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!topicId) return;

      // Pobieramy tytuł tematu
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('title')
        .eq('id', topicId)
        .single();
      setTopicTitle(topic?.title || 'Temat');

      // POPRAWIONY SELECT — DZIAŁA 100% BEZ BŁĘDU 400
      const { data: threadsData, error } = await supabase
        .from('forum_threads')
        .select(`
          id,
          title,
          content,
          image_url,
          created_at,
          views,
          likes,
          user_id,
          forum_comments(count)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Błąd pobierania wątków:', error);
        return;
      }

      // Pobieramy emaile osobno (bo relacja profiles nie działa bez RLS)
      const userIds = threadsData?.map(t => t.user_id).filter(Boolean) || [];
      let emailMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        profiles?.forEach(p => {
          emailMap[p.id] = p.email.split('@')[0];
        });
      }

      const formattedThreads = threadsData?.map((t: any) => ({
        id: t.id,
        title: t.title,
        content: t.content || '',
        image_url: t.image_url,
        created_at: t.created_at,
        views: t.views || 0,
        likes: t.likes || 0,
        comments_count: t.forum_comments[0]?.count || 0,
        user_email: emailMap[t.user_id] || 'anon'
      })) || [];

      setThreads(formattedThreads);
    };

    fetchData();
  }, [topicId]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage.from('forum-images').upload(fileName, file);
    if (error) {
      alert('Błąd uploadu: ' + error.message);
      return null;
    }
    const { data } = supabase.storage.from('forum-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addThread = async () => {
    if (!user || !newTitle.trim()) return;

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .insert({
        topic_id: topicId,
        user_id: user.id,
        title: newTitle.trim(),
        content: newContent.trim() || null,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      alert('Błąd: ' + error.message);
      return;
    }

    if (data) {
      setThreads([{
        id: data.id,
        title: data.title,
        content: data.content || '',
        image_url: data.image_url,
        created_at: data.created_at,
        views: 0,
        likes: 0,
        comments_count: 0,
        user_email: user.email.split('@')[0]
      }, ...threads]);

      setNewTitle('');
      setNewContent('');
      setImageFile(null);
      setShowForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-cyan-600 hover:underline mb-6 text-lg">
          ← Wróć
        </button>
        <h1 className="text-5xl font-black text-blue-900 mb-10">{topicTitle}</h1>

        {user && !showForm && (
          <button onClick={() => setShowForm(true)} className="mb-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xl py-5 px-12 rounded-full shadow-xl flex items-center gap-4 transform hover:scale-105 transition">
            Dodaj zadanie
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border-4 border-cyan-500">
            <div className="flex justify-between mb-6">
              <h2 className="text-3xl font-bold text-blue-900">Nowe zadanie</h2>
              <button onClick={() => setShowForm(false)}><X size={32} className="text-red-600" /></button>
            </div>
            <input type="text" placeholder="Tytuł zadania" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-4 border-2 rounded-lg mb-4 text-lg" />
            <textarea placeholder="Opis problemu (opcjonalnie)" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="w-full p-4 border-2 rounded-lg mb-4" />
            <label className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-100">
              <Upload size={28} className="text-cyan-600" />
              <span className="text-lg">{imageFile?.name || 'Dodaj zdjęcie zadania'}</span>
              <input type="file" accept="image/*" onChange={e => e.target.files && setImageFile(e.target.files[0])} className="hidden" />
            </label>
            <button onClick={addThread} className="mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full flex items-center gap-3">
              <Send size={28} /> Opublikuj
            </button>
          </div>
        )}

        <div className="space-y-8">
          {threads.length === 0 ? (
            <p className="text-center text-2xl text-gray-500 py-20">Brak wątków – dodaj pierwszy!</p>
          ) : (
            threads.map(t => (
              <Link key={t.id} to={`/forum/thread/${t.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-xl border-l-8 border-cyan-600 p-8 hover:shadow-2xl transition cursor-pointer">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">{t.title}</h3>
                  {t.image_url && <img src={t.image_url} alt="Zadanie" className="max-w-full rounded-lg my-6 shadow-lg" />}
                  {t.content && <p className="text-gray-700 mb-6 line-clamp-3">{t.content}</p>}
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>{t.user_email} • {new Date(t.created_at).toLocaleDateString('pl-PL')}</div>
                    <div className="flex gap-6">
                      <span><Heart size={20} fill="currentColor" className="text-red-600 inline" /> {t.likes}</span>
                      <span><MessageCircle size={20} className="text-cyan-600 inline" /> {t.comments_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}