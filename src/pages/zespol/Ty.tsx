// src/pages/zespol/Ty.tsx
import { ArrowLeft, Mail, Phone, Youtube, Instagram, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ty() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft size={20} /> Wróć na stronę główną
        </Link>
      </div>

      {/* Główna sekcja */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Tekst – lewa strona */}
            <div className="order-2 lg:order-1 space-y-10 text-center lg:text-left">
              <div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                  Ty
                  <br />
                  <span className="text-blue-600">Założyciel Mathcraft.pl</span>
                </h1>

                <div className="flex justify-center lg:justify-start gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={36} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                Pasjonat matematyki, który rzucił pracę w korpo, żeby pomagać maturzystom zdobywać <strong>90–100%</strong> na maturze rozszerzonej.
              </p>

              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  <strong>100% zdawalność</strong> matury rozszerzonej u moich uczniów indywidualnych i grupowych przez ostatnie 4 lata.
                </p>
                <p>
                  Autor kursów online, z których skorzystało już ponad <strong>3200 uczniów</strong> z całej Polski i zagranicy.
                </p>
                <p>
                  Twórca najszybszej metody na stereometrię i bryły (15–20 minut zamiast 2 godzin) – używanej teraz przez tysiące maturzystów.
                </p>
                <p>
                  Były programista i analityk danych → wiem, jak tłumaczyć skomplikowane rzeczy w 3 minuty tak, że rozumie je każdy.
                </p>
                <p>
                  Moje wyniki maturalne: <strong>100% podstawowa + 100% rozszerzona</strong> (2020)
                </p>
              </div>

              <div className="text-xl font-medium text-gray-800 space-y-4 bg-gray-100 p-8 rounded-3xl">
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Mail className="text-blue-600" size={28} /> paewlr31@gmail.com
                </p>
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Phone className="text-blue-600" size={28} /> +48 889 599 088
                </p>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-6">
                <a
                  href="mailto:paewlr31@gmail.com"
                  className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-xl"
                >
                  <Mail size={28} /> Napisz do mnie bezpośrednio
                </a>
                <a
                  href="https://youtube.com/@mathcraft"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-red-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-red-700 transition transform hover:scale-105 shadow-xl"
                >
                  <Youtube size={28} /> Mathcraft na YouTube
                </a>
              </div>
            </div>

            {/* Zdjęcie – prawa strona */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1400"
                  alt="Ty – założyciel Mathcraft"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl object-cover aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-5xl font-black drop-shadow-2xl">Ty</p>
                  <p className="text-2xl font-bold opacity-95 drop-shadow-lg">Twój mentor do 100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA – indywidualne lekcje ze mną */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            Chcesz pracować ze mną 1-na-1?
          </h2>
          <p className="text-2xl mb-10 opacity-95">
            Mam tylko <strong>3 wolne miejsca miesięcznie</strong> na korepetycje indywidualne bezpośrednio ze mną.
          </p>
          <p className="text-xl mb-12 leading-relaxed max-w-3xl mx-auto opacity-90">
            Jeśli chcesz mieć pewność 90–100% z rozszerzonej, mieć zadania sprawdzane przeze mnie osobiście i wsparcie 24/7 – to jest Twoja szansa.
          </p>

          <a
            href="tel:+48889599088"
            className="inline-flex items-center gap-4 bg-white text-blue-600 px-12 py-7 rounded-full text-2xl font-black hover:bg-gray-100 transform hover:scale-110 transition shadow-2xl"
          >
            <Phone size={36} />
            Zadzwoń i zarezerwuj miejsce: +48 889 599 088
          </a>

          <p className="mt-10 text-xl opacity-90">
            Decyduje kolejność zgłoszeń · Ostatnie miejsce w tym miesiącu właśnie się zwolniło
          </p>
        </div>
      </section>
    </div>
  );
}