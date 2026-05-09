import { useState, useEffect } from 'react';

interface PropertyData {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  amenities: string[];
}

export default function App() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/property')
      .then((res) => res.json())
      .then((data) => {
        setPropertyData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch property data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-izumi-cream via-white to-izumi-cream">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white bg-opacity-95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-izumi-pink">Chácara Izumi</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                Home
              </a>
              <a href="#about" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-izumi-dark hover:text-izumi-pink transition-colors font-medium">
                Contact
              </a>
            </div>
            <button className="bg-izumi-pink text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-md hover:shadow-lg">
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-izumi-dark mb-4 leading-tight">
                  Welcome to <span className="text-izumi-pink">Chácara Izumi</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experience the perfect blend of luxury and nature. Discover your ideal getaway at our premium vacation rental property.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-izumi-pink text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl text-lg">
                  Explore Now
                </button>
                <button className="bg-white text-izumi-pink border-2 border-izumi-pink px-8 py-3 rounded-lg hover:bg-izumi-cream transition-all font-semibold shadow-md">
                  Learn More
                </button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-izumi-pink">5★</p>
                  <p className="text-sm text-gray-600">Guest Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-izumi-pink">500+</p>
                  <p className="text-sm text-gray-600">Happy Guests</p>
                </div>
              </div>
            </div>
            <div className="relative h-96 md:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-izumi-pink to-izumi-dark rounded-3xl opacity-10"></div>
              <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-izumi-pink bg-opacity-20 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Featured Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Widget Section */}
      <section id="booking" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-izumi-dark mb-4">Start Your Escape</h3>
            <p className="text-xl text-gray-600">Find your perfect dates and complete your booking</p>
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
                    <p className="text-sm text-gray-600 mb-1">Max Guests</p>
                    <p className="text-2xl font-bold text-izumi-pink">{propertyData.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price / Night</p>
                    <p className="text-2xl font-bold text-izumi-pink">${propertyData.basePrice}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {propertyData.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="bg-izumi-pink bg-opacity-10 text-izumi-pink px-3 py-1 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-izumi-dark mb-2">Check-in</label>
                      <input type="date" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-izumi-pink focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-izumi-dark mb-2">Check-out</label>
                      <input type="date" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-izumi-pink focus:outline-none" />
                    </div>
                  </div>
                  <button className="w-full bg-izumi-pink text-white py-4 rounded-lg hover:bg-opacity-90 transition-all font-bold text-lg shadow-lg hover:shadow-xl">
                    Check Availability
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Unable to load property data</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-izumi-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4 text-izumi-pink">Chácara Izumi</h4>
              <p className="text-gray-300">Premium vacation rental experience</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-izumi-pink transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-izumi-pink transition-colors">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-izumi-pink transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <p className="text-gray-300 mb-2">Email: info@chacaraizumi.com</p>
              <p className="text-gray-300">Phone: +55 (11) 1234-5678</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Chácara Izumi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
