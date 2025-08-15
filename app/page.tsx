"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ecfdf5 100%)'
      }}
    >
      <div 
        className="container mx-auto px-4 py-20"
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '80px 16px' 
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full max-w-6xl mx-auto"
          style={{ 
            textAlign: 'center', 
            width: '100%', 
            maxWidth: '1152px', 
            margin: '0 auto' 
          }}
        >
        <div className="mb-8">
          <Image
            src="/alpaca/happy.svg"
            alt="Happy Alpaca"
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>
        
        <h1 
          className="text-6xl font-bold mb-6 text-amber-900"
          style={{
            fontSize: '4rem',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#78350f',
            textAlign: 'center'
          }}
        >
          Alpaca Trading Pal
        </h1>
        
        <p 
          className="text-2xl mb-8 text-amber-700"
          style={{
            fontSize: '1.5rem',
            marginBottom: '32px',
            color: '#b45309',
            textAlign: 'center'
          }}
        >
          Your Intelligent NFT Trading Companion on 0G Chain
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              🥚 Mint & Hatch
            </h3>
            <p className="text-amber-700">
              Create your unique Alpaca with random traits and personality
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              📚 Feed & Learn
            </h3>
            <p className="text-amber-700">
              Train your Alpaca with strategies and market knowledge
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              📈 Trade & Grow
            </h3>
            <p className="text-amber-700">
              Watch your Alpaca execute trades and build its track record
            </p>
          </motion.div>
        </div>
        
        <div 
          className="flex gap-4 justify-center"
          style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Link href="/mint">
            <Button 
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Mint Your Alpaca
            </Button>
          </Link>
          <Link href="/market">
            <Button 
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Explore Market
            </Button>
          </Link>
        </div>
        </motion.div>
      </div>
    </div>
  );
}