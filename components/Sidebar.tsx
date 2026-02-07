"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, History, Settings, HelpCircle, X } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Ventes', icon: <ShoppingCart size={20} />, path: '/ventes' },
    { name: 'Inventaire', icon: <Package size={20} />, path: '/inventaire' },
    { name: 'Rapports', icon: <History size={20} />, path: '/rapports' },
    { name: 'Boutique', icon: <Settings size={20} />, path: '/boutique' },
  ];

  return (
    <>
      {isOpen && ( <div className="fixed inset-0 bg-mpro-dark/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} /> )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col p-6 transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mpro-dark rounded-xl flex items-center justify-center text-white font-black">M</div>
            <h1 className="text-xl font-extrabold text-mpro-dark tracking-tighter uppercase">MINI<span className="text-mpro-blue">PAY</span></h1>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-mpro-blue/10 text-mpro-blue font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-mpro-dark'}`}>
                {item.icon} <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}