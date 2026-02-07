import { openDB } from 'idb';

const DB_NAME = 'minipay_db';
const STORE_ARTICLES = 'articles';
const STORE_VENTES = 'ventes';
const STORE_SETTINGS = 'settings';

export interface Article {
  id?: number;
  nom: string;
  prix: number;
  categorie: string;
  stock: number;
}

export interface Vente {
  id?: number;
  date: string;
  articles: any[];
  total: number;
}

export interface Settings {
  shopName: string;
  address: string;
  phone: string;
}

export const initDB = async () => {
  return openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) db.createObjectStore(STORE_ARTICLES, { keyPath: 'id', autoIncrement: true });
      if (oldVersion < 2) db.createObjectStore(STORE_VENTES, { keyPath: 'id', autoIncrement: true });
      if (oldVersion < 3) db.createObjectStore(STORE_SETTINGS);
    },
  });
};

export const getArticles = async () => (await initDB()).getAll(STORE_ARTICLES);
export const addArticle = async (article: Article) => (await initDB()).add(STORE_ARTICLES, article);
export const updateArticle = async (article: Article) => (await initDB()).put(STORE_ARTICLES, article);
export const deleteArticle = async (id: number) => (await initDB()).delete(STORE_ARTICLES, id);

export const updateStockApresVente = async (items: any[]) => {
  const db = await initDB();
  const tx = db.transaction(STORE_ARTICLES, 'readwrite');
  const store = tx.objectStore(STORE_ARTICLES);
  for (const item of items) {
    const article = await store.get(item.id);
    if (article) {
      article.stock -= item.qte;
      await store.put(article);
    }
  }
  return tx.done;
};


export const cleanOldVentes = async () => {
  const db = await initDB();
  const tx = db.transaction('ventes', 'readwrite');
  const store = tx.objectStore('ventes');
  const ventes = await store.getAll();
  
  const troisMoisEnMs = 90 * 24 * 60 * 60 * 1000;
  const maintenant = Date.now();

  for (const vente of ventes) {
    // On convertit la date de la vente en timestamp pour comparer
    const dateVente = new Date(vente.date).getTime();
    if (maintenant - dateVente > troisMoisEnMs) {
      await store.delete(vente.id);
    }
  }
  return tx.done;
};

export const saveVente = async (vente: Vente) => (await initDB()).add(STORE_VENTES, vente);
export const getVentes = async () => (await initDB()).getAll(STORE_VENTES);
export const getSettings = async () => (await initDB()).get(STORE_SETTINGS, 'config');
export const saveSettings = async (settings: Settings) => (await initDB()).put(STORE_SETTINGS, settings, 'config');