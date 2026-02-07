"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, DollarSign, ArrowUpRight, AlertTriangle, ShoppingBag, Tag, ShoppingCart, Trophy } from 'lucide-react';
import { getArticles, getVentes, Article, Vente } from '@/lib/db';

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [stats, setStats] = useState({ totalArticles: 0, lowStock: 0, caTotal: 0, nbVentes: 0 });
  const [categoryStock, setCategoryStock] = useState<{ [key: string]: number }>({});
  const [topProducts, setTopProducts] = useState<{name: string, qty: number}[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [a, v] = await Promise.all([getArticles(), getVentes()]);
      const currentArticles = a || [];
      const currentVentes = v || [];
      
      setArticles(currentArticles);
      setVentes(currentVentes);
      
      const totalCA = currentVentes.reduce((acc, sale) => acc + sale.total, 0);
      const low = currentArticles.filter(art => art.stock <= 10).length;
      
      // Stock par catégorie
      const catStock: { [key: string]: number } = {};
      currentArticles.forEach(art => { 
        catStock[art.categorie] = (catStock[art.categorie] || 0) + art.stock; 
      });

      // CALCUL DES BEST-SELLERS
      const salesByProduct: { [key: string]: number } = {};
      currentVentes.forEach(sale => {
        sale.articles.forEach((item: any) => {
          salesByProduct[item.nom] = (salesByProduct[item.nom] || 0) + item.qte;
        });
      });
      const sortedTop = Object.entries(salesByProduct)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setStats({ totalArticles: currentArticles.length, lowStock: low, caTotal: totalCA, nbVentes: currentVentes.length });
      setCategoryStock(catStock);
      setTopProducts(sortedTop);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 text-left">
      <div className="text-left">
        <h2 className="text-3xl font-black text-mpro-dark italic uppercase tracking-tighter">Tableau de Bord</h2>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Analyse des performances</p>
      </div>

      {/* STATS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Chiffre d'Affaire" value={`${stats.caTotal.toLocaleString()} F`} icon={<DollarSign size={20} className="text-green-500" />} color="bg-green-50" />
        <StatCard title="Total Articles" value={stats.totalArticles.toString()} icon={<Package size={20} className="text-mpro-blue" />} color="bg-mpro-blue/10" />
        <StatCard title="Stock Alerte" value={stats.lowStock.toString()} icon={<AlertTriangle size={20} className="text-red-500" />} color="bg-red-50" highlight={stats.lowStock > 0} />
        <StatCard title="Transactions" value={stats.nbVentes.toString()} icon={<ShoppingBag size={20} className="text-mpro-cyan" />} color="bg-mpro-cyan/10" />
      </div>

      {/* SECTION DU MILIEU : CATÉGORIES ET BEST-SELLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STOCKS PAR CATÉGORIES */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Stocks par Catégories</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(categoryStock).slice(0, 4).map(([cat, qte]) => (
              <Link key={cat} href={`/inventaire?cat=${encodeURIComponent(cat)}`} className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm hover:border-mpro-blue transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2"><Tag size={14} className="text-mpro-blue" /><p className="text-[11px] font-black text-mpro-dark uppercase">{cat}</p></div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-mpro-blue" />
                </div>
                <p className="text-2xl font-black text-mpro-dark italic">{qte.toLocaleString()} <span className="text-[10px] not-italic text-slate-400 uppercase">Unités</span></p>
              </Link>
            ))}
          </div>
        </div>


        {/* WIDGET BEST-SELLERS (NOUVEAU) */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={18} className="text-orange-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Top 5 Ventes</h3>
          </div>
          <div className="space-y-5">
            {topProducts.map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                  <span className="text-mpro-dark truncate pr-4">{p.name}</span>
                  <span className="text-mpro-blue">{p.qty} vendus</span>
                </div>
                <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-mpro-blue h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase italic">Aucune donnée</p>}
          </div>
        </div>
      </div>


      
        {/* AJOUT RAPIDE AU PANIER  */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ajout Rapide au Panier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.filter(a => a.stock > 0).slice(0, 4).map((art) => (
            <Link key={art.id} href={`/ventes?search=${encodeURIComponent(art.nom)}&autoplay=true`} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:border-mpro-cyan group transition-all">
              <div className="min-w-0">
                <p className="text-xs font-bold text-mpro-dark truncate">{art.nom}</p>
                <p className="text-[10px] font-black text-mpro-blue">{art.prix.toLocaleString()} F</p>
              </div>
              <div className="p-2 bg-mpro-cyan/10 text-mpro-cyan rounded-lg group-hover:bg-mpro-cyan group-hover:text-white transition-colors">
                <ShoppingCart size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION BASSE : VENTES + CAISSE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-3 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-mpro-dark uppercase text-xs tracking-widest">Dernières Ventes</h3>
            <Link href="/rapports" className="text-[10px] font-black text-mpro-blue uppercase hover:underline">Voir plus →</Link>
          </div>
          <div className="space-y-3">
            {ventes.slice(-4).reverse().map((v) => (
              <div key={v.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <div><p className="text-xs font-black text-mpro-dark">{v.date}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{v.articles.length} art.</p></div>
                <p className="font-black text-mpro-blue text-sm">{v.total.toLocaleString()} F</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex justify-end">
          <div style={{ width: '300px', height: '300px' }} className="bg-mpro-dark rounded-[32px] p-8 text-white shadow-xl flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group shrink-0">
            <div className="relative z-10 text-center space-y-4 w-full">
              <div className="bg-mpro-cyan/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"><ShoppingCart size={32} className="text-mpro-cyan" /></div>
              <h3 className="font-black text-xl italic uppercase tracking-tighter">Caisse Express</h3>
              <Link href="/ventes" className="inline-block w-full bg-mpro-cyan text-mpro-dark font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-white transition-all">Ouvrir le terminal</Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-mpro-cyan/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-2xl border border-white flex items-center gap-5 bg-white shadow-sm ${highlight ? 'ring-2 ring-red-500/10' : ''}`}>
      <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
      <div className="text-left">
        <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-40 mb-1">{title}</p>
        <p className="text-2xl font-black italic tracking-tighter text-mpro-dark">{value}</p>
      </div>
    </div>
  );
}