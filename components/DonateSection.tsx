'use client';

import { Coffee, Heart } from 'lucide-react';
import { useState } from 'react';

export function DonateSection() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section id="developer" className="py-20 px-4 bg-gradient-to-b from-bg-secondary/30 to-bg-primary">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bitcoin/10 border border-bitcoin/30 rounded-full mb-6">
            <Coffee className="w-4 h-4 text-bitcoin" />
            <span className="text-bitcoin text-sm font-medium">Support the Developer</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Buy Me a <span className="text-bitcoin">Coffee</span>
          </h3>
          <p className="text-text-secondary text-lg">
            Help me maintain and improve Afribitools
          </p>
        </div>

        <div className="card bg-gradient-to-br from-bg-secondary to-bg-tertiary border-bitcoin/20 hover:border-bitcoin/40 transition-all duration-300 group">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-bitcoin/20 rounded-full flex items-center justify-center group-hover:bg-bitcoin/30 transition-colors">
              <Heart className="w-8 h-8 text-bitcoin" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-bold text-xl mb-1">Edmund Spira</h4>
              <p className="text-sm text-text-muted">Creator & Lead Developer</p>
            </div>
          </div>

          <p className="text-text-secondary mb-6 leading-relaxed">
            I built Afribitools to support Bitcoin circular economy initiatives in Africa.
            Your support helps me dedicate more time to developing and maintaining these tools.
          </p>

          <div className="bg-bg-primary rounded-lg p-4 mb-4">
            <p className="text-xs text-text-muted mb-2">Lightning Address</p>
            <code className="text-sm text-bitcoin font-mono break-all">edmundspira@blink.sv</code>
          </div>

          <button
            onClick={() => copyAddress('edmundspira@blink.sv')}
            className="w-full btn-secondary group-hover:bg-bitcoin/10"
          >
            {copiedAddress === 'edmundspira@blink.sv' ? (
              <>
                <Heart className="w-4 h-4" />
                Copied! Thank you ⚡
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4" />
                Copy Lightning Address
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted mb-4">
            For organizational support and sponsorship
          </p>
          <a
            href="https://afribit.africa/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-bitcoin hover:text-orange-500 transition-colors font-medium"
          >
            Visit Afribit Africa Donate Page
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
