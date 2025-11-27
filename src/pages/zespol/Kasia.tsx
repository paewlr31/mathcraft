// src/pages/zespol/Kasia.tsx
import { ArrowLeft, Mail, Phone, Star, Sparkles, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Kasia() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Powrót */}
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/zespol" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium">
          <ArrowLeft size={20} /> Wróć do zespołu
        </Link>
      </div>

      {/* Główna sekcja – dokładnie ten sam schemat */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Tekst */}
            <div className="order-2 lg:order-1 space-y-10 text-center lg:text-left">
              <div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                  Kasia Wiśniewska
                  <br />
                  <span className="text-rose-600">Mistrzyni podstaw i ósmoklasisty</span>
                </h1>

                <div className="flex justify-center lg:justify-start gap-2 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={36} className="text-yellow-500 fill-yellow-500" />
                  ))}
                  <HeartHandshake size={36} className="text-rose-500 fill-rose-500" />
                </div>
              </div>

              <p className="text-2xl text-gray-700 leading-relaxed">
                Wyjaśnia matematykę tak prosto i ciepło, że nawet największy „antytalent” zaczyna ją kochać. Specjalistka od matury podstawowej i egzaminu ósmoklasisty.
              </p>

              <div className="space-y-6 text-lg text-gray-700">
                <p className="flex items-center gap-3">
                  <Sparkles className="text-rose-600" size={28} />
                  Średni wzrost wyniku z próbnych matur podstawowych jej uczniów: <strong>+42 pkt</strong>
                </p>
                <p className="flex items-center gap-3">
                  <HeartHandshake className="text-rose-600" size={28} />
                  98% uczniów ósmoklasisty powyżej 90% w ostatnich 3 latach
                </p>
                <p>Autorka metody „matematyka bez łez” – używanej przez ponad 800 dzieci</p>
                <p>Pracuje z dziećmi z dyskalkulią, lękiem matematycznym i ADHD</p>
                <p>„Kasia to jedyna osoba, przy której moja córka się uśmiecha na matematyce” – tysiące takich opinii</p>
                <p>Ukończyła pedagogikę specjalną + matematykę na UKSW</p>
              </div>

              <div className="text-xl font-medium text-gray-800 space-y-4 bg-gray-100 p-8 rounded-3xl">
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Mail className="text-rose-600" size={28} /> kasia@mathcraft.pl
                </p>
                <p className="flex items-center gap-3 justify-center lg:justify-start">
                  <Phone className="text-rose-600" size={28} /> +48 889 599 088
                </p>
              </div>

              <div className="pt-6">
                <Link
                  to="/kursy/matura-podstawowa"
                  className="inline-flex items-center gap-4 bg-rose-600 text-white px-12 py-6 rounded-full text-2xl font-black hover:bg-rose-700 transform hover:scale-105 transition shadow-2xl"
                >
                  <Sparkles size={32} />
                  Kurs podstawowy z Kasią
                </Link>
              </div>
            </div>

            {/* Zdjęcie */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1400"
                  alt="Kasia Wiśniewska – mistrzyni podstawowej i ósmoklasisty"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl object-cover aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-5xl font-black drop-shadow-2xl">Kasia</p>
                  <p className="text-2xl font-bold opacity-95 drop-shadow-lg">Matematyka może być piękna</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mocny, ciepły CTA */}
      <section className="py-20 bg-gradient-to-br from-rose-600 to-pink-700">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            Chcesz, żeby Twoje dziecko pokochało matematykę?
          </h2>
          <p className="text-2xl mb-10 opacity-95">
            Kasia przyjmuje <strong>tylko 10 dzieci miesięcznie</strong> na indywidualne zajęcia.
          </p>
          <p className="text-xl mb-12 leading-relaxed max-w-3xl mx-auto opacity-90">
            Po 3–4 lekcjach większość dzieci mówi: „W końcu rozumiem!”. Z Kasią nie ma stresu – jest wsparcie, uśmiech i wyniki powyżej 90%.
          </p>

          <a
            href="tel:+48889599088"
            className="inline-flex items-center gap-4 bg-white text-rose-600 px-14 py-8 rounded-full text-2xl font-black hover:bg-gray-100 transform hover:scale-110 transition shadow-2xl"
          >
            <Phone size={38} />
            Zadzwoń – zostało tylko 2 miejsca w tym miesiącu
          </a>

          <p className="mt-10 text-xl opacity-90">
            „Moja córka po roku z Kasią zdobyła 96% z ósmoklasisty” – mama Julii
          </p>
        </div>
      </section>
    </div>
  );
}