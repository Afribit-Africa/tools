'use client';

import { Coffee, Heart, Zap, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export function DonateSection() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section id="donate" className="py-20 px-4 bg-gradient-to-b from-black via-bitcoin-500/5 to-black">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-full mb-6">
            <Coffee className="w-4 h-4 text-bitcoin-500" />
            <span className="text-bitcoin-400 text-sm font-medium">Support Open Source</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Support the <span className="text-bitcoin-500">Developer</span>
          </h3>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Afribitools is 100% free and open source. Your support helps maintain and improve these tools.
          </p>
        </div>

        {/* Developer Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-bitcoin-500/30 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar & Info */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-bitcoin-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-bitcoin-500/20">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="md:hidden">
                <h4 className="font-heading font-bold text-xl text-white">Edmund Spira</h4>
                <p className="text-sm text-gray-400">Creator & Lead Developer</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="hidden md:block mb-4">
                <h4 className="font-heading font-bold text-xl text-white">Edmund Spira</h4>
                <p className="text-sm text-gray-400">Creator & Lead Developer</p>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                I built Afribitools to support Bitcoin circular economy initiatives in Africa. 
                Your support helps me dedicate more time to developing new features and maintaining these tools for the community.
              </p>

              {/* Lightning Address */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-bitcoin-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-bitcoin-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Lightning Address</p>
                      <code className="text-sm text-bitcoin-400 font-mono truncate block">edmundspira@blink.sv</code>
                    </div>
                  </div>
                  <button
                    onClick={() => copyAddress('edmundspira@blink.sv')}
                    className="flex items-center gap-2 px-4 py-2 bg-bitcoin-500/20 hover:bg-bitcoin-500/30 border border-bitcoin-500/30 text-bitcoin-400 rounded-lg transition-all flex-shrink-0"
                  >
                    {copiedAddress === 'edmundspira@blink.sv' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Tip Amounts */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs text-gray-500">Quick tip:</span>
                {['1,000', '5,000', '10,000', '21,000'].map((amount) => (
                  <span 
                    key={amount}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400"
                  >
                    {amount} sats
                  </span>
                ))}
              </div>

              {/* Thank You Message */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Every sat is appreciated and helps keep this project alive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            For organizational support and sponsorship opportunities
          </p>
          <a
            href="https://afribit.africa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all"
          >
            <Image
              src="/logos/afribit-logo.png"
              alt="Afribit Africa"
              width={24}
              height={24}
              className="rounded"
            />
            Visit Afribit Africa
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>
    </section>
  );
}
