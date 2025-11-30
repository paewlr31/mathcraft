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
          .order('created_at', { ascending: false });

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 animate-pulse text-center">
          Ładowanie wątku...
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-6 sm:mb-8">
            {error || 'Wątek nie istnieje'}
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 sm:py-4 sm:px-12 rounded-full text-lg sm:text-xl"
          >
            ← Wróć
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Przycisk powrotu */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 sm:gap-3 text-cyan-600 hover:text-cyan-800 text-base sm:text-lg font-medium mb-6 sm:mb-8 md:mb-10"
        >
          <ArrowLeft size={24} className="sm:w-7 sm:h-7" /> 
          <span className="hidden sm:inline">Wróć do listy wątków</span>
          <span className="sm:hidden">Wróć</span>
        </button>

        {/* Główny wątek */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 mb-8 sm:mb-10 md:mb-12 border-l-4 sm:border-l-8 border-cyan-600">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-blue-900 mb-4 sm:mb-6 md:mb-8 leading-tight">
            {thread.title}
          </h1>
          
          {thread.image_url && (
            <img 
              src={thread.image_url} 
              alt="Zadanie" 
              className="max-w-full rounded-xl sm:rounded-2xl shadow-2xl my-6 sm:my-8 md:my-10 border-4 sm:border-6 md:border-8 border-cyan-100" 
            />
          )}
          
          {thread.content && (
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 whitespace-pre-wrap leading-relaxed mb-6 sm:mb-8 md:mb-10">
              {thread.content}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pt-6 sm:pt-8 border-t-2 border-gray-200">
            <div className="text-lg sm:text-xl font-bold text-blue-900">{thread.user_email}</div>
            <div className="text-sm sm:text-base text-gray-600">
              {new Date(thread.created_at).toLocaleDateString('pl-PL', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>

        {/* Sekcja komentarzy */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-8 sm:mb-10 md:mb-12">
            Odpowiedzi ({comments.length})
          </h2>

          {/* Formularz dodawania komentarza */}
          {user && (
            <div className="mb-10 sm:mb-12 md:mb-16 text-gray-600 p-6 sm:p-8 md:p-10 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-cyan-300">
              <textarea 
                placeholder="Napisz swoją odpowiedź..." 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                rows={4}
                className="w-full p-4 sm:p-5 md:p-6 border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:border-cyan-600 outline-none text-base sm:text-lg resize-none" 
              />
              
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                <label className="flex items-center text-gray-600 justify-center sm:justify-start gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 bg-white rounded-xl sm:rounded-2xl border-2 border-dashed cursor-pointer hover:bg-gray-50 transition text-base sm:text-lg font-medium">
                  <Upload size={24} className="sm:w-8 text-gray-600 sm:h-8 text-cyan-600" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Dodaj zdjęcie'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => e.target.files && setImageFile(e.target.files[0])} 
                    className="hidden" 
                  />
                </label>
                
                <button 
                  onClick={addComment} 
                  disabled={!newComment.trim()}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-red-800 text-white font-bold py-4 sm:py-5 px-8 sm:px-12 rounded-full flex items-center justify-center gap-3 sm:gap-4 text-lg sm:text-xl transition transform hover:scale-105 disabled:hover:scale-100"
                >
                  <Send size={24} className="sm:w-8 sm:h-8" /> Opublikuj
                </button>
              </div>
            </div>
          )}

          {/* Lista komentarzy */}
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            {comments.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20 text-xl sm:text-2xl md:text-3xl text-gray-500">
                Jeszcze nikt nie odpowiedział. Bądź pierwszy!
              </div>
            ) : (
              comments.map(c => (
                <div 
                  key={c.id} 
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border-l-4 sm:border-l-8 border-cyan-500"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                      {c.user_email}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">
                      {new Date(c.created_at).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                  
                  {c.image_url && (
                    <img 
                      src={c.image_url} 
                      alt="" 
                      className="max-w-full rounded-xl sm:rounded-2xl shadow-xl my-4 sm:my-6 md:my-8" 
                    />
                  )}
                  
                  <p className="text-base sm:text-lg md:text-xl text-gray-800 whitespace-pre-wrap">
                    {c.content}
                  </p>
                  
                  <button 
                    onClick={() => likeComment(c.id)} 
                    className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3 text-red-600 font-bold text-base sm:text-lg"
                  >
                    <Heart size={20} className="sm:w-7 sm:h-7" fill="currentColor" /> 
                    {c.likes}
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