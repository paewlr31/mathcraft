// src/pages/kursy/MaturaRozszerzona.tsx
import { ArrowLeft, Check, Star, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MaturaRozszerzona() {
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

      {/* Zdjęcie – na mobile na górze, na dużych ekranach po lewej */}
      <div className="order-1 lg:order-1">
        <img
          src="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1400"
          alt="Kurs matematyka rozszerzona online"
          className="w-full rounded-3xl shadow-2xl object-cover aspect-[4/3] lg:aspect-auto lg:h-full"
        />
      </div>

      {/* Tekst – na mobile pod zdjęciem (order-2), na lg obok (order-2) */}
      <div className="order-2 lg:order-2 space-y-8 text-center lg:text-left">
        
        {/* Tytuł + gwiazdki */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Matematyka Rozszerzona
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

        {/* Krótki opis */}
        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
          Grupowy kurs maturalny online z matematyki rozszerzonej, prowadzony na żywo.
        </p>

        {/* Benefity */}
        <div className="space-y-5 max-w-md mx-auto lg:mx-0">
          {[
            "Zajęcia na żywo",
            "Dostęp do nagrań",
            "60zł/120min",
            "Bezpłatna lekcja próbna"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="bg-red-800 text-white rounded-full p-2 flex-shrink-0">
                <Check size={20} />
              </div>
              <span className="text-lg font-medium text-gray-800">{item}</span>
            </div>
          ))}
        </div>

        {/* Przycisk Zapisz się */}
        <div className="pt-6">
          <Link
            to="/formularz/matura-rozszerzona"
            className="inline-block w-full max-w-sm bg-red-800 text-white text-center text-2xl font-bold py-6 rounded-full hover:bg-red-900 transform hover:scale-105 transition duration-300 shadow-2xl"
          >
            Zapisz się
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Szczegółowy opis kursu – ten sam co wcześniej */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-16 text-lg text-gray-700 leading-relaxed">

          {/* Zawartość kursu */}
  <div>
    <h2 className="text-4xl font-black text-gray-900 mb-4">Zawartość kursu</h2>
    <div className="w-32 h-1 bg-red-800 rounded-full mb-8"></div>
    <p className="text-lg text-gray-700 leading-relaxed">
      Kurs obejmuje <strong>30 lekcji</strong>, pogrupowanych tematycznie w działy. Do każdej lekcji uczniowie otrzymują zestaw zadań domowych, które służą zarówno utrwaleniu bieżącego materiału, jak i systematycznemu powtórzeniu wcześniej poznanych zagadnień. Ostatnie cztery spotkania poświęcone są powtórkom – to czas na usystematyzowanie wiedzy i przypomnienie najważniejszych informacji z całego kursu.
    </p>
  </div>

  {/* Przystępna cena */}
  <div>
    <h2 className="text-4xl font-black text-gray-900 mb-4">Przystępna cena</h2>
    <div className="w-32 h-1 bg-red-800 rounded-full mb-8"></div>
    <p className="text-lg text-gray-700 leading-relaxed">
      Kurs oferowany jest w wyjątkowo przystępnej cenie, co czyni go atrakcyjnym rozwiązaniem dla każdego, kto chce zdobyć solidną wiedzę bez nadmiernego obciążania domowego budżetu. Koszt jednej lekcji wynosi jedynie <strong>60 zł za 120 min</strong> zajęć prowadzonych na żywo – to konkurencyjna stawka, zwłaszcza biorąc pod uwagę interaktywny charakter kursu i bezpośredni kontakt z prowadzącym. Co więcej, płatności można dokonywać ratalnie – nie ma konieczności opłacania całego kursu z góry.
    </p>
  </div>

  {/* Wszystkie inne sekcje – ten sam wzór */}
  <div>
    <h2 className="text-4xl font-black text-gray-900 mb-4">Bezpłatna pierwsza lekcja</h2>
    <div className="w-32 h-1 bg-red-800 rounded-full mb-8"></div>
    <p className="text-lg text-gray-700 leading-relaxed">
      Nie wiesz czy kurs Ci się spodoba? Możesz zapisać się na kurs i odbyć pierwszą bezpłatną lekcję. Po niej możesz zadecydować czy chcesz kontynuować z nami naukę.
    </p>
  </div>

  <div>
    <h2 className="text-4xl font-black text-gray-900 mb-4">Zadania domowe</h2>
    <div className="w-100 h-1 bg-red-800 rounded-full mb-8"></div>
    <p className="text-lg text-gray-700 leading-relaxed">
      Po zakończeniu każdej lekcji uczniowie otrzymują zestaw zadań domowych, który został starannie dobrany, by utrwalić materiał omawiany na zajęciach. Co istotne, zadania te nie ograniczają się wyłącznie do nowego materiału — regularnie pojawiają się także pytania dotyczące wcześniejszych tematów. Taka forma powtórek umożliwia stopniowe budowanie solidnych fundamentów wiedzy.
    </p>
  </div>

  <div>
    <h2 className="text-4xl font-black text-gray-900 mb-4">Dostęp do nagrań</h2>
    <div className="w-100 h-1 bg-red-800 rounded-full mb-8"></div>
    <p className="text-lg text-gray-700 leading-relaxed">
      Nie możesz pojawić się na zajęciach na żywo? Żaden problem. Każdy uczestnik kursu otrzymuje dostęp do nagrań z przeprowadzonych lekcji w celu nadrobienia materiału lub powtórzenia wiadomości.
    </p>
  </div>

          {/* Kontakt – w pełni responsywny, piękny na mobile */}
<div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-8 md:p-12 rounded-3xl text-center">
  <h3 className="text-3xl md:text-4xl font-black mb-8">Masz pytania? Odezwij się!</h3>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
    {/* Telefon */}
    <a
      href="tel:+48889599088"
      className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/10 hover:bg-white/20 px-8 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
    >
      <Phone size={40} className="flex-shrink-0" />
      <div className="text-center sm:text-left">
        <p className="font-bold text-xl">Zadzwoń</p>
        <p className="text-lg opacity-95">+48 889 599 088</p>
      </div>
    </a>

    {/* Mail */}
    <a
      href="mailto:kontakt.mathcraft@gmail.com"
      className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/10 hover:bg-white/20 px-8 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
    >
      <Mail size={40} className="flex-shrink-0" />
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