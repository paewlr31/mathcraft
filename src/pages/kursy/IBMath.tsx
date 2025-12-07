// src/pages/kursy/IBMath.tsx
import { ArrowLeft, Check, Star, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IBMath() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft size={20} /> Wróć na stronę główną
        </Link>
      </div>

      {/* Główna sekcja – mobile-first: najpierw zdjęcie */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Zdjęcie – najpierw na telefonie */}
            <div className="order-1 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1532619675605-1ede1939e1c9?q=80&w=1400"
                alt="Kurs IB Mathematics AA & AI"
                className="w-full rounded-3xl shadow-2xl object-cover aspect-4/3 lg:aspect-auto lg:h-full"
              />
            </div>

            {/* Tekst + przycisk */}
            <div className="order-2 lg:order-2 space-y-8 text-center lg:text-left">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  Matematyka IB
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4">
                  <span className="text-3xl font-bold text-gray-800">AA · AI · SL & HL</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={32} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Kurs do matury międzynarodowej prowadzony przez doktora matematyki z 12-letnim doświadczeniem w IB.
              </p>

              <div className="space-y-5 max-w-md mx-auto lg:mx-0">
                {[
                  "Pełny program IB Math",
                  "Internal Assessment od A do Z",
                  "Egzaminy próbne + szczegółowy feedback",
                  "Bezpłatna lekcja próbna"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="bg-purple-700 text-white rounded-full p-2 shrink-0">
                      <Check size={20} />
                    </div>
                    <span className="text-lg font-medium text-gray-800">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link
                  to="/formularz/ib-math"
                  className="inline-block w-full max-w-sm bg-purple-700 text-white text-center text-2xl font-bold py-6 rounded-full hover:bg-purple-800 transform hover:scale-105 transition duration-300 shadow-2xl"
                >
                  Zapisz się
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Szczegółowy opis – fioletowe kreski */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 space-y-16 text-lg text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Dla kogo jest ten kurs?</h2>
            <div className="w-32 h-1 bg-purple-700 rounded-full mb-8"></div>
            <p>
              IB Mathematics: Analysis and Approaches (AA) SL & HL · Applications and Interpretation (AI) SL<br />
              Idealny dla uczniów międzynarodowych liceów w Polsce i za granicą.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Prowadząca – dr Anna Kowalska</h2>
            <div className="w-32 h-1 bg-purple-700 rounded-full mb-8"></div>
            <p>
              Doktor matematyki (UW) · 12 lat nauczania w systemie IB (Warszawa, Londyn, Singapur) · Średnia ocena jej uczniów: <strong>6.8/7</strong> · 100% IA na 7 punktów.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Internal Assessment (IA)</h2>
            <div className="w-32 h-1 bg-purple-700 rounded-full mb-8"></div>
            <p>
              Pełna pomoc: wybór tematu → badania → pisanie → korekty → finalna wersja. Z Anną 7 z IA to standard.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Cena i terminy</h2>
            <div className="w-32 h-1 bg-purple-700 rounded-full mb-8"></div>
            <p>
              Cały kurs (2 lata): <strong>1499 zł</strong> · Start: październik 2025 · Lekcje co tydzień (120 min) + dostęp do nagrań i materiałów.
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Bezpłatna lekcja próbna</h2>
            <div className="w-32 h-1 bg-purple-700 rounded-full mb-8"></div>
            <p>
              Zapisz się i weź udział w pełnej lekcji próbnej z dr Anną – bez zobowiązań.
            </p>
          </div>

          {/* Kontakt – fioletowy */}
          <div className="bg-linear-to-r from-purple-700 to-indigo-800 text-white p-8 md:p-12 rounded-3xl text-center">
            <h3 className="text-3xl md:text-4xl font-black mb-8">Chcesz 7 z IB Math? Odezwij się!</h3>
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