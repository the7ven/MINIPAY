"use client";

import React, { useState, useEffect } from "react";
import { Menu, Wifi, WifiOff } from "lucide-react"; // Ajout des icônes de statut
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Gestion de la détection de connexion
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <html lang="fr">
      <head>
        {/* Balises PWA obligatoires */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-144x144.png" sizes="any" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="flex bg-mpro-bg min-h-screen text-slate-900 antialiased">
        
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER MOBILE & STATUS BAR */}
          <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-30 print:hidden">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-mpro-dark md:block hidden">MINIPAY</h1>
              <h1 className="font-bold text-mpro-dark md:hidden">MINIPAY</h1>
              
              {/* Indicateur Hors-ligne / En ligne */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                isOnline ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500 animate-pulse'
              }`}>
                {isOnline ? (
                  <><Wifi size={12} /> En ligne</>
                ) : (
                  <><WifiOff size={12} /> Hors ligne</>
                )}
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 bg-slate-50 rounded-lg text-mpro-dark"
            >
              <Menu size={24} />
            </button>
          </header>

          <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 custom-scrollbar flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}