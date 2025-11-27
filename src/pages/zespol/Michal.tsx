// src/pages/zespol/Michal.tsx
import { ArrowLeft, Mail, Phone, Star, Trophy, Target, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Michal() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/zespol" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
          <ArrowLeft size={20} /> Wróć do zespołu
        </Link>
      </div>

      {/* Główna sekcja – dokładnie jak u Ciebie i Anny */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Tekst */}
            <div className="order-2 lg:order-1 space-y-10 text-center lg:text-left">
              <div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                  Michał Nowak
                  <br />
                  <span className="text-orange-600">Specjalista matura rozszerzona</span>
                </h1>

                <div className="flex justify-center lg:justify-start gap-2 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={36} className="text-yellow-500 fill-yellow-500" />
                  ))}
                  <Flame size={36} className="text-orange-500 fill-orange-500" />
                </div>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                Król matury rozszerzonej. 100% zdawalność przez 5 lat z rzędu. Średni wynik jego uczniów w 2024: <strong>94%</strong>.
              </p>

              <div className="space-y-6 text-lg text-gray-700">
                <p className="flex items-center gap-3">
                  <Trophy className="text-orange-600" size={28} />
                  <strong>5 lat z rzędu 100% zdawalność</strong> matury rozszerzonej
                </p>
                <p className="flex items-center gap-3">
                  <Target className="text-orange-600" size={28} />
                  Rekordzista Mathcraft: uczeń z 96% w 2023 i 98% w 2024
                </p>
                <p>Autor legendarnych „czerwonych kartek” – ściąg z dowodami i bryłami, które ma każdy maturzysta w Polsce</p>
                <p>Prowadzi tylko grupy do 15 osób + indywidualne 1-na-1</p>
                <p>Były olimpijczyk – medalista OKM i finalistą OM</p>
                <p>Mówi się, że jak Michał coś wytłumaczy raz – pamiętasz na zawsze</p>
              </div>

              <div className="text-xl font-medium text-gray-800 space-y-4 bg-gray-100 p-8 rounded-3xl">
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Mail className="text-orange-600" size={28} /> michal@mathcraft.pl
                </p>
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Phone className="text-orange-600" size={28} /> +48 889 599 088
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/kursy/matura-rozszerzona"
                  className="inline-flex items-center gap-4 bg-orange-600 text-white px-12 py-6 rounded-full text-2xl font-black hover:bg-orange-700 transform hover:scale-105 transition shadow-2xl"
                >
                  <Trophy size={32} />
                  Kurs rozszerzony z Michałem
                </Link>
              </div>
            </div>

            {/* Zdjęcie */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1400"
                  alt="Michał Nowak – król matury rozszerzonej"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl object-cover aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-5xl font-black drop-shadow-2xl">Michał</p>
                  <p className="text-2xl font-bold opacity-95 drop-shadow-lg">Twój klucz do 90–100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Piekielnie mocny CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-red-700">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            Chcesz 90–100% z rozszerzonej?
          </h2>
          <p className="text-2xl mb-10 opacity-95">
            Michał przyjmuje <strong>tylko 8 uczniów indywidualnych</strong> w semestrze.
          </p>
          <p className="text-xl mb-12 leading-relaxed max-w-3xl mx-auto opacity-90">
            Indywidualny plan, sprawdzanie wszystkich zadań, symulacje matury co 2 tygodnie i gwarancja wyniku.
            W zeszłym roku wszyscy jego uczniowie 1-na-1 zrobili <strong>88–98%</strong>.
            <p>+48 889 599 088</p>
          </p>
          <a
            href="tel:+48889599088"
            className="inline-flex items-center gap-4 bg-white text-orange-600 px-14 py-8 rounded-full text-2xl font-black hover:bg-gray-100 transform hover:scale-110 transition shadow-2xl"
          >
            <Phone size={38} />
            Zadzwoń teraz – zostało tylko 1 miejsce w tym miesiącu
          </a>

          <p className="mt-10 text-xl opacity-90 flex items-center justify-center gap-3">
            <Flame className="animate-pulse" /> Ostatni uczeń z Michałem zrobił 98% w 2024
          </p>
        </div>
      </section>
    </div>
  );
}