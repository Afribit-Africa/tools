'use client';

import { motion } from 'framer-motion';

const clients = [
  { name: 'Blink', logo: '/logos/blink.svg' },
  { name: 'Fedi', logo: '/logos/fedi.svg' },
  { name: 'Manchakura', logo: '/logos/manchakura.svg' },
  { name: 'Bitcoin Beach', logo: '/logos/bitcoin-beach.svg' },
];

export default function ClientLogos() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">
              Bitcoin Innovators
            </span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Empowering the Bitcoin ecosystem across Africa and beyond
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center">
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group flex items-center justify-center"
            >
              <div className="relative w-full h-20 flex items-center justify-center">
                <img
                  src={client.logo}
                  alt={client.name}
                  className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-text-muted">
            Building tools that power the future of Bitcoin in Africa ⚡
          </p>
        </motion.div>
      </div>
    </section>
  );
}
