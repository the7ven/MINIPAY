"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Plus, Minus, X, Printer, Wifi, WifiOff, Bluetooth } from "lucide-react";
import { getArticles, updateStockApresVente, saveVente, Article, getSettings } from "@/lib/db";
import { printReceiptDirect } from "@/lib/thermalPrint"; // Assure-toi que ce fichier existe

function VentesContent() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get('search');
  const autoplay = searchParams.get('autoplay');

  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const hasAddedDirectly = useRef(false);

  // Détection de la connexion
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

  // Initialisation des données
  useEffect(() => {
    const init = async () => {
      const [data, settings] = await Promise.all([getArticles(), getSettings()]);
      setArticles(data);
      setShopInfo(settings);

      if (searchFromUrl && autoplay === 'true' && !hasAddedDirectly.current) {
        const target = data.find(a => a.nom === searchFromUrl);
        if (target) {
          ajouterAuPanier(target);
          hasAddedDirectly.current = true;
          setSearch(""); 
        }
      }
    };
    init();
  }, [searchFromUrl, autoplay]);

  const ajouterAuPanier = (art: Article) => {
    setPanier(current => {
      const existe = current.find(item => item.id === art.id);
      if (existe) return current.map(item => item.id === art.id ? { ...item, qte: item.qte + 1 } : item);
      return [...current, { ...art, qte: 1 }];
    });
  };

  const modifierQte = (id: number, delta: number) => {
    setPanier(current => current.map(item => {
      if(item.id === id) {
        const nQte = item.qte + delta;
        return nQte > 0 ? { ...item, qte: nQte } : item;
      }
      return item;
    }));
  };

  const total = panier.reduce((acc, item) => acc + item.prix * item.qte, 0);

  // LOGIQUE DE VALIDATION ET DOUBLE IMPRESSION
  const validerVente = async () => {
    if (panier.length === 0 || isPrinting) return;
    setIsPrinting(true);

    const nouvelleVente = { 
      date: new Date().toLocaleString(), 
      articles: panier, 
      total: total 
    };
    
    try {
      // 1. Sauvegarde en base locale
      await saveVente(nouvelleVente);
      await updateStockApresVente(panier);
      
      // 2. Tentative d'impression Bluetooth Directe (Pixel)
      try {
        console.log("Tentative Bluetooth direct...");
        await printReceiptDirect(nouvelleVente, shopInfo);
      } catch (btError) {
        console.log("Échec Bluetooth ou annulé, passage à l'impression système.");
        // 3. Secours : Impression système (Windows/RawBT)
        window.print();
      }
      
      // 4. Reset de l'interface
      setPanier([]);
      setMessage("Vente enregistrée avec succès !");
      const updated = await getArticles();
      setArticles(updated);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation de la vente.");
    } finally {
      setIsPrinting(false);
    }
  };

  const filtered = articles.filter(a => 
    a.nom.toLowerCase().includes(search.toLowerCase()) || 
    a.categorie.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 animate-in fade-in duration-500 text-left">
      
      {/* SECTION CATALOGUE */}
      <div className="flex-1 space-y-6 print:hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-mpro-dark italic uppercase tracking-tighter">Caisse</h2>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isOnline ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500 animate-pulse'
            }`}>
                {isOnline ? <><Wifi size={12} /> Connecté</> : <><WifiOff size={12} /> Hors-ligne</>}
            </div>
          </div>
          {message && <div className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-bounce">{message}</div>}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            className="w-full p-4 pl-12 bg-white border border-slate-100 rounded-[22px] outline-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-mpro-blue/20" 
            placeholder="Rechercher un produit..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((art) => (
            <button key={art.id} onClick={() => ajouterAuPanier(art)} className="bg-white p-5 rounded-[32px] border border-slate-50 text-left hover:border-mpro-blue transition-all group active:scale-95 relative overflow-hidden shadow-sm">
              <div className="absolute right-4 top-4 bg-mpro-blue text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Plus size={20} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{art.categorie}</p>
              <h4 className="font-bold text-mpro-dark mb-4 group-hover:text-mpro-blue truncate">{art.nom}</h4>
              <div className="flex justify-between items-end">
                <p className="font-black text-mpro-blue text-sm">{art.prix.toLocaleString()} F</p>
                <p className={`text-[9px] font-bold ${art.stock <= 5 ? 'text-red-500' : 'text-slate-300'} uppercase`}>Stock: {art.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION PANIER */}
      <div className="w-full lg:w-96 bg-mpro-dark rounded-[35px] p-8 text-white shadow-2xl flex flex-col h-fit sticky top-8 print:hidden">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={24} className="text-mpro-cyan" />
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Panier</h3>
        </div>

        <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {panier.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{item.nom}</p>
                <p className="text-[10px] text-mpro-cyan font-black">{item.prix.toLocaleString()} F</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => modifierQte(item.id, -1)} className="p-1 hover:text-mpro-cyan"><Minus size={14}/></button>
                <span className="text-sm font-black">{item.qte}</span>
                <button onClick={() => modifierQte(item.id, 1)} className="p-1 hover:text-mpro-cyan"><Plus size={14}/></button>
                <button onClick={() => setPanier(panier.filter(p => p.id !== item.id))} className="ml-2 text-red-400"><X size={16}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 space-y-6">
          <div className="flex justify-between items-end">
            <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Total</p>
            <p className="text-3xl font-black text-mpro-cyan italic tracking-tighter">{total.toLocaleString()} F</p>
          </div>
          <button 
            onClick={validerVente} 
            disabled={panier.length === 0 || isPrinting} 
            className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 ${panier.length > 0 ? 'bg-mpro-cyan text-mpro-dark hover:scale-105 shadow-xl' : 'bg-white/10 text-white/20'}`}
          >
            {isPrinting ? "Impression..." : <><Bluetooth size={18} /> Valider & Imprimer</>}
          </button>
        </div>
      </div>

      {/* TICKET THERMIQUE (CSS-PRINT) */}
      <div id="ticket-thermique" className="hidden print:block bg-white text-black w-[72mm] font-mono text-[11px] mx-auto pb-10">
        <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4 uppercase">
          <h2 className="text-xl font-bold">{shopInfo?.shopName || "MINIPAY"}</h2>
          <p className="text-[10px]">{shopInfo?.address}</p>
          <p className="text-[10px]">Tél: {shopInfo?.phone}</p>
        </div>
        
        <div className="mb-4 text-[10px]">
          <div className="flex justify-between">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Heure: {new Date().toLocaleTimeString()}</span>
          </div>
          <p>Ticket N°: {Date.now().toString().slice(-6)}</p>
        </div>

        <table className="w-full text-left mb-4">
          <thead>
            <tr className="border-b border-black text-[10px] uppercase font-bold">
              <th className="pb-1">DESIGNATION</th>
              <th className="pb-1 text-center">QTÉ</th>
              <th className="pb-1 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-black/20">
            {panier.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2 uppercase leading-tight pr-2">{item.nom}</td>
                <td className="py-2 text-center">x{item.qte}</td>
                <td className="py-2 text-right font-bold">{(item.prix * item.qte).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mb-8">
          <span>A PAYER</span>
          <span>{total.toLocaleString()} F</span>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-dashed border-black uppercase text-[10px]">
          *** MERCI DE VOTRE VISITE ***
          <br />
          <span className="text-[8px] italic tracking-widest">RestoPay v1.0</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { visibility: hidden; background: white; }
          #ticket-thermique { 
            visibility: visible !important; 
            display: block !important;
            position: absolute; left: 0; top: 0; width: 72mm; 
          }
          @page { size: 80mm auto; margin: 0; }
          header, nav, .sidebar, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function VentesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-xs animate-pulse tracking-tighter">Initialisation de la caisse...</div>}>
      <VentesContent />
    </Suspense>
  );
}