// src/pages/sharedPages/forum/Thread.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { Heart, Upload, Send, ArrowLeft } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes: number;
  user_email: string;
}

export default function Thread() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const navigate = useNavigate();

  const [thread, setThread] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) {
      setError('Brak ID wątku w linku');
      setLoading(false);
      return;
    }

    const loadThread = async () => {
      try {
        // 1. User
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 2. Pobieramy wątek
        const { data: threadData, error: threadError } = await supabase
          .from('forum_threads')
          .select('id, title, content, image_url, created_at, views, likes, user_id')
          .eq('id', threadId)
          .single();

        if (threadError || !threadData) {
          console.error(threadError);
          setError('Wątek nie istnieje lub został usunięty');
          setLoading(false);
          return;
        }

        // 3. Autor wątku
        const { data: author } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', threadData.user_id)
          .single();

        setThread({
          ...threadData,
          user_email: author?.email?.split('@')[0] || 'anon'
        });

        // 4. Views
        await supabase.rpc('increment_views', { thread_id: threadId });

        // 5. Komentarze - OD NAJNOWSZYCH
        const { data: commentsData } = await supabase
          .from('forum_comments')
          .select('id, content, image_url, created_at, likes, user_id')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: false }); // ← OD NAJNOWSZYCH

        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map(c => c.user_id).filter(Boolean))];
          const { data: profiles } = userIds.length > 0
            ? await supabase.from('profiles').select('id, email').in('id', userIds)
            : { data: [] };

          const emailMap = Object.fromEntries(
            (profiles ?? []).map(p => [p.id, p.email.split('@')[0]])
          );

          setComments(commentsData.map(c => ({
            id: c.id,
            content: c.content,
            image_url: c.image_url,
            created_at: c.created_at,
            likes: c.likes || 0,
            user_email: emailMap[c.user_id] || 'anon'
          })));
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Błąd ładowania wątku');
        setLoading(false);
      }
    };

    loadThread();
  }, [threadId]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('forum-images').upload(fileName, file);
    if (error) {
      alert('Błąd uploadu: ' + error.message);
      return null;
    }
    const { data } = supabase.storage.from('forum-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addComment = async () => {
    if (!user || !newComment.trim() || !threadId) return;

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;
    }

    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        thread_id: threadId,
        user_id: user.id,
        content: newComment.trim(),
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      alert('Błąd: ' + error.message);
      return;
    }

    // DODAJ NA POCZĄTEK (najnowszy na górze)
    setComments(prev => [{
      id: data.id,
      content: data.content,
      image_url: data.image_url,
      created_at: data.created_at,
      likes: 0,
      user_email: user.email.split('@')[0]
    }, ...prev]);

    setNewComment('');
    setImageFile(null);
  };

  const likeComment = async (commentId: string) => {
    const { error } = await supabase.rpc('increment_comment_likes', { comment_id: commentId });
    if (!error) {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-4xl font-bold text-blue-900 animate-pulse">Ładowanie wątku...</div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-red-600 mb-8">{error || 'Wątek nie istnieje'}</div>
          <button onClick={() => navigate(-1)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-12 rounded-full text-xl">
            ← Wróć
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-cyan-600 hover:text-cyan-800 text-lg font-medium mb-10">
          <ArrowLeft size={28} /> Wróć do listy wątków
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12 border-l-8 border-cyan-600">
          <h1 className="text-5xl font-black text-blue-900 mb-8 leading-tight">{thread.title}</h1>
          {thread.image_url && <img src={thread.image_url} alt="Zadanie" className="max-w-full rounded-2xl shadow-2xl my-10 border-8 border-cyan-100" />}
          {thread.content && <p className="text-2xl text-gray-800 whitespace-pre-wrap leading-relaxed mb-10">{thread.content}</p>}
          <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200">
            <div className="text-xl font-bold text-blue-900">{thread.user_email}</div>
            <div className="text-gray-600">
              {new Date(thread.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-12">Odpowiedzi ({comments.length})</h2>

          {user && (
            <div className="mb-16 p-10 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl border-4 border-cyan-300">
              <textarea placeholder="Napisz swoją odpowiedź..." value={newComment} onChange={e => setNewComment(e.target.value)} rows={6}
                className="w-full p-6 border-2 border-gray-300 rounded-2xl focus:border-cyan-600 outline-none text-lg resize-none" />
              <div className="mt-6 flex items-center gap-6">
                <label className="flex items-center gap-4 px-8 py-5 bg-white rounded-2xl border-2 border-dashed cursor-pointer hover:bg-gray-50 transition text-lg font-medium">
                  <Upload size={32} className="text-cyan-600" />
                  <span>{imageFile ? imageFile.name : 'Dodaj zdjęcie rozwiązania'}</span>
                  <input type="file" accept="image/*" onChange={e => e.target.files && setImageFile(e.target.files[0])} className="hidden" />
                </label>
                <button onClick={addComment} disabled={!newComment.trim()}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white font-bold py-5 px-12 rounded-full flex items-center gap-4 text-xl transition transform hover:scale-105 disabled:hover:scale-100">
                  <Send size={32} /> Opublikuj
                </button>
              </div>
            </div>
          )}

          <div className="space-y-10">
            {comments.length === 0 ? (
              <div className="text-center py-20 text-3xl text-gray-500">Jeszcze nikt nie odpowiedział. Bądź pierwszy!</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-10 border-l-8 border-cyan-500">
                  <div className="flex justify-between mb-6">
                    <span className="text-2xl font-bold text-blue-900">{c.user_email}</span>
                    <span className="text-gray-600">{new Date(c.created_at).toLocaleDateString('pl-PL')}</span>
                  </div>
                  {c.image_url && <img src={c.image_url} alt="" className="max-w-full rounded-2xl shadow-xl my-8" />}
                  <p className="text-xl text-gray-800 whitespace-pre-wrap">{c.content}</p>
                  <button onClick={() => likeComment(c.id)} className="mt-6 flex items-center gap-3 text-red-600 font-bold">
                    <Heart size={28} fill="currentColor" /> {c.likes}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}