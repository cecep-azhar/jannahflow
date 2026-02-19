import { Heart, Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 text-center text-sm text-slate-500">
        <p className="text-center leading-relaxed">
          Made with <Heart className="inline h-4 w-4 text-rose-500 fill-rose-500 mx-1" /> in Bandung, Indonesia
          <span className="hidden sm:inline"> — </span>
          <br className="sm:hidden" />
          <a
            href="https://cecepazhar.com"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-medium text-slate-900 hover:underline"
          >
            Cecep Azhar
          </a> © {new Date().getFullYear()}
        </p>

        <a
          href="https://cecepazhar.com/support"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 font-medium text-slate-900 hover:underline"
        >
          Buy me a coffee <Coffee className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
