'use client';
import { useState, useEffect, useRef } from 'react';

export default function BannerSlider({ banners }) {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const total = banners.length || 3;

  // Auto-play
  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % total;
        sliderRef.current?.children[next]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        return next;
      });
    }, 3500);
    return () => clearInterval(id);
  }, [banners.length, total]);

  const goTo = (i) => {
    setCurrent(i);
    sliderRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  // Placeholder banners if empty
  const slides = banners.length > 0 ? banners : [
    { id: 1, image: null, title: 'PROMO SPESIAL', subtitle: 'Dapatkan harga terbaik', link: '#' },
    { id: 2, image: null, title: 'TOP UP CEPAT', subtitle: 'Proses otomatis 24/7', link: '#' },
    { id: 3, image: null, title: 'JOIN DISCORD', subtitle: 'discord.gg/pFhdW9ZwwY', link: 'https://discord.gg/pFhdW9ZwwY' },
  ];

  return (
    <div className="relative px-4 pt-3 pb-1">
      {/* Slides */}
      <div ref={sliderRef} className="banner-container rounded-2xl overflow-hidden" style={{gap:0}}>
        {slides.map((b, i) => (
          <div key={b.id} className="banner-slide flex-shrink-0 relative" style={{minWidth:'100%'}}>
            {b.image
              ? <a href={b.link || '#'}>
                  <img src={b.image} alt={b.title || ''} className="w-full object-cover" style={{height:'160px', borderRadius:'16px'}} />
                </a>
              : <div className="flex items-center justify-center" style={{
                  height:'160px', borderRadius:'16px',
                  background:`linear-gradient(135deg, #091828, #0d2244, #091828)`,
                  border:'1px solid #1d4ed8',
                }}>
                  <div className="text-center px-4">
                    <p className="font-black text-xl text-white tracking-wider" style={{fontFamily:'Rajdhani, sans-serif'}}>{b.title}</p>
                    <p className="text-sm mt-1" style={{color:'#60a5fa'}}>{b.subtitle}</p>
                  </div>
                </div>
            }
          </div>
        ))}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? '20px' : '6px',
                height: '6px',
                background: i === current ? '#1d6fff' : '#0e2445',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
