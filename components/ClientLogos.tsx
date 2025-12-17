'use client';

import Image from 'next/image';

const partners = [
  { 
    name: 'Blink', 
    logo: '/logos/blink-dark-bg.png',
    url: 'https://blink.sv'
  },
  { 
    name: 'Fedi', 
    logo: '/logos/fedi-logo.jpg',
    url: 'https://fedi.xyz'
  },
  { 
    name: 'Machankura', 
    logo: '/logos/manchakura-logo.png',
    url: 'https://8333.mobi'
  },
  { 
    name: 'Afribit Africa', 
    logo: '/logos/afribit-logo.png',
    url: 'https://afribit.africa'
  },
  { 
    name: 'Novyrix', 
    logo: '/logos/novyrix-logo-transparent.png',
    url: 'https://novyrix.com'
  },
];

export default function ClientLogos() {
  return (
    <section className="py-16 bg-black border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bitcoin-500 via-orange-400 to-bitcoin-500">
              Bitcoin Innovators
            </span>
          </h2>
          <p className="text-gray-500 text-sm">
            Empowering the Bitcoin ecosystem across Africa and beyond
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center p-4 rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              <div className="relative w-24 h-12 md:w-32 md:h-16 flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={128}
                  height={64}
                  className="object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300 max-h-full"
                />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
