import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type Task = {
  id: string;
  title: string;
  content: string;
  solution: string;
  order_num: number;
};

export default function TopicPage() {
  const { levelSlug, sectionSlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [showSolutions, setShowSolutions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    (async () => {
      const { data: topic } = await supabase
        .from('knowledge_topics')
        .select('title')
        .eq('slug', topicSlug)
        .single();

      const { data: tasksData } = await supabase
        .from('knowledge_tasks')
        .select('*')
        .eq('topic_id', (await supabase.from('knowledge_topics').select('id').eq('slug', topicSlug).single()).data?.id)
        .order('order_num');

      setTopicTitle(topic?.title || '');
      setTasks(tasksData || []);
    })();
  }, [topicSlug]);

  const toggleSolution = (id: string) => {
    setShowSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-800 via-yellow-600 to-orange-600 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* PRZYCISK POWRÓT */}
        <button
          onClick={() => navigate(`/sharedPages/baza-wiedzy/${levelSlug}/${sectionSlug}`)}
          className="mb-12 text-white hover:text-cyan-300 text-xl font-bold flex items-center gap-3 transition"
        >
          ← Powrót do listy tematów
        </button>

        <h1 className="text-5xl md:text-6xl font-black text-white text-center mb-16 drop-shadow-2xl">
          {topicTitle}
        </h1>

        <div className="space-y-12">
          {tasks.length === 0 ? (
            <div className="text-center text-white text-2xl bg-white/10 backdrop-blur-md rounded-2xl p-12">
              Zadania w trakcie dodawania...
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-3xl shadow-2xl p-10">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">{task.title}</h3>
                
                <div 
                  className="prose prose-lg max-w-none mb-8 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: task.content.replace(/\n/g, '<br>') }}
                />

                <button
                  onClick={() => toggleSolution(task.id)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl px-10 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                >
                  {showSolutions[task.id] ? 'Ukryj rozwiązanie' : 'Pokaż rozwiązanie'}
                </button>

                {showSolutions[task.id] && (
                  <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300">
                    <h4 className="text-2xl font-black text-green-800 mb-4">Rozwiązanie:</h4>
                    <div 
                      className="prose prose-lg text-gray-800"
                      dangerouslySetInnerHTML={{ __html: task.solution.replace(/\n/g, '<br>') }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}