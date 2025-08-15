"use client";

export default function Footer() {
  return (
    <footer className="bg-amber-100/50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-amber-700">
          <p>© 2024 Alpaca Trading Pal - Built on 0G Chain</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="hover:text-amber-900">Docs</a>
            <a href="#" className="hover:text-amber-900">GitHub</a>
            <a href="#" className="hover:text-amber-900">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}