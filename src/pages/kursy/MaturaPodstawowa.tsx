// src/pages/kursy/MaturaPodstawowa.tsx
import { ArrowLeft, Check, Star, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MaturaPodstawowa() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft size={20} /> Wróć na stronę główną
        </Link>
      </div>

      {/* Główna sekcja – mobile-first: najpierw zdjęcie, potem tekst */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Zdjęcie – na mobile na górze */}
            <div className="order-1 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1509062572359-1b30d7a1e7e4?q=80&w=1400"
                alt="Kurs matura podstawowa online"
                className="w-full rounded-3xl shadow-2xl object-cover aspect-[4/3] lg:aspect-auto lg:h-full"
              />
            </div>

            {/* Tekst + przycisk */}
            <div className="order-2 lg:order-2 space-y-8 text-center lg:text-left">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  Matematyka Podstawowa
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4">
                  <span className="text-3xl font-bold text-gray-800">Online</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={32} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Grupowy kurs maturalny online z matematyki podstawowej – prosty, skuteczny, bez stresu.
              </p>

              <div className="space-y-5 max-w-md mx-auto lg:mx-0">
                {[
                  "Zajęcia na żywo",
                  "Dostęp do nagrań",
                  "Proste wyjaśnienia",
                  "Bezpłatna lekcja próbna"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="bg-green-600 text-white rounded-full p-2 flex-shrink-0">
                      <Check size={20} />
                    </div>
                    <span className="text-lg font-medium text-gray-800">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link
                  to="/formularz/matura-podstawowa"
                  className="inline-block w-full max-w-sm bg-green-600 text-white text-center text-2xl font-bold py-6 rounded-full hover:bg-green-700 transform hover:scale-105 transition duration-300 shadow-2xl"
                >
                  Zapisz się
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Szczegółowy opis – zielone kreski */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 space-y-16 text-lg text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Opis kursu</h2>
            <div className="w-32 h-1 bg-green-600 rounded-full mb-8"></div>
            <p>
              Kurs realizowany jest w pełni online, w formule zajęć na żywo w małych grupach. Lekcje odbywają się raz w tygodniu i trwają 120 minut. Startujemy w październiku – dokładny dzień ustalamy wspólnie z grupą.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Zawartość kursu</h2>
            <div className="w-32 h-1 bg-green-600 rounded-full mb-8"></div>
            <p>
              Kurs obejmuje <strong>28 lekcji tematycznych + 4 powtórkowe</strong>. Do każdej lekcji dostajesz zestaw zadań domowych z arkuszy CKE + autorskie materiały. Wszystko wyjaśnione tak prosto, że zrozumiesz nawet jeśli dziś masz 20%.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Przystępna cena</h2>
            <div className="w-32 h-1 bg-green-600 rounded-full mb-8"></div>
            <p>
              Cały kurs kosztuje tylko <strong>599 zł</strong> – czyli mniej niż <strong>43 zł za 120-minutową lekcję na żywo</strong>. Płatność ratalna 0%, 14 dni na zwrot pieniędzy.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Bezpłatna pierwsza lekcja</h2>
            <div className="w-32 h-1 bg-green-600 rounded-full mb-8"></div>
            <p>
              Zapisz się i weź udział w pierwszej lekcji za darmo. Nie spodoba się – wychodzisz bez żadnych zobowiązań.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Zadania domowe i symulacje</h2>
            <div className="w-32 h-1 bg-green-600 rounded-full mb-8"></div>
            <p>
              Co miesiąc robimy pełną symulację matury podstawowej z poprawą i analizą błędów. Dzięki temu w maju wchodzisz na maturę spokojny i pewny wyniku.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Dostęp do nagrań</h2>
            <div className="w-32 h-1 bg-green-600 rounded-full mb-8"></div>
            <p>
              Nie możesz być na żywo? Otrzymujesz nagranie każdej lekcji + materiały w PDF. Powtórki kiedy chcesz.
            </p>
          </div>

          {/* Kontakt – zielony */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-8 md:p-12 rounded-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-black mb-8">Masz pytania? Odezwij się!</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="tel:+48889599088"
                className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/10 hover:bg-white/20 px-8 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Phone size={40} />
                <div className="text-center sm:text-left">
                  <p className="font-bold text-xl">Zadzwoń</p>
                  <p className="text-lg opacity-95">+48 889 599 088</p>
                </div>
              </a>
              <a
                href="mailto:kontakt.mathcraft@gmail.com"
                className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/10 hover:bg-white/20 px-8 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Mail size={40} />
                <div className="text-center sm:text-left">
                  <p className="font-bold text-xl">Napisz</p>
                  <p className="text-lg opacity-95">kontakt.mathcraft@gmail.com</p>
                </div>
              </a>
            </div>
            <p className="mt-8 text-lg opacity-90">
              Odpisujemy w ciągu <strong>30 minut</strong> – nawet w weekendy!
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}