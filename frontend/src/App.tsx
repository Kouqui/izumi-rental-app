import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import Carousel from './Carousel';
import ContactModal from './ContactModal';

interface Pricing {
  weekday: number;
  weekendDay: number;
  fullWeekend: number;
  holiday: number;
}

interface PropertyData {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  pricing: Pricing;
  holidays: string[];
  maxGuests: number;
  amenities: string[];
  totalBedrooms: number;
  totalBathrooms: number;
  squareFeet: number;
  images: string[];
  rating: number;
  reviews: number;
}

function calcPrice(checkIn: string, checkOut: string, pricing: Pricing, holidays: string[]): number {
  const holidaySet = new Set(holidays);
  const days: Date[] = [];
  const cur = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  let total = 0;
  let i = 0;
  while (i < days.length) {
    const dow = days[i].getDay();
    const ds = days[i].toISOString().split('T')[0];
    if (dow === 6 && i + 1 < days.length && days[i + 1].getDay() === 0) {
      total += pricing.fullWeekend;
      i += 2;
    } else if (dow === 6 || dow === 0) {
      total += pricing.weekendDay;
      i++;
    } else if (holidaySet.has(ds)) {
      total += pricing.holiday;
      i++;
    } else {
      total += pricing.weekday;
      i++;
    }
  }
  return total;
}

export default function App() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});
  const [showModal, setShowModal] = useState(false);
  const [rangeError, setRangeError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetch('/api/property')
      .then((res) => res.json())
      .then((data) => {
        setPropertyData(data);
        setAvailability(data.availability || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch property data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (checkIn && checkOut && propertyData) {
      setTotalPrice(calcPrice(checkIn, checkOut, propertyData.pricing, propertyData.holidays));
    } else {
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, propertyData]);

  const formatDatePT = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[month - 1]}, ${year}`;
  };

  const handleClearDates = () => {
    setCheckIn('');
    setCheckOut('');
    setRangeError('');
  };

  const handleDateSelect = (dateStr: string) => {
    setRangeError('');

    if (!checkIn) {
      setCheckIn(dateStr);
      return;
    }

    if (checkOut) {
      setCheckIn(dateStr);
      setCheckOut('');
      return;
    }

    if (dateStr < checkIn) {
      setCheckIn(dateStr);
      return;
    }

    // Valida se o intervalo passa por alguma data indisponível
    let current = new Date(checkIn + 'T00:00:00');
    const end = new Date(dateStr + 'T00:00:00');
    while (current <= end) {
      const ds = current.toISOString().split('T')[0];
      if (availability[ds] === false) {
        setRangeError('Este período contém datas indisponíveis. Escolha outro intervalo.');
        return;
      }
      current.setDate(current.getDate() + 1);
    }

    setCheckOut(dateStr);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-izumi-cream via-white to-izumi-cream">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white bg-opacity-95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="font-bold text-izumi-dark text-lg tracking-wide">Chácara Izumi</span>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                Início
              </a>
              <a href="#gallery" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                Galeria
              </a>
              <a href="#contact" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                Contato
              </a>
            </div>
            <a href="#booking" className="bg-izumi-pink text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-md hover:shadow-lg">
              Reservar Agora
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Coluna esquerda */}
            <div className="space-y-8">
              <span className="inline-flex items-center gap-1.5 bg-izumi-pink/10 text-izumi-pink px-4 py-1.5 rounded-full text-sm font-semibold">
                📍 Campinas, SP
              </span>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-izumi-dark leading-tight">
                  Chácara<br />
                  <span className="text-izumi-pink">Izumi</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Espaço exclusivo para eventos e lazer, com piscina, área verde e estrutura completa para receber seus convidados com conforto e sofisticação.
                </p>
              </div>


              {/* Amenidades */}
              {propertyData && (
                <div className="flex flex-wrap gap-2">
                  {propertyData.amenities.map((amenity) => (
                    <span key={amenity} className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm shadow-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}

              <a
                href="#booking"
                className="inline-block bg-izumi-pink text-white px-8 py-3.5 rounded-xl hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Verificar Disponibilidade
              </a>
            </div>

            {/* Coluna direita — imagem */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px] md:h-[560px]">
              <img
                src="/gallery/piscina-palmeiras.jpeg"
                alt="Piscina da Chácara Izumi"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            </div>

          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-izumi-dark mb-4">Galeria</h3>
            <p className="text-xl text-gray-600">Conheça a beleza e o luxo da Chácara Izumi</p>
          </div>

          {loading ? (
            <div className="h-80 md:h-[520px] bg-gray-200 rounded-2xl animate-pulse" />
          ) : propertyData && propertyData.images && propertyData.images.length > 0 ? (
            <Carousel images={propertyData.images} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Galeria indisponível no momento</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Widget Section */}
      <section id="booking" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-izumi-dark mb-4">Encontre seu Dia!</h3>
            <p className="text-xl text-gray-600">Encontre suas datas perfeitas e complete sua reserva</p>
          </div>

          {/* Booking Widget Placeholder Card */}
          <div className="bg-gradient-to-br from-izumi-cream to-white rounded-3xl border-2 border-gray-200 shadow-xl p-8 md:p-12">
            {loading ? (
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : propertyData ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-izumi-dark mb-2">{propertyData.name}</h4>
                  <p className="text-gray-600 mb-3">{propertyData.location}</p>
                  <p className="text-gray-700 text-lg mb-4">{propertyData.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-gray-300">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-2xl font-bold text-izumi-pink">{propertyData.maxGuests}</p>
                      <p className="text-sm text-gray-500">Convidados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-izumi-pink">{propertyData.totalBedrooms}</p>
                      <p className="text-sm text-gray-500">Colchões</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-izumi-pink">{propertyData.totalBathrooms}</p>
                      <p className="text-sm text-gray-500">Banheiros</p>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Amenidades</p>
                    <div className="flex flex-wrap gap-2">
                      {propertyData.amenities.slice(0, 5).map((amenity) => (
                        <span key={amenity} className="bg-izumi-pink bg-opacity-10 text-izumi-pink px-3 py-1 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Datas selecionadas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg border-2 transition-colors ${checkIn ? 'border-izumi-pink bg-izumi-pink/5' : 'border-gray-200 bg-gray-50'}`}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Entrada</p>
                      <p className={`text-sm font-bold ${checkIn ? 'text-izumi-dark' : 'text-gray-400'}`}>
                        {checkIn ? formatDatePT(checkIn) : 'Selecione'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 transition-colors ${checkOut ? 'border-izumi-pink bg-izumi-pink/5' : 'border-gray-200 bg-gray-50'}`}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Saída</p>
                      <p className={`text-sm font-bold ${checkOut ? 'text-izumi-dark' : 'text-gray-400'}`}>
                        {checkOut ? formatDatePT(checkOut) : 'Selecione'}
                      </p>
                    </div>
                  </div>

                  {/* Calendário */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <Calendar
                      availability={availability}
                      holidays={propertyData.holidays}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onDateSelect={handleDateSelect}
                    />
                  </div>

                  {!checkIn && (
                    <p className="text-sm text-gray-400 text-center">
                      Clique em uma data para selecionar a entrada, depois escolha a saída — ou clique na mesma data para dia único
                    </p>
                  )}

                  {checkIn && checkOut && totalPrice > 0 && (
                    <div className="bg-izumi-cream p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Preço estimado:</p>
                      <p className="text-2xl font-bold text-izumi-pink">R$ {totalPrice.toLocaleString('pt-BR')}</p>
                    </div>
                  )}

                  {(checkIn || checkOut) && (
                    <button
                      onClick={handleClearDates}
                      className="text-sm text-gray-400 hover:text-red-500 transition-colors w-full text-center underline"
                    >
                      Limpar seleção
                    </button>
                  )}

                  {rangeError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-red-700 text-sm font-semibold">{rangeError}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowModal(true)}
                    disabled={!checkIn || !checkOut}
                    className="w-full bg-izumi-pink text-white py-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    Tenho Interesse
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Impossível carregar dados da propriedade</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && propertyData && (
        <ContactModal
          checkIn={checkIn}
          checkOut={checkOut}
          totalPrice={totalPrice}
          formatDatePT={formatDatePT}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Footer */}
      <footer id="contact" className="bg-izumi-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4 text-izumi-pink">Chácara Izumi</h4>
              <p className="text-gray-300">Experiência de aluguel de férias premium</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Links Rápidos</h5>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-izumi-pink transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-izumi-pink transition-colors">
                    Galeria
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-izumi-pink transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contato</h5>
              <p className="text-gray-300 mb-2">Email: info@chacaraizumi.com</p>
              <p className="text-gray-300">Telefone: +55 (19) 97125-0308</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Chácara Izumi. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}