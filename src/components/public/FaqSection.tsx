'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/format';
import { useLanguage } from './LanguageProvider';

interface FaqSectionProps {
  whatsappAdmin?: string;
  companyName?: string;
}

export default function FaqSection({
  whatsappAdmin = '6281256789012',
  companyName = 'Importir Pontianak',
}: FaqSectionProps) {
  const { dict } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const waFaqUrl = buildWhatsAppUrl(
    whatsappAdmin,
    dict.faq.waGreeting(companyName)
  );

  return (
    <section
      id="faq"
      className="py-14 lg:py-16 bg-ice border-b border-[#E2EAF6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand">
              <span
                className="w-6 h-0.5 bg-brand rounded-full"
                aria-hidden="true"
              />
              {dict.faq.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {dict.faq.heading}
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {dict.faq.description}
            </p>
            <div className="pt-1">
              <a
                href={waFaqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full bg-wa hover:bg-wa-dark text-white text-sm font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {dict.faq.askWaBtn}
              </a>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {dict.faq.items.map((item, idx) => {
              const isOpen = openIndex === idx;
              const triggerId = `faq-trigger-${idx}`;
              const panelId = `faq-panel-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#DCE6F5] bg-white overflow-hidden shadow-sm"
                >
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full min-h-[54px] flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ice/60 transition-colors"
                    >
                      <span className="font-bold text-ink text-sm sm:text-base">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-brand shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="px-5 pb-5 pt-2 text-sm text-slate-700 leading-relaxed border-t border-[#E6EEF9]"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
