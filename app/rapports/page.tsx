"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, ShoppingBag, Clock, Trophy } from 'lucide-react';
import { getVentes, Vente } from '@/lib/db';

export default function RapportsPage() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [filterType, setFilterType] = useState<'jour' | 'semaine' | 'mois' | 'tous'>('tous');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVentes(); }, []);

  const loadVentes = async () => {
    setLoading(true);
    const data = await getVentes();
    setVentes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const parseVenteDate = (dateStr: string) => {
    if (dateStr.includes('/')) {
      const [datePart] = dateStr.split(',');
      const [day, month, year] = datePart.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateStr);
  };

  const filteredVentes = ventes.filter(v => {
    if (filterType === 'tous') return true;
    const dVente = parseVenteDate(v.date);
    const dSearch = new Date(searchDate);
    dVente.setHours(0, 0, 0, 0);
    dSearch.setHours(0, 0, 0, 0);

    if (filterType === 'jour') return dVente.getTime() === dSearch.getTime();
    if (filterType === 'semaine') {
      const day = dSearch.getDay();
      const diff = dSearch.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(new Date(searchDate).setDate(diff));
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
      const dVenteFull = parseVenteDate(v.date);
      return dVenteFull >= start && dVenteFull <= end;
    } 
    if (filterType === 'mois') return dVente.getMonth() === dSearch.getMonth() && dVente.getFullYear() === dSearch.getFullYear();
    return true;
  });

  // CALCUL DES BEST-SELLERS DE LA PÉRIODE
  const salesByProduct: { [key: string]: number } = {};
  filteredVentes.forEach(sale => {
    sale.articles.forEach((item: any) => {
      salesByProduct[item.nom] = (salesByProduct[item.nom] || 0) + item.qte;
    });
  });
  const topProducts = Object.entries(salesByProduct)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const totalPeriode = filteredVentes.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className="space-y-8 animate-in fade-in pb-20 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-mpro-dark italic uppercase tracking-tighter">Archive des Ventes</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse de vos revenus</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex gap-1 shadow-sm">
          {(['tous', 'jour', 'semaine', 'mois'] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterType === t ? 'bg-mpro-dark text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{t === 'tous' ? 'Tout' : `Par ${t}`}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTRES & TOTAL */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Calendar className="absolute left-4 top-4 text-mpro-blue" size={20} />
              <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="w-full p-4 pl-12 bg-white border border-slate-100 rounded-[22px] font-bold text-sm shadow-sm" />
            </div>
            <div className="bg-mpro-blue text-white p-4 px-6 rounded-[22px] flex items-center justify-between shadow-lg shadow-mpro-blue/20">
              <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Total Sélection</p>
              <p className="text-xl font-black italic tracking-tighter">{totalPeriode.toLocaleString()} F</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[35px] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-[10px] uppercase font-black text-slate-400">Date / Heure</th>
                  <th className="p-6 text-[10px] uppercase font-black text-slate-400">Détails</th>
                  <th className="p-6 text-[10px] uppercase font-black text-slate-400 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVentes.length > 0 ? [...filteredVentes].reverse().map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="p-6 flex items-center gap-3"><Clock size={14} className="text-slate-400" /><p className="text-xs font-bold text-mpro-dark">{v.date}</p></td>
                    <td className="p-6"><div className="flex flex-wrap gap-2">{v.articles.map((art: any, i: number) => (<span key={i} className="text-[9px] bg-slate-100 px-2 py-1 rounded-md font-black uppercase text-slate-500">{art.nom} x{art.qte}</span>))}</div></td>
                    <td className="p-6 text-right font-black text-mpro-dark text-sm">{v.total.toLocaleString()} F</td>
                  </tr>
                )) : <tr><td colSpan={3} className="p-20 text-center opacity-20 font-black text-xs uppercase italic">Aucune donnée</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP PRODUITS DE LA PÉRIODE (NOUVEAU) */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm h-fit sticky top-8">
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={18} className="text-orange-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Top de la période</h3>
          </div>
          <div className="space-y-6">
            {topProducts.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                  <span className="text-mpro-dark truncate pr-2">{p.name}</span>
                  <span className="text-mpro-blue">{p.qty}</span>
                </div>
                <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full rounded-full" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase italic">Vide</p>}
          </div>
        </div>
      </div>
    </div>
  );
}