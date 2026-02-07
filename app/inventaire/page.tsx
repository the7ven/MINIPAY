"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // Ajout pour gérer le clic depuis le Dashboard
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Package,
  Tag,
  Search,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  getArticles,
  addArticle,
  updateArticle,
  deleteArticle,
  Article,
} from "@/lib/db";

function InventaireContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("cat"); // Récupère la catégorie passée par l'URL

  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState("");

  // États pour les alertes
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Effet pour appliquer le filtre de catégorie venant du Dashboard
  useEffect(() => {
    if (categoryFilter) {
      setSearch(categoryFilter);
    }
  }, [categoryFilter]);

  const loadData = async () => {
    const data = await getArticles();
    setArticles(data || []);
  };

  const categoriesExistantes = Array.from(
    new Set(articles.map((a) => a.categorie)),
  );

  const handleCloseModal = () => {
    if (formDirty) {
      setShowCancelConfirm(true);
    } else {
      setIsModalOpen(false);
      setCurrentArticle(null);
    }
  };

  const filteredArticles = articles.filter(
    (art) =>
      art.nom.toLowerCase().includes(search.toLowerCase()) ||
      art.categorie.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in pb-20 text-left">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-mpro-dark italic uppercase tracking-tighter">
            Gestion du Stock
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Contrôle total de vos produits
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentArticle(null);
            setIsModalOpen(true);
            setFormDirty(false);
          }}
          className="bg-mpro-dark text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg hover:bg-mpro-blue transition-all active:scale-95"
        >
          <Plus size={18} /> Nouveau Produit
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="relative">
        <Search className="absolute left-4 top-4 text-slate-300" size={20} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit ou une catégorie..."
          className="w-full p-4 pl-12 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-mpro-blue/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-4 text-slate-300 hover:text-mpro-dark"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">
                Désignation
              </th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">
                Catégorie
              </th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">
                Prix
              </th>
              <th className="p-5 text-[10px] uppercase font-black text-slate-400">
                Stock
              </th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredArticles.map((art) => (
              <tr
                key={art.id}
                className="hover:bg-slate-50/50 group transition-colors"
              >
                <td className="p-5 font-bold text-mpro-dark text-sm">
                  {art.nom}
                </td>
                <td className="p-5">
                  <span className="text-[9px] font-black uppercase bg-mpro-blue/10 text-mpro-blue px-2.5 py-1.5 rounded-lg">
                    {art.categorie}
                  </span>
                </td>
                <td className="p-5 font-black text-mpro-blue text-sm">
                  {art.prix.toLocaleString()} F
                </td>
                <td
                  className={`p-5 font-black text-sm ${art.stock <= 5 ? "text-red-500" : "text-slate-600"}`}
                >
                  {art.stock}
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setCurrentArticle(art);
                        setIsModalOpen(true);
                        setFormDirty(false);
                      }}
                      className="p-2 text-slate-300 hover:text-mpro-blue transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(art.id!)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredArticles.length === 0 && (
          <div className="p-20 text-center text-slate-300 italic text-xs font-black uppercase">
            Aucun produit trouvé
          </div>
        )}
      </div>

      {/* MODALE FORMULAIRE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-mpro-dark/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form
            onChange={() => setFormDirty(true)}
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const item = {
                nom: fd.get("nom") as string,
                prix: Number(fd.get("prix")),
                stock: Number(fd.get("stock")),
                categorie: fd.get("categorie") as string,
              };
              if (currentArticle?.id)
                await updateArticle({ ...item, id: currentArticle.id });
              else await addArticle(item);
              setIsModalOpen(false);
              loadData();
            }}
            className="bg-white w-full max-w-md rounded-[35px] p-10 shadow-2xl relative animate-in zoom-in-95"
          >
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-8 right-8 text-slate-300 hover:text-mpro-dark"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-black text-mpro-dark uppercase italic mb-8">
              {currentArticle ? "Modifier" : "Nouveau"} Produit
            </h3>

            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Désignation
                </label>
                <input
                  name="nom"
                  defaultValue={currentArticle?.nom}
                  placeholder="Ex: Lait Bonnet Rouge"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Catégorie
                </label>
                <input
                  name="categorie"
                  defaultValue={currentArticle?.categorie}
                  list="cats-list"
                  placeholder="Saisir ou choisir une catégorie"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm uppercase"
                  required
                />
                <datalist id="cats-list">
                  {categoriesExistantes.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  {" "}
                  {/* Le prix prend 2 colonnes */}
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Prix (F)
                  </label>
                  <input
                    name="prix"
                    type="number"
                    defaultValue={currentArticle?.prix}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-mpro-blue text-sm"
                    required
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  {" "}
                  {/* Le stock prend seulement 1 colonne (plus petit) */}
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    defaultValue={currentArticle?.stock}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-[2] py-4 bg-mpro-dark text-white rounded-2xl font-black uppercase text-[10px] shadow-lg"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALERTES (SUPPRESSION / ANNULATION) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-mpro-dark/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-xs w-full rounded-[32px] p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div>
              <h4 className="text-lg font-black text-mpro-dark uppercase italic">
                Supprimer ?
              </h4>
              <p className="text-slate-400 text-xs font-bold mt-2">
                Cette action est définitive.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await deleteArticle(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                  loadData();
                }}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px]"
              >
                Oui, Supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-4 text-slate-400 font-black uppercase text-[10px]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-mpro-dark/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-xs w-full rounded-[32px] p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle size={32} />
            </div>
            <div>
              <h4 className="text-lg font-black text-mpro-dark uppercase italic">
                Quitter ?
              </h4>
              <p className="text-slate-400 text-xs font-bold mt-2">
                Modifications non enregistrées.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setIsModalOpen(false);
                  setFormDirty(false);
                }}
                className="w-full py-4 bg-mpro-dark text-white rounded-2xl font-black uppercase text-[10px]"
              >
                Abandonner
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-4 text-mpro-blue font-black uppercase text-[10px]"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center font-black text-xs uppercase animate-pulse">
          Chargement de l'inventaire...
        </div>
      }
    >
      <InventaireContent />
    </Suspense>
  );
}
