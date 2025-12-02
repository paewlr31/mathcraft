// src/pages/sharedPages/blog/add/index.tsx
import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { nanoid } from 'nanoid';
import { Trash2, Plus } from 'lucide-react';
import { marked } from 'marked'; // <-- dodane

type Section = {
  id: string;
  title: string;
  content: string;
};

export default function AddPost() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [sections, setSections] = useState<Section[]>([
    { id: nanoid(), title: 'Wstęp', content: '' }
  ]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const addSection = () => {
    setSections([...sections, { id: nanoid(), title: 'Nowa sekcja', content: '' }]);
  };

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id: string) => {
    if (sections.length === 1) {
      setError('Musi być przynajmniej jedna sekcja!');
      return;
    }
    setSections(sections.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || sections.some(s => !s.title.trim() || !s.content.trim())) {
      setError('Wypełnij wszystkie pola – tytuł, opis i wszystkie sekcje!');
      return;
    }

    setLoading(true);
    setError('');

    const slug = generateSlug(title) + '-' + nanoid(6);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Musisz być zalogowany jako admin');
      setLoading(false);
      return;
    }

    const contentForDb = sections.map(s => ({
      type: 'section',
      title: s.title.trim(),
      content: s.content.trim()
    }));

    const { error: dbError } = await supabase.from('blog_posts').insert({
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      content: contentForDb,
      thumbnail_url: thumbnailUrl,
      author_id: user.id,
      is_published: true
    });

    if (dbError) {
      console.error(dbError);
      setError('Błąd podczas publikacji: ' + dbError.message);
      setLoading(false);
      return;
    }

    navigate('/blog');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white text-gray-700 rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold  text-purple-800 mb-8">
            Dodaj nowy wpis na bloga
          </h1>

          {error && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Miniaturka */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Zdjęcie główne posta
              </label>
              <ImageUploader onUpload={setThumbnailUrl} currentImage={thumbnailUrl} />
            </div>

            {/* Tytuł posta */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Tytuł posta
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 text-gray-700 rounded-xl text-xl focus:ring-2 focus:ring-purple-600"
                placeholder="Np. Matura 2025 – najważniejsze zmiany"
                required
              />
            </div>

            {/* Krótki opis */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Krótki opis (widoczny na liście)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600"
                placeholder="2-3 zdania, które zachęcą do przeczytania..."
                required
              />
            </div>

            {/* Sekcje z podglądem Markdown */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-800">Sekcje artykułu</h2>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-2  bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium transition"
                >
                  <Plus size={20} />
                  Dodaj sekcję
                </button>
              </div>

              <div className="space-y-10">
                {sections.map((section, index) => (
                  <div key={section.id} className="border text-gray-700 border-gray-300 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-purple-600">Sekcja {index + 1}</span>
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSection(section.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>

                    {/* Tytuł sekcji */}
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      className="w-full px-4 py-3 mb-6 text-2xl font-bold text-purple-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="Tytuł sekcji (np. Zmiany w arkuszach)"
                      required
                    />

                    {/* Treść + podgląd */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Treść (Markdown działa!)
                        </label>
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                          rows={10}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-mono text-sm"
                          placeholder="To jest **pogrubiony tekst**, a to *kursywa*.,- punkt pierwszy,- punkt drugi,[Link do Mathcraft](https://mathcraft.pl)"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Podgląd na żywo
                        </label>
                        <div className="p-5 bg-white border border-gray-200 rounded-lg prose prose-purple max-w-none min-h-48">
                          {section.content ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: marked(section.content, { breaks: true })
                              }}
                            />
                          ) : (
                            <p className="text-gray-400 italic">Tu pojawi się podgląd...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex gap-4 justify-end pt-8">
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-lg transition flex items-center gap-3"
              >
                {loading ? 'Publikowanie...' : 'Opublikuj wpis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}