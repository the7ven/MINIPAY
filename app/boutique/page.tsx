"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, Store, MapPin, Phone, 
  Save, CheckCircle2, ShieldCheck, Printer 
} from 'lucide-react';
import { saveSettings, getSettings, Settings as ISettings } from '@/lib/db';
import { printViaBluetooth } from "@/lib/thermalPrint";

export default function BoutiquePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // États pour le formulaire
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Charger les réglages au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      const data = await getSettings();
      if (data) {
        setShopName(data.shopName || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
      } else {
        // Valeurs par défaut pour ton projet MiniPay
        setShopName("MINIPAY RESTO");
        setAddress("Abidjan, Côte d'Ivoire");
        setPhone("+225 00 00 00 00");
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Ces clés doivent être identiques à celles utilisées dans ton ticket thermique
    const newSettings: ISettings = {
      shopName,
      address,
      phone
    };

    try {
      await saveSettings(newSettings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    } finally {
      setIsSaving(false);
    }
  };

  // NOUVEAU : Fonction pour tester l'imprimante directement
  const testPrinter = async () => {
    setIsTesting(true);
    const fakeCart = [
      { nom: "TEST IMPRESSION", qte: 1, prix: 0 }
    ];
    const currentShop = { shopName, address, phone };

    try {
  await printViaBluetooth(fakeCart, currentShop); 
} catch (btError) {
  window.print();
}
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="text-left">
        <h2 className="text-3xl font-black text-mpro-dark italic tracking-tighter uppercase">Paramètres Boutique</h2>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Configuration de l'identité de votre commerce</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULAIRE DE CONFIGURATION */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8 text-left">
            
            {/* IDENTITÉ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <Store size={18} className="text-mpro-blue" />
                <h3 className="text-xs font-black uppercase tracking-widest text-mpro-dark">Identité du Commerce</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom (En-tête du ticket)</label>
                <input 
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-mpro-blue/20 font-bold text-sm" 
                  placeholder="Ex: RESTOPAY LUXE"
                  required
                />
              </div>
            </section>

            {/* CONTACT & LOCALISATION */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <MapPin size={18} className="text-mpro-blue" />
                <h3 className="text-xs font-black uppercase tracking-widest text-mpro-dark">Contact & Localisation</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ville / Quartier</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-mpro-blue/20 font-bold text-sm" 
                    placeholder="Ex: Cocody, Angré"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Téléphone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-mpro-blue/20 font-bold text-sm" 
                    placeholder="+225..."
                  />
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="pt-4 flex flex-wrap gap-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-3 bg-mpro-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-mpro-blue transition-all shadow-xl disabled:opacity-50"
              >
                {isSaving ? "Sauvegarde..." : <><Save size={18} /> Enregistrer</>}
              </button>

              <button 
                type="button"
                onClick={testPrinter}
                disabled={isTesting}
                className="flex items-center gap-3 bg-slate-100 text-mpro-dark px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
              >
                {isTesting ? "Connexion..." : <><Printer size={18} /> Tester Imprimante</>}
              </button>
            </div>
          </form>
        </div>

        {/* INFOS SYSTÈME */}
        <div className="space-y-6">
          <div className="bg-mpro-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-xl text-left">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-mpro-cyan">
                <ShieldCheck />
                <h3 className="font-black italic uppercase tracking-tighter">Sécurité Matérielle</h3>
              </div>
              <p className="text-xs text-mpro-light opacity-80 leading-relaxed">
                Le nom et l'adresse saisis seront automatiquement nettoyés (accents supprimés) avant l'envoi vers votre imprimante thermique <strong>Bluetooth</strong>.
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Terminal</p>
                <p className="text-sm font-black italic">Lenovo ThinkPad T470</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* TOAST SUCCESS */}
      {showSuccess && (
        <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={20} />
          <p className="text-xs font-black uppercase tracking-widest">Réglages appliqués !</p>
        </div>
      )}
    </div>
  );
}