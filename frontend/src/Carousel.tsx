import { useState, useEffect, useCallback } from 'react';

interface CarouselProps {
  images: string[];
}

export default function Carousel({ images }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [isPaused, next, images.length]);

  if (!images.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image track */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-80 md:h-[520px]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="min-w-full h-full flex-shrink-0">
            <img
              src={src}
              alt={`Foto ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/gallery/piscina-palmeiras.jpeg';
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Counter badge */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
        {current + 1} / {images.length}
      </div>

      {/* Prev / Next — aparecem ao hover */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-izumi-dark text-2xl font-bold shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-izumi-dark text-2xl font-bold shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Próxima foto"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 items-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-7' : 'bg-white/50 w-2 hover:bg-white/80'
              }`}
              aria-label={`Ir para foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
