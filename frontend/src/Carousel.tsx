import { useState, useEffect, useCallback } from 'react';

interface CarouselProps {
  images: string[];
}

export default function Carousel({ images }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const next = useCallback((src?: 'lightbox') => {
    setCurrent((prev) => (prev + 1) % images.length);
    if (src !== 'lightbox') return;
  }, [images.length]);

  const prev = useCallback((src?: 'lightbox') => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
    if (src !== 'lightbox') return;
  }, [images.length]);

  const openLightbox = () => {
    setLightbox(true);
    setIsPaused(true);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setIsPaused(false);
  };

  // Auto-play
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [isPaused, next, images.length]);

  // Fechar lightbox com Esc, navegar com setas
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next('lightbox');
      if (e.key === 'ArrowLeft') prev('lightbox');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, next, prev]);

  if (!images.length) return null;

  return (
    <>
      {/* ── Carrossel ── */}
      <div
        className="relative overflow-hidden rounded-2xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Image track */}
        <div
          className="flex transition-transform duration-700 ease-in-out h-80 md:h-[540px]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="relative min-w-full h-full flex-shrink-0 overflow-hidden bg-black">
              <div
                className="absolute inset-0 scale-110 blur-2xl opacity-60 bg-cover bg-center"
                style={{ backgroundImage: `url(${src})` }}
              />
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="relative w-full h-full object-contain cursor-zoom-in"
                onClick={openLightbox}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/gallery/piscina-palmeiras.jpeg';
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Counter badge */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {current + 1} / {images.length}
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => prev()}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-izumi-dark text-2xl font-bold shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              onClick={() => next()}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-izumi-dark text-2xl font-bold shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Próxima foto"
            >
              ›
            </button>
          </>
        )}

        {/* Dots */}
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

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Contador */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            {current + 1} / {images.length}
          </div>

          {/* Fechar */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>

          {/* Imagem */}
          <img
            src={images[current]}
            alt={`Foto ${current + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev('lightbox'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold transition-colors"
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next('lightbox'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold transition-colors"
                aria-label="Próxima foto"
              >
                ›
              </button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 max-w-[90vw] overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`flex-shrink-0 w-14 h-10 rounded-md overflow-hidden transition-all duration-200 ${
                    i === current ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
