// src/pages/kursy/Korepetycje.tsx
import { ArrowLeft, Check, Star, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Korepetycje() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft size={20} /> Wróć na stronę główną
        </Link>
      </div>

      {/* Główna sekcja – taki sam layout jak rozszerzona/podstawowa */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Zdjęcie – najpierw na mobile */}
            <div className="order-1 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400"
                alt="Korepetycje indywidualne matematyka online"
                className="w-full rounded-3xl shadow-2xl object-cover aspect-[4/3] lg:aspect-auto lg:h-full"
              />
            </div>

            {/* Tekst + przycisk */}
            <div className="order-2 lg:order-2 space-y-8 text-center lg:text-left">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  Korepetycje indywidualne
                </h1>
                <div className ="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4">
                  <span className="text-3xl font-bold text-gray-800">1 na 1 · Online</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={32} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Indywidualne lekcje na żywo z doświadczonym nauczycielem – idealnie dopasowane do Ciebie i Twojego poziomu.
              </p>

              <div className="space-y-5 max-w-md mx-auto lg:mx-0">
                {[
                  "100% dopasowany plan",
                  "Nauczyciel z 100% zdawalnością",
                  "Interaktywna tablica + nagrania",
                  "Elastyczne terminy 7 dni w tygodniu",
                  "Bezpłatna lekcja próbna"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="bg-blue-600 text-white rounded-full p-2 flex-shrink-0">
                      <Check size={20} />
                    </div>
                    <span className="text-lg font-medium text-gray-800">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <a
                  href="tel:+48889599088"
                  className="inline-block w-full max-w-sm bg-blue-600 text-white text-center text-2xl font-bold py-6 rounded-full hover:bg-blue-700 transform hover:scale-105 transition duration-300 shadow-2xl"
                >
                  Umów darmową lekcję próbną
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Szczegółowy opis – niebieskie kreski */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 space-y-16 text-lg text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Jak wyglądają zajęcia?</h2>
            <div className="w-32 h-1 bg-blue-600 rounded-full mb-8"></div>
            <p>
              Spotykamy się na żywo na platformie z interaktywną tablicą (jak w szkole, tylko lepszą). Lekcja trwa 60 lub 90 minut – Ty decydujesz. Po zajęciach dostajesz nagranie + zadania domowe + pełne omówienie.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Dla kogo?</h2>
            <div className="w-32 h-1 bg-blue-600 rounded-full mb-8"></div>
            <p>
              Klasy 4–8 · Liceum · Matura podstawowa i rozszerzona · IB SL/HL · Studia (analiza, algebra) · Egzamin ósmoklasisty · Poprawki matury
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Ceny – bez ściemy</h2>
            <div className="w-32 h-1 bg-blue-600 rounded-full mb-8"></div>
            <p>
              <strong>60 min – od 70 zł</strong> · 90 min – od 100 zł<br />
              Im więcej lekcji w pakiecie – tym taniej. Płatność po lekcji lub pakiety z rabatem do -30%.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Bezpłatna lekcja próbna</h2>
            <div className="w-32 h-1 bg-blue-600 rounded-full mb-8"></div>
            <p>
              Umawiasz 30–45 minutową lekcję za darmo. Sprawdzasz nauczyciela, metodę i platformę. Nic nie ryzykujesz.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Gwarancja efektów</h2>
            <div className="w-32 h-1 bg-blue-600 rounded-full mb-8"></div>
            <p>
              100% zdawalność matury u uczniów indywidualnych (ostatnie 4 lata) · średni wzrost o 38 pkt na maturze rozszerzonej.
            </p>
          </div>

          {/* Kontakt – niebieski */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 md:p-12 rounded-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-black mb-8">Chcesz zacząć? Zadzwoń albo napisz!</h3>
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
              Odpisujemy i oddzwaniamy w ciągu <strong>15 minut</strong> – nawet w weekendy!
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}