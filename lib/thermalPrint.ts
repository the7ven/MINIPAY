// lib/bluetoothPrint.js

const cleanForPrint = (text) => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s/g, ' ')            
    .replace(/[^\x00-\x7F]/g, "");  
};

export const printViaBluetooth = async (cart, shopInfo) => {
  try {
    // 1. Scan Universel pour ton Pixel 4 XL
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true, // Pour voir TOUTES les imprimantes
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    // On essaie de récupérer le service standard
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    const encoder = new TextEncoder();
    
    // --- COMMANDES ESC/POS ---
    const INIT = '\x1B\x40';
    const CENTER = '\x1B\x61\x01';
    const LEFT = '\x1B\x61\x00';
    const BOLD_ON = '\x1B\x45\x01';
    const BOLD_OFF = '\x1B\x45\x00';
    const DOUBLE_HEIGHT = '\x1D\x21\x01';
    const NORMAL_SIZE = '\x1D\x21\x00';

    let cmds = INIT;
    
    // Entête avec les infos de shopInfo
    cmds += CENTER + BOLD_ON + DOUBLE_HEIGHT + cleanForPrint(shopInfo?.shopName || "MINIPAY") + "\n" + NORMAL_SIZE;
    cmds += cleanForPrint(shopInfo?.address || "ABIDJAN") + "\n";
    cmds += "--------------------------------\n";
    
    // Articles (Adapté aux noms de ton panier : nom, qte, prix)
    cmds += LEFT + BOLD_OFF;
    cart.forEach(item => {
      const qty = `${item.qte}x `;
      const price = `${(item.prix * item.qte)} F`;
      const name = cleanForPrint(item.nom).substring(0, 15);
      
      const spaceCount = 32 - (qty.length + name.length + price.length);
      const spaces = " ".repeat(Math.max(1, spaceCount));
      
      cmds += `${qty}${name}${spaces}${price}\n`;
    });

    const total = cart.reduce((a, b) => a + (b.prix * b.qte), 0);
    cmds += "--------------------------------\n";
    cmds += CENTER + BOLD_ON + `TOTAL: ${total} F\n`;
    cmds += BOLD_OFF + "\n";
    
    cmds += CENTER + "Merci de votre visite !\n";
    cmds += "\n\n\n\n"; 

    const bytes = encoder.encode(cmds);
    const CHUNK_SIZE = 20; 
    
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      await characteristic.writeValue(bytes.slice(i, i + CHUNK_SIZE));
    }

    // Déconnexion propre pour libérer l'imprimante
    await device.gatt.disconnect();
    return true;

  } catch (error) {
    console.error("Erreur Bluetooth:", error);
    throw error;
  }
};