"use client";

import { useState, useTransition } from "react";
import { RefreshCcw } from "lucide-react";
import { getRandomQuote } from "./quote-actions";

type QuoteData = {
  text: string;
  source: string;
  category: string;
};

export function InspirationCard({ initialQuote }: { initialQuote: QuoteData }) {
  const [quote, setQuote] = useState<QuoteData>(initialQuote);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const newQuote = await getRandomQuote();
      if (newQuote) {
        setQuote(newQuote);
      }
    });
  };

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
        <span className="text-8xl font-serif">&quot;</span>
      </div>
      
      <div className="flex justify-between items-start relative z-10 mb-2">
        <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wide flex items-center gap-2">
          <span>💡</span> Inspirasi Harian
        </h3>
        
        <button 
          onClick={handleRefresh}
          disabled={isPending}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 p-1 rounded-full transition-all disabled:opacity-50 active:scale-95 bg-emerald-100/50 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
          title="Ganti Inspirasi"
        >
          <RefreshCcw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <blockquote className="space-y-3 relative z-10 mt-3">
        <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
          &quot;{quote.text}&quot;
        </p>
        <footer className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-sm">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">— {quote.source}</span>
            {quote.category && (
               <span className="text-emerald-800/60 dark:text-emerald-200/50 text-xs hidden sm:inline-block">
                 • {quote.category}
               </span>
            )}
        </footer>
      </blockquote>
    </div>
  );
}
