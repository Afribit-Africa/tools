'use client';

import { Coffee, Heart } from 'lucide-react';
import { useState } from 'react';

export function DonateSection() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const donationOptions = [
    {
      name: 'Edmund Spira',
      role: 'Creator & Developer',
      address: 'edmundspira@blink.sv',
      description: 'Support the development and maintenance of Afribitools',
    },
    {
      name: 'Afribit Africa',
      role: 'Organization',
      address: 'afribit@blink.sv',
      description: 'Support Bitcoin circular economy initiatives in Africa',
    },
  ];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section id="donate" className="py-20 px-4 bg-gradient-to-b from-bg-secondary/30 to-bg-primary">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bitcoin/10 border border-bitcoin/30 rounded-full mb-6">
            <Coffee className="w-4 h-4 text-bitcoin" />
            <span className="text-bitcoin text-sm font-medium">Support Our Work</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Buy Us a <span className="text-bitcoin">Coffee</span>
          </h3>
          <p className="text-text-secondary text-lg">
            Help us build better Bitcoin tools for the circular economy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {donationOptions.map((option) => (
            <div
              key={option.address}
              className="card bg-gradient-to-br from-bg-secondary to-bg-tertiary border-bitcoin/20 hover:border-bitcoin/40 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-bitcoin/20 rounded-full flex items-center justify-center group-hover:bg-bitcoin/30 transition-colors">
                  <Heart className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-lg mb-1">{option.name}</h4>
                  <p className="text-sm text-text-muted">{option.role}</p>
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-4">{option.description}</p>

              <div className="bg-bg-primary rounded-lg p-4 mb-4">
                <p className="text-xs text-text-muted mb-2">Lightning Address</p>
                <code className="text-sm text-bitcoin font-mono break-all">{option.address}</code>
              </div>

              <button
                onClick={() => copyAddress(option.address)}
                className="w-full btn-secondary group-hover:bg-bitcoin/10"
              >
                {copiedAddress === option.address ? (
                  <>
                    <Heart className="w-4 h-4" />
                    Copied! Thank you ⚡
                  </>
                ) : (
                  <>
                    <Coffee className="w-4 h-4" />
                    Copy Address
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            All donations help us maintain and improve Afribitools 🧡
          </p>
        </div>
      </div>
    </section>
  );
}
