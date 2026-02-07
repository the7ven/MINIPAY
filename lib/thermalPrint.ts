// lib/thermalPrint.ts
export const printReceiptDirect = async (vente: any, shopInfo: any) => {
  try {
    // 1. Connexion (On essaye de trouver l'imprimante)
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt?.connect();
    const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    // 2. Préparation du ticket (Format ESC/POS)
    const encoder = new TextEncoder();
    let text = `\x1B\x40`; // Reset
    text += `\x1B\x61\x01`; // Centrer
    text += `${shopInfo?.shopName || "MINIPAY"}\n`;
    text += `${shopInfo?.address || ""}\n`;
    text += `Tel: ${shopInfo?.phone || ""}\n`;
    text += `--------------------------------\n`;
    text += `\x1B\x61\x00`; // Gauche

    vente.articles.forEach((art: any) => {
      // On coupe le nom à 18 caractères pour garder de la place pour le prix
      const name = art.nom.substring(0, 18).padEnd(18);
      const qte = `x${art.qte}`.padEnd(5);
      const prix = `${(art.prix * art.qte)}F`.padStart(8);
      text += `${name}${qte}${prix}\n`;
    });

    text += `--------------------------------\n`;
    text += `\x1B\x45\x01`; // Gras ON
    text += `TOTAL: ${vente.total} FCFA\n`;
    text += `\x1B\x45\x00`; // Gras OFF
    text += `\x1B\x61\x01`; // Centrer
    text += `\nMerci de votre visite !\n`;
    text += `\n\n\n\n\n`; // Avance de papier pour couper

    const data = encoder.encode(text);
    await characteristic?.writeValue(data);
    
    return true;
  } catch (error) {
    console.error("Erreur Bluetooth:", error);
    throw error;
  }
};