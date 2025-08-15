import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AlpacaBackground from "@/components/layout/AlpacaBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alpaca Trading Pal",
  description: "Your AI-powered trading companion on 0G Chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Web3Provider>
          <div className="relative min-h-screen">
            <AlpacaBackground />
            <Nav />
            <main className="relative z-10">{children}</main>
            <Footer />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}