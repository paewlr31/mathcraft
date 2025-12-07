// src/pages/zespol/Anna.tsx
import { ArrowLeft, Mail, Phone, Star, GraduationCap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Anna() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/zespol" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium">
          <ArrowLeft size={20} /> Wróć do zespołu
        </Link>
      </div>

      {/* Główna sekcja – identyczna struktura jak u Ciebie */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Tekst – lewa strona */}
            <div className="order-2 lg:order-1 space-y-10 text-center lg:text-left">
              <div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                  Anna Kowalska
                  <br />
                  <span className="text-purple-700">Doktor matematyki · Ekspert IB</span>
                </h1>

                <div className="flex justify-center lg:justify-start gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={36} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                Prowadząca kursy IB Mathematics AA & AI (SL + HL). 12 lat doświadczenia w systemie międzynarodowym. Średnia ocena jej uczniów: <strong>6.8/7</strong>.
              </p>

              <div className="space-y-6 text-lg text-gray-700">
                <p className="flex items-center gap-3">
                  <GraduationCap className="text-purple-700 shrink-0" size={28} />
                  Doktor matematyki · Uniwersytet Warszawski
                </p>
                <p className="flex items-center gap-3">
                  <Globe className="text-purple-700 shrink-0" size={28} />
                  12 lat nauczania IB: Warszawa · Londyn · Singapur
                </p>
                <p><strong>100%</strong> Internal Assessment na 7 punktów u uczniów ostatnich 5 lat</p>
                <p>Autorka programu przygotowania do IA – używanego w 3 szkołach międzynarodowych</p>
                <p>Średnia z Paper 1 & 2 jej uczniów HL: <strong>6.9/7</strong></p>
                <p>Prowadzi wyłącznie grupy do 12 osób – pełna indywidualizacja</p>
              </div>

              <div className="text-xl font-medium text-gray-800 space-y-4 bg-gray-100 p-8 rounded-3xl">
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Mail className="text-purple-700" size={28} /> anna@mathcraft.pl
                </p>
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Phone className="text-purple-700" size={28} /> +48 889 599 088
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/kursy/ib-math"
                  className="inline-flex items-center gap-4 bg-purple-700 text-white px-12 py-6 rounded-full text-2xl font-black hover:bg-purple-800 transform hover:scale-105 transition shadow-2xl"
                >
                  Zobacz kurs IB Math z Anną
                </Link>
              </div>
            </div>

            {/* Zdjęcie – prawa strona */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1580489940927-7b5b57f8e3a5?q=80&w=1400"
                  alt="dr Anna Kowalska – ekspert IB Mathematics"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl object-cover aspect-square"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-5xl font-black drop-shadow-2xl">Anna</p>
                  <p className="text-2xl font-bold opacity-95 drop-shadow-lg">Twoja droga do 7 z IB Math</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mocny CTA na dole – analogiczny do Twojego */}
      <section className="py-20 bg-linear-to-br from-purple-700 to-indigo-800">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            Chcesz 7 z IB Mathematics?
          </h2>
          <p className="text-2xl mb-10 opacity-95">
            Anna przyjmuje <strong>tylko 12 uczniów</strong> na rok do swoich grup.
          </p>
          <p className="text-xl mb-12 leading-relaxed max-w-3xl mx-auto opacity-90">
            Jeśli chcesz mieć opiekę nad IA od A do Z, indywidualne omówienie każdej próbnej matury i gwarancję wyniku 6–7 – to jest Twoja szansa.
          </p>

          <a
            href="tel:+48889599088"
            className="inline-flex items-center gap-4 bg-white text-purple-700 px-12 py-7 rounded-full text-2xl font-black hover:bg-gray-100 transform hover:scale-110 transition shadow-2xl"
          >
            <Phone size={36} />
            Zadzwoń i zapytaj o miejsce: +48 889 599 088
          </a>

          <p className="mt-10 text-xl opacity-90">
            Ostatnie 2 miejsca na rok 2025/2026 · Decyduje kolejność
          </p>
        </div>
      </section>
    </div>
  );
}