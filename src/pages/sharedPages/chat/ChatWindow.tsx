import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Props {
  currentUserId: string;
  recipientId: string;
  onBack: () => void;
}

export default function ChatWindow({ currentUserId, recipientId, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<{ email: string; role: string } | null>(null);
  
  // Kluczowa referencja – tylko ten kontener się scrolluje
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll na dół (bez wpływu na resztę strony)
  const scrollToBottom = () => {
    // Używamy requestAnimationFrame, aby zapewnić, że scroll nastąpi po renderowaniu wiadomości
    requestAnimationFrame(() => {
        messagesContainerRef.current?.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    });
  };

  // Pobierz odbiorcę
  useEffect(() => {
    supabase
      .from('profiles')
      .select('email, role')
      .eq('id', recipientId)
      .single()
      .then(({ data }) => setRecipient(data));
  }, [recipientId]);

  // REALTIME + FETCH + SCROLL
  useEffect(() => {
    // 1. Funkcja do pobierania historycznych wiadomości
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),` +
          `and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        scrollToBottom(); 
      }
    };

    fetchMessages();

    // 2. Konfiguracja kanału Realtime dla wiadomości PRZYCHODZĄCYCH
    // Nazwa kanału unikalna dla tej konwersacji (posortowane ID)
    const channelName = [currentUserId, recipientId].sort().join('-'); 
    
    const channel = supabase
      .channel(`chat_room:${channelName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // **KLUCZOWA ZMIANA FILTRA:** Nasłuchujemy na WSZYSTKIE wiadomości, 
          // które do nas dotarły (My jesteśmy receiver_id) ORAZ,
          // które zostały wysłane przez drugą osobę (recipientId).
          // Zapewnia to, że otrzymujemy tylko relewantne wiadomości przychodzące.
          // Wiadomości wychodzące (gdzie sender_id = currentUserId) dodajemy ręcznie w sendMessage.
          filter: `sender_id=eq.${recipientId},receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Bezpieczna kontrola, aby uniknąć duplikatów i mieć pewność, że to właściwa wiadomość
          setMessages(prev => {
             if (!prev.some(msg => msg.id === newMsg.id)) {
                 return [...prev, newMsg];
             }
             return prev;
          });
          
          scrollToBottom();
        }
      )
      .subscribe();

    // 3. Czyszczenie subskrypcji przy odmontowywaniu lub zmianie ID
    return () => {
      // WAŻNE: Upewnij się, że używasz tej samej nazwy kanału do usunięcia, 
      // jaką użyłeś do subskrypcji, by uniknąć wycieków subskrypcji.
      supabase.removeChannel(channel);
    };
  }, [currentUserId, recipientId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');
    
    // Dodajemy 'select()' aby otrzymać z powrotem wstawiony obiekt wiadomości 
    // z poprawnym 'id' i 'created_at'.
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: recipientId,
        content,
      })
      .select() 
      .single(); 

    if (error) {
      setNewMessage(content);
      console.error('Błąd podczas wysyłania wiadomości:', error);
    } else if (data) {
      // **DODAWANIE LOKALNE:** Dodaj wiadomość do stanu NATYCHMIAST po sukcesie!
      setMessages(prev => [...prev, data as Message]);
      scrollToBottom();
    }
  };

  if (!recipient) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Nagłówek – sticky, nie scrolluje się z wiadomościami */}
      <div className="bg-blue-700 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-lg">
        <button onClick={onBack} className="text-2xl md:hidden">
          &larr;
        </button>
        <div className="w-11 h-11 rounded-full bg-white text-blue-700 flex items-center justify-center font-bold text-lg">
          {recipient.email[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg truncate">{recipient.email}</p>
          <p className="text-xs opacity-90">{recipient.role}</p>
        </div>
      </div>

      {/* TYLKO TEN KONTENER SIĘ SCROLLUJE – reszta strony stoi! */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-md px-4 py-3 rounded-2xl shadow-sm break-words ${
                msg.sender_id === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-base">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-500'}`}>
                {new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

        {/* Pole wysyłania – sticky na dole */}
  <div className="sticky bottom-0 bg-white border-t p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
    <div className="flex gap-2">
      <input
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        className="flex-1 px-4 py-3 text-blue-700 border rounded-full focus:border-blue-500 focus:outline-none"
        placeholder="Napisz wiadomość..."
        autoFocus
      />
      <button
        onClick={sendMessage}
        disabled={!newMessage.trim()}
        className={`px-6 py-3 rounded-full font-medium transition ${
          newMessage.trim()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Wyślij
      </button>
    </div>
  </div>
</div>  );
}