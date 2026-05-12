import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import Carousel from './Carousel';

interface PropertyData {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  amenities: string[];
  totalBedrooms: number;
  totalBathrooms: number;
  squareFeet: number;
  images: string[];
  rating: number;
  reviews: number;
}

export default function App() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>({});
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
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

  // Calcular preço total baseado nas diárias
  useEffect(() => {
    if (checkIn && checkOut && propertyData) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      // Zera as horas para evitar problemas de fuso horário no cálculo
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Se a data final for maior ou igual a inicial, calcula as diárias (+1 para incluir o primeiro e último dia)
      if (daysDifference >= 0) {
        const totalDiarias = daysDifference + 1;
        setTotalPrice(totalDiarias * propertyData.basePrice);
      } else {
        setTotalPrice(0);
      }
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
    setBookingMessage('');
    setBookingError('');
  };

  const handleDateSelect = (dateStr: string) => {
    setBookingMessage('');
    setBookingError('');

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
      return;
    }

    if (dateStr <= checkIn) {
      setCheckIn(dateStr);
      setCheckOut('');
      return;
    }

    // Valida se o período contém datas indisponíveis
    let current = new Date(checkIn + 'T00:00:00');
    const end = new Date(dateStr + 'T00:00:00');
    while (current <= end) {
      const ds = current.toISOString().split('T')[0];
      if (availability[ds] === false) {
        setBookingError('Este período contém datas indisponíveis. Escolha outro intervalo.');
        return;
      }
      current.setDate(current.getDate() + 1);
    }

    setCheckOut(dateStr);
  };

  const handleCheckAvailability = async () => {
    setBookingMessage('');
    setBookingError('');

    if (!checkIn || !checkOut) {
      setBookingError('Por favor, selecione as datas de entrada e saída');
      return;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Agora permite que start seja igual ao end (Day Use = 1 diária)
    if (start > end) {
      setBookingError('A data de saída não pode ser anterior à data de entrada');
      return;
    }

    // Verificar disponibilidade para cada data (incluindo o dia de saída)
    let currentDate = new Date(start);
    let allAvailable = true;

    // <= para verificar se o último dia também está livre
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isAvailable = availability[dateStr] !== false;

      if (!isAvailable) {
        allAvailable = false;
        break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (allAvailable) {
      const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalDiarias = daysDifference + 1;
      
      const textoDiaria = totalDiarias === 1 ? 'diária' : 'diárias';
      
      setBookingMessage(
        `✅ Disponível! Total: R$ ${(totalDiarias * (propertyData?.basePrice || 0)).toLocaleString('pt-BR')} por ${totalDiarias} ${textoDiaria}`
      );
    } else {
      setBookingError('❌ Infelizmente, algumas datas não estão disponíveis. Tente outras datas.');
    }
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
              <a href="#booking" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                Sobre
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-izumi-dark mb-4 leading-tight">
                  Bem-vindo à <span className="text-izumi-pink">Chácara Izumi</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experimente a combinação perfeita de luxo e natureza. Descubra seu escape ideal em nossa propriedade de aluguel de férias premium.
                </p>
              </div>
            </div>
            <div className="relative h-96 md:h-full min-h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img src="/gallery/piscina-palmeiras.jpeg" alt="Piscina da Chácara Izumi" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-izumi-dark/30 to-transparent"></div>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-300">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Máximo de Hóspedes</p>
                    <p className="text-2xl font-bold text-izumi-pink">{propertyData.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Preço Diária</p>
                    <p className="text-2xl font-bold text-izumi-pink">R$ {propertyData.basePrice}</p>
                  </div>
                  <div className="col-span-2">
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
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onDateSelect={handleDateSelect}
                    />
                  </div>

                  {!checkIn && (
                    <p className="text-sm text-gray-400 text-center">
                      Clique em uma data para selecionar a entrada, depois escolha a saída
                    </p>
                  )}

                  {checkIn && checkOut && totalPrice > 0 && (
                    <div className="bg-izumi-cream p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Preço estimado:</p>
                        <p className="text-2xl font-bold text-izumi-pink">R$ {totalPrice.toLocaleString('pt-BR')}</p>
                      </div>
                      <button
                        onClick={handleClearDates}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors underline"
                      >
                        Limpar
                      </button>
                    </div>
                  )}

                  {(checkIn || checkOut) && !(checkIn && checkOut) && (
                    <button
                      onClick={handleClearDates}
                      className="text-sm text-gray-400 hover:text-red-500 transition-colors w-full text-center underline"
                    >
                      Limpar seleção
                    </button>
                  )}

                  <button
                    onClick={handleCheckAvailability}
                    disabled={!checkIn || !checkOut}
                    className="w-full bg-izumi-pink text-white py-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    Verificar Disponibilidade
                  </button>

                  {bookingMessage && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="text-green-700 font-semibold">{bookingMessage}</p>
                    </div>
                  )}

                  {bookingError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-red-700 font-semibold">{bookingError}</p>
                    </div>
                  )}
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