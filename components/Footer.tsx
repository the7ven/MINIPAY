"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto pt-12 pb-8 border-t border-slate-100 print:hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* LOGO & VERSION */}
        <div className="space-y-1 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-mpro-dark">
            MINIPAY <span className="text-mpro-blue">v1.1 Premium</span>
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
            © {new Date().getFullYear()} • Système de gestion locale sécurisé
          </p>
        </div>

        {/* CRÉDITS */}
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Développé et designé par
          </p>
          <a 
            href="https://corneillenkwel.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[11px] font-black text-mpro-dark italic tracking-tighter hover:text-mpro-blue transition-all border-b border-transparent hover:border-mpro-blue/30"
          >
            CORNEILLE NKWEL
          </a>
        </div>
      </div>
    </footer>
  );
}