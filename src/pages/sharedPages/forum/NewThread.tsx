// src/pages/sharedPages/forum/TopicThreads.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { Heart, MessageCircle, AlertCircle, X, Image, Send } from 'lucide-react';

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
  const [newImageUrl, setNewImageUrl] = useState('');

  // Przykładowe dane na start (jeśli nie ma w bazie)
  const mockThreads: Thread[] = [
    {
      id: '1',
      title: 'Zad. 6 z matury 2024 – nie rozumiem jak przekształcić',
      content: 'Jak to zrobić? Próbowałem przez deltę, ale nie wychodzi...',
      image_url: 'https://i.imgur.com/5eXKp1L.png',
      created_at: new Date().toISOString(),
      views: 89,
      likes: 12,
      comments_count: 5,
      user_email: 'kasia2006'
    },
    {
      id: '2',
      title: 'Czy ktoś ma wzory na pochodne funkcji trygonometrycznych?',
      content: 'Zawsze się mylę przy sin(2x)...',
      image_url: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      views: 156,
      likes: 28,
      comments_count: 11,
      user_email: 'michal.mat'
    }
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: topic } = await supabase
        .from('forum_topics')
        .select('title')
        .eq('id', topicId)
        .single();
      setTopicTitle(topic?.title || 'Temat');

      const { data, count } = await supabase
        .from('forum_threads')
        .select('id, title, content, image_url, created_at, views, likes, profiles(email), forum_comments(count)', { count: 'exact' })
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setThreads(data.map(t => ({
          id: t.id,
          title: t.title,
          content: t.content || '',
          image_url: t.image_url,
          created_at: t.created_at,
          views: t.views || 0,
          likes: t.likes || 0,
          comments_count: t.forum_comments[0]?.count || 0,
          user_email: t.profiles?.[0]?.email.split('@')[0] || 'anon'
        })));
      } else {
        // Zachardkodowane dane na start
        setThreads(mockThreads);
      }
    };

    fetchData();
  }, [topicId]);

  const addThread = async () => {
    if (!user || !newTitle.trim()) return;

    const { data } = await supabase
      .from('forum_threads')
      .insert({
        topic_id: topicId,
        user_id: user.id,
        title: newTitle,
        content: newContent || null,
        image_url: newImageUrl || null,
        likes: 0,
        views: 0
      })
      .select('id, title, content, image_url, created_at, views, likes, profiles(email), forum_comments(count)')
      .single();

    if (data) {
      const newThread: Thread = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        image_url: data.image_url,
        created_at: data.created_at,
        views: 0,
        likes: 0,
        comments_count: 0,
        user_email: user.email.split('@')[0]
      };
      setThreads([newThread, ...threads]);
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setShowForm(false);
    }
  };

  const likeThread = async (threadId: string) => {
    await supabase.rpc('increment_likes', { thread_id: threadId });
    setThreads(threads.map(t => t.id === threadId ? { ...t, likes: t.likes + 1 } : t));
  };

  const reportThread = async (threadId: string) => {
    if (!user) return alert('Zaloguj się, by zgłosić');
    const reason = prompt('Dlaczego zgłaszasz ten wątek?');
    if (reason) {
      await supabase.from('forum_reports').insert({
        thread_id: threadId,
        user_id: user.id,
        reason
      });
      alert('Zgłoszono! Dziękujemy.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Powrót */}
        <button onClick={() => navigate(-1)} className="text-cyan-600 hover:underline mb-6 text-lg">
          ← Wróć do tematów
        </button>

        <h1 className="text-5xl font-black text-blue-900 mb-10">{topicTitle}</h1>

        {/* Przycisk dodaj zadanie */}
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xl py-5 px-12 rounded-full shadow-xl flex items-center gap-4 transform hover:scale-105 transition"
          >
            Dodaj własne zadanie
          </button>
        )}

        {/* Formularz dodawania */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border-4 border-cyan-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-900">Nowe zadanie</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-red-600">
                <X size={32} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Tytuł zadania (np. Zad. 6 matura 2024)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-4 text-xl border-2 border-gray-300 rounded-lg mb-4 focus:border-cyan-500 outline-none"
            />

            <textarea
              placeholder="Opisz, czego nie rozumiesz... (opcjonalne)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full p-4 border-2 border-gray-300 rounded-lg mb-4 focus:border-cyan-500 outline-none"
            />

            <div className="flex items-center gap-4 mb-6">
              <Image size={24} className="text-cyan-600" />
              <input
                type="text"
                placeholder="Link do zdjęcia zadania (Imgur, Discord, itp.) – opcjonalne"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:border-cyan-500 outline-none"
              />
            </div>

            <button
              onClick={addThread}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-xl flex items-center gap-3"
            >
              <Send size={28} /> Opublikuj zadanie
            </button>
          </div>
        )}

        {/* Lista wątków */}
        <div className="space-y-8">
          {threads.map((thread) => (
            <div key={thread.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 border-cyan-600 hover:border-cyan-400 transition">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-3">{thread.title}</h3>
                
                {thread.image_url && (
                  <img src={thread.image_url} alt="Zadanie" className="max-w-full rounded-lg my-6 shadow-lg" />
                )}

                {thread.content && (
                  <p className="text-gray-700 whitespace-pre-wrap mb-6">{thread.content}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-6">
                    <span className="font-medium">{thread.user_email}</span>
                    <span>{new Date(thread.created_at).toLocaleDateString('pl-PL')}</span>
                    <span>Wyświetlenia: {thread.views}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => likeThread(thread.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold"
                    >
                      <Heart size={20} fill={thread.likes > 0 ? "currentColor" : "none"} />
                      {thread.likes}
                    </button>

                    <div className="flex items-center gap-2 text-cyan-600 font-bold">
                      <MessageCircle size={20} />
                      {thread.comments_count}
                    </div>

                    <button
                      onClick={() => reportThread(thread.id)}
                      className="flex items-center gap-2 text-orange-600 hover:text-red-600"
                    >
                      <AlertCircle size={20} />
                      Zgłoś
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}