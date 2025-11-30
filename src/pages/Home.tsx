// src/pages/Home.tsx
import { useState, useRef, useEffect, use } from 'react';
import { ChevronDown, Menu, X, Phone, Mail, Facebook, Instagram, ChevronLeft, ChevronRight, LogOut, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [itemsPerView, setItemsPerView] = useState(1);
  const navigate = useNavigate();

  // Sesja Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Responsywna karuzela
  useEffect(() => {
    const updateItemsPerView = () => {
      const newVal = window.innerWidth >= 768 ? 3 : 1;
      if (newVal !== itemsPerView) {
        setItemsPerView(newVal);
        setCurrentSlide(newVal);
      }
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [itemsPerView]);

  const courses = [
    { title: "Matematyka Rozszerzona", desc: "Pełny kurs maturalny na 100% – poziom rozszerzony", img: "https://images.unsplash.com/photo-1509228628319-2b2cc7d1f58a?q=80&w=800", path: "/kursy/matura-rozszerzona" },
    { title: "Matematyka Podstawowa", desc: "Solidne przygotowanie do matury na poziomie podstawowym", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc1ebde?q=80&w=800", path: "/kursy/matura-podstawowa" },
    { title: "Matematyka IB SL/HL", desc: "Kurs do matury międzynarodowej – Standard i Higher Level", img: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800", path: "/kursy/ib-math" },
    { title: "Korepetycje indywidualne", desc: "Zajęcia 1-na-1 dostosowane dokładnie do Twoich potrzeb", img: "https://images.unsplash.com/photo-1517248135467-2c7ed3f9e270?q=80&w=800", path: "/kursy/korepetycje" },
  ];

  const team = [
    { name: "Ty", desc: "Założyciel Mathcraft – pasjonat matematyki i nauczania", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400", path: "/zespol/ty" },
    { name: "Anna Kowalska", desc: "Doktor matematyki, 12 lat doświadczenia w IB", photo: "https://images.unsplash.com/photo-1580489940927-7b5b57f8e3a5?q=80&w=400", path: "/zespol/anna" },
    { name: "Michał Nowak", desc: "Specjalista matura rozszerzona – 100% zdawalność", photo: "https://images.unsplash.com/photo-1554151228-14d9def65654?q=80&w=400", path: "/zespol/michal" },
    { name: "Kasia Wiśniewska", desc: "Mistrzyni wyjaśniania podstaw w 5 minut", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400", path: "/zespol/kasia" },
  ];

  const extendedCourses = [...courses.slice(-itemsPerView), ...courses, ...courses.slice(0, itemsPerView)];

  const nextSlide = () => {
    setCurrentSlide(prev => {
      const next = prev + 1;
      if (next >= courses.length + itemsPerView) return itemsPerView;
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentSlide(prev => {
      const next = prev - 1;
      if (next < itemsPerView) return courses.length;
      return next;
    });
  };

  const sections = {
    home: useRef<HTMLDivElement | null>(null),
    bazaWiedzy: useRef<HTMLDivElement | null>(null),
    dlaczego: useRef<HTMLDivElement | null>(null),
    korepetycje: useRef<HTMLDivElement | null>(null),
    kursy: useRef<HTMLDivElement | null>(null),
    forum: useRef<HTMLDivElement | null>(null),
    zespol: useRef<HTMLDivElement | null>(null),
    faq: useRef<HTMLDivElement | null>(null),
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">MATHCRAFT.PL</h1>

          <div className="hidden md:flex gap-8 items-center">
            <button onClick={() => scrollToSection(sections.bazaWiedzy)} className="hover:text-blue-600 transition">Baza Wiedzy</button>
            <button onClick={() => scrollToSection(sections.dlaczego)} className="hover:text-blue-600 transition">Kursy</button>
            <button onClick={() => scrollToSection(sections.korepetycje)} className="hover:text-blue-600 transition">Korepetycje</button>
            <button onClick={() => scrollToSection(sections.forum)} className="hover:text-blue-600 transition">Forum</button>

            {session ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                  <LogOut size={20} />
                  <span className="hidden lg:inline">Wyloguj się</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="border border-blue-600 text-blue-600 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 transition">
                  Zaloguj się
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">
                  Zarejestruj się
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} color="#1D4ED8" /> : <Menu size={28} color="#1D4ED8" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden  text-gray-700 bg-white border-t">
            <div className="flex flex-col gap-5 p-6 text-lg">
              <button onClick={() => scrollToSection(sections.bazaWiedzy)}>Baza Wiedzy</button>
              <button onClick={() => scrollToSection(sections.dlaczego)}>Kursy</button>
              <button onClick={() => scrollToSection(sections.korepetycje)}>Korepetycje</button>
              <button onClick={() => scrollToSection(sections.forum)}>Forum</button>
              {session ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="font-bold text-blue-600">Dashboard</Link>
                  <button onClick={handleLogout} className="text-red-600 font-bold text-left">Wyloguj się</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-bold">Zaloguj się</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-bold">
                    Zarejestruj się
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hero */}
      <section ref={sections.home} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black/60 to-black/40 z-10"></div>
        <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1932&auto=format&fit=crop" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 text-center text-white px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Korepetycje i kursy maturalne</h1>
          <p className="text-xl md:text-2xl mb-12">
            Przygotuj się do polskiej i angielskiej matury oraz zdobądź pewność w szkole podstawowej, liceum i liceum IB dzięki naszym kursom i korepetycjom!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button onClick={() => scrollToSection(sections.korepetycje)} className="btn btn-lg btn-primary">Korepetycje</button>
            <button onClick={() => scrollToSection(sections.kursy)} className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-black">Egzaminy – kursy</button>
            <button onClick={() => scrollToSection(sections.kursy)} className="btn btn-lg btn-secondary">Kursy IB Matematyka</button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={40} className="text-white" />
        </div>
      </section>
      {/* Baza Wiedzy */}
      <section ref={sections.bazaWiedzy} className="py-24 bg-linear-to-br from-yellow-800 via-yellow-600 to-yellow-400 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-8 drop-shadow-lg">Odkryj naszą Bazę Wiedzy!</h2>
          <p className="text-xl md:text-2xl mb-12 font-medium opacity-90 max-w-3xl mx-auto">
            Setki artykułów, poradników i materiałów edukacyjnych dostępnych dla każdego – ucz się w swoim tempie, bez logowania!
          </p>
          <button 
            className="btn btn-lg bg-white text-green-900 hover:bg-cyan-400 hover:text-green-950 font-bold text-xl px-12 py-6 shadow-2xl transform hover:scale-105 transition"
            onClick={() => navigate('/sharedPages/baza-wiedzy')}
          >
            Przejdź do Bazy Wiedzy
          </button>
          <p className="mt-6 text-lg opacity-80">Dostęp do materiałów dla wszystkich odwiedzających.</p>
        </div>
      </section>

      {/* Dlaczego my? */}
      <section ref={sections.dlaczego} className="py-20 bg-gray-50">
        <div className="max-w-7xl text-gray-700 mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Dlaczego stworzyliśmy nasze kursy?</h2>
          <p className="text-xl text-center max-w-4xl mx-auto mb-16">
            Przygotowania do egzaminów mogą być przytłaczające — szczególnie gdy nie wiesz, od czego zacząć. Nasze kursy powstały po to, by pomóc Ci uporządkować materiał i krok po kroku przybliżać się do celu: dostania się na wymarzone studia!
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Korzystna Cena", icon: "Money" },
              { title: "Darmowa lekcja próbna", icon: "Gift" },
              { title: "Nowoczesne Metody Nauki", icon: "Rocket" },
              { title: "Zgodność z Podstawą", icon: "Check" },
              { title: "Dostęp do nagrań", icon: "Video" },
              { title: "Dzielenie płatności", icon: "Credit Card" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Korepetycje */}
      <section ref={sections.korepetycje} className="py-24 bg-linear-to-br from-red-800 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg">Korepetycje dla każdego</h2>
          <p className="text-2xl md:text-3xl mb-12 font-bold drop-shadow-md">
            Już od <span className="text-5xl md:text-6xl text-yellow-400">70 zł</span>/60 min!
          </p>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto mb-16">
            <div className="bg-white text-gray-900 p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition duration-300">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-red-600">Szkoła podstawowa</h3>
              <p className="text-lg md:text-xl font-medium">Matematyka • Fizyka • Angielski</p>
            </div>
            <div className="bg-white text-gray-900 p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition duration-300">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-red-600">Liceum</h3>
              <p className="text-lg md:text-xl font-medium">Matematyka rozszerzona i podstawowa</p>
            </div>
            <div className="bg-white text-gray-900 p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition duration-300">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-red-600">Liceum IB</h3>
              <p className="text-lg md:text-xl font-medium">Mathematics AA/AI • SL / HL</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 md:gap-12 justify-center items-center text-xl md:text-2xl font-bold mb-12">
            <a href="mailto:kontakt.mathcraft@gmail.com" className="flex items-center gap-4 hover:text-yellow-300 transition">
              <Mail size={36} /> kontakt.mathcraft@gmail.com
            </a>
            <a href="tel:+48889599088" className="flex items-center gap-4 hover:text-yellow-300 transition">
              <Phone size={36} /> +48 889 599 088
            </a>
          </div>
          <button className="btn btn-lg bg-white text-red-600 hover:bg-yellow-400 hover:text-red-700 font-bold text-xl px-12 py-6 shadow-2xl transform hover:scale-105 transition">
            Umów się na darmową lekcję próbną!
          </button>
          <p className="mt-6 text-lg opacity-90">Napisz lub zadzwoń – odpowiemy w ciągu 30 minut!</p>
        </div>
      </section>

      {/* KARUZELA KURSÓW – Z LINKAMI */}
      <section ref={sections.kursy} className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-700">Nasze kursy</h2>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}>
                {extendedCourses.map((course, i) => (
                  <div key={i} className="shrink-0 px-4" style={{ width: `${100 / itemsPerView}%` }}>
                    <Link to={course.path} className="block group">
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                        <img src={course.img} alt={course.title} className="w-full h-64 object-cover" />
                        <div className="p-8">
                          <h3 className="text-2xl font-bold mb-3 text-gray-800">{course.title}</h3>
                          <p className="text-gray-600 mb-6">{course.desc}</p>
                          <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                            Dowiedz się więcej <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-2xl z-10"><ChevronLeft size={32} /></button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-2xl z-10"><ChevronRight size={32} /></button>
          </div>
        </div>
      </section>

      {/* Forum */}
      <section ref={sections.forum} className="py-24 bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-8 drop-shadow-lg">Dołącz do społeczności Mathcraft!</h2>
          <p className="text-xl md:text-2xl mb-12 font-medium opacity-90 max-w-3xl mx-auto">
            Setki rozwiązanych zadań maturalnych, porady od innych maturzystów, wsparcie 24/7 i zero ściemy – tylko konkretna pomoc!
          </p>
          <button 
          className="btn btn-lg bg-white text-blue-900 hover:bg-cyan-400 hover:text-blue-950 font-bold text-xl px-12 py-6 shadow-2xl transform hover:scale-105 transition"
          onClick={() => navigate('/forum')}>
            Wejdź na forum teraz!
          </button>
          <p className="mt-6 text-lg opacity-80">Już ponad 3 200 uczniów korzysta codziennie</p>
        </div>
      </section>

      {/* ZESPÓŁ – Z LINKAMI */}
      <section ref={sections.zespol} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Nasz zespół</h2>
          <div className="grid md:grid-cols-4 gap-10">
            {team.map((person, i) => (
              <Link key={i} to={person.path} className="block group text-center">
                <div className="transform hover:scale-105 transition duration-300">
                  <img src={person.photo} alt={person.name} className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-blue-100 group-hover:border-blue-600 transition" />
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition">{person.name}</h3>
                  <p className="text-gray-600 mt-2">{person.desc}</p>
                  <button className="mt-4 text-blue-600 font-medium flex items-center gap-1 mx-auto group-hover:gap-2 transition">
                    Dowiedz się więcej <ArrowRight size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={sections.faq} className="py-24 bg-linear-to-br from-emerald-800 via-green-700 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-16 drop-shadow-lg">Często zadawane pytania</h2>
          <div className="space-y-6">
            {[
              { q: "Jak zapisać się na kurs maturalny?", a: "Wystarczy wybrać kurs i wypełnić formularz zapisowy, lub napisać bezpośrednio na kontakt.mathcraft@gmail.com – odpisujemy w max 15 minut!" },
              { q: "Jak zapisać się na korepetycje?", a: "Zadzwoń (+48 889 599 088) lub napisz – dobierzemy Ci najlepszego nauczyciela w ciągu godziny." },
              { q: "Czy zajęcia odbywają się online czy stacjonarnie?", a: "Wszystkie zajęcia są w 100% online, na żywo, z interaktywną tablicą i nagraniami." },
              { q: "Czy mogę rozłożyć płatność na raty?", a: "Oczywiście! Nawet na 12 rat 0% – pisz śmiało." },
              { q: "Co jeśli nie spodoba mi się kurs?", a: "Masz 14 dni na zwrot bez podania przyczyny + darmowa lekcja próbna." },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                <button
                  className="w-full px-8 py-7 text-left flex justify-between items-center hover:bg-white/10 transition-all duration-300"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="text-xl md:text-2xl font-bold pr-4">{item.q}</span>
                  <ChevronDown size={32} className={`transition-transform duration-300 shrink-0 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-8 pb-8 pt-2 text-lg md:text-xl text-green-50 opacity-95 leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <p className="text-xl md:text-2xl font-medium opacity-90">Masz inne pytanie? Pisz śmiało – odpowiadamy 7 dni w tygodniu!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-2xl font-bold mb-6">MATHCRAFT.PL</h3>
              <p className="text-gray-400">Twoja droga do 100% z matury z matematyki.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Obserwuj nas</h4>
              <div className="flex gap-6">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook size={32} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={32} /></a>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Prawne</h4>
              <div className="space-y-2">
                <a href="/assets/documents/polityka_prywatnosci.pdf" className="block hover:text-gray-400">Polityka prywatności</a>
                <a href="/assets/documents/regulamin.pdf" className="block hover:text-gray-400">Regulamin</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            © 2025 Mathcraft. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </>
  );
}