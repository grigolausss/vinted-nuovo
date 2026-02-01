export interface ListingInput {
  title: string;
  description: string;
  useEmoji: boolean;
}

export interface CategoryOption {
  path: string;
  confidence: number;
  reason: string;
}

export interface PriceSuggestion {
  range: [number, number];
  final: number;
  reason: string;
  confidence: 'alta' | 'bassa';
}

export interface GeneratedListing {
  id: string;
  originalTitle: string;
  seoTitles: string[];
  optimizedDescription: string;
  categories: CategoryOption[];
  price: PriceSuggestion;
  createdAt: string;
  status: 'Non venduto' | 'Venduto' | 'In pausa';
  daysElapsed: number;
  enrichedData?: {
    addedInfo: string[];
    itemName: string;
  };
}

/**
 * Capitalizza ogni parola del testo.
 */
function smartCapitalize(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Interpreta dettagli tecnici come composizione tessile e taglie.
 */
function interpretTechnicalDetails(text: string): string {
  let processed = text;

  // Interpreta percentuali (es. 98 cotone -> 98% cotone), evitando doppioni se già presente
  processed = processed.replace(/(\d+)(?!\s*%)\s*(cotone|elastene|elastane|lana|poliestere|seta|lino|viscosa)/gi, '$1% $2');

  // Aggiunge virgole tra componenti (es. 98% cotone 2% elastene -> 98% cotone, 2% elastene)
  processed = processed.replace(/(%\s+\w+)\s+(\d+%)/gi, '$1, $2');

  // Capitalizza taglie comuni
  processed = processed.replace(/\btaglia\s+([xsml]+|[\d\/]+)\b/gi, (match, p1) => `Taglia ${p1.toUpperCase()}`);

  return processed;
}

export function generateSeoTitles(title: string, description: string): string[] {
  const fullText = (title + " " + description).toLowerCase();

  // 1. Marca
  const brands = ['Anthony Morato', 'Nike', 'Zara', 'Levis', 'Adidas', 'Gucci', 'Prada', 'Jordan', 'Stone Island', 'Carhartt', 'Stussy', 'Ralph Lauren'];
  const brand = brands.find(b => fullText.includes(b.toLowerCase())) || "";

  // 2. Stile (virali)
  const styles = ['Old Money', 'Y2K', 'Vintage', 'Streetwear', 'Gorpcore', 'Minimal', 'Luxury', 'Casual', 'Indie', 'Cyber'];
  const style = styles.find(s => fullText.includes(s.toLowerCase())) || "";

  // 3. Fit
  const fits = ['Oversize', 'Skinny', 'Baggy', 'Regular', 'Slim', 'Boxy', 'Relaxed', 'Tapered'];
  const fit = fits.find(f => fullText.includes(f.toLowerCase())) || "";

  // 4. Nome generico (virali)
  const names = ['Pants', 'Hoodie', 'Tee', 'Cap', 'Sneakers', 'Jacket', 'Jeans', 'Sweatshirt', 'Accessory', 'Bag', 'Vest', 'Shorts'];
  const foundName = names.find(n => fullText.includes(n.toLowerCase()));

  // Pulizia del titolo originale per il nome generico
  let cleanName = title;
  if (brand) cleanName = cleanName.replace(new RegExp(brand, 'gi'), '').trim();
  if (style) cleanName = cleanName.replace(new RegExp(style, 'gi'), '').trim();
  if (fit) cleanName = cleanName.replace(new RegExp(fit, 'gi'), '').trim();

  const name = foundName || smartCapitalize(cleanName);

  // Formato: [BRAND] [STYLE] [FIT] [NAME]
  const baseTitle = [brand, style, fit, name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, ' ')
    .trim();

  // Suggeriamo varianti con viral tags se mancano nel main
  const isClothing = /felpa|maglia|pantalone|jeans|giacca|t-shirt|shirt|pants|hoodie/i.test(fullText);
  const isShoes = /scarpe|sneakers|jordan|nike|adidas|dunk/i.test(fullText);

  const vA_style = style || (isClothing ? "Old Money" : (isShoes ? "Streetwear" : "Vintage"));
  const vA_fit = fit || (isClothing ? "Oversize" : (isShoes ? "Classic" : ""));
  const variantA = [brand, vA_style, vA_fit, name].filter(Boolean).join(" ");

  const vB_style = style || (isClothing ? "Y2K" : (isShoes ? "Gorpcore" : "Trendy"));
  const vB_fit = fit || (isClothing ? "Baggy" : "");
  const variantB = [brand, vB_style, vB_fit, name].filter(Boolean).join(" ");

  return [baseTitle, variantA, variantB].map(t => smartCapitalize(t).substring(0, 70));
}

export function enrichData(title: string, description: string) {
  const fullText = (title + " " + description).toLowerCase();
  const addedInfo: string[] = [];
  let itemName = "";

  if (fullText.includes("jordan 4 military")) {
    itemName = "Jordan 4 Retro Military Blue";
    addedInfo.push("SKU: FV5029-141");
    addedInfo.push("Release Date: Maggio 2024");
    addedInfo.push("Colorway: Off-White/Military Blue/Neutral Grey");
  } else if (fullText.includes("jordan 1 high chicago")) {
    itemName = "Jordan 1 High OG Chicago Lost and Found";
    addedInfo.push("SKU: DZ5485-612");
    addedInfo.push("Colorway: Varsity Red/Black-Sail-Muslin");
  } else if (fullText.includes("stone island") && (fullText.includes("felpa") || fullText.includes("maglione"))) {
    addedInfo.push("Certilogo: Presente per verifica autenticità");
  }

  return addedInfo.length > 0 ? { addedInfo, itemName } : null;
}

export function generateDescription(input: ListingInput, enrichment: any): string {
  const { title, description, useEmoji } = input;
  const fullText = (title + " " + description).toLowerCase();

  const isGarment = /felpa|hoodie|pants|pantaloni|t-shirt|tee|maglia|giacca|jacket|jeans|maglione/i.test(fullText);
  const isShoes = /scarpe|sneakers|jordan|adidas|nike|stivali/i.test(fullText);

  let itemType = "articolo";
  if (isGarment) itemType = "capo";
  if (isShoes) itemType = "paio di scarpe";

  const brands = ['Anthony Morato', 'Nike', 'Zara', 'Levis', 'Adidas', 'Gucci', 'Prada', 'Jordan', 'Stone Island'];
  const brand = brands.find(b => fullText.includes(b.toLowerCase())) || "";

  // Helper per emoji
  const e = (symbol: string) => useEmoji ? symbol + " " : "";

  // Intro (2-3 righe)
  let intro = `Ciao! Hai trovato un ${itemType} davvero speciale. ${brand ? `Questo pezzo firmato ${brand}` : `Questo articolo`} è perfetto per chi cerca qualità e uno stile ricercato, tenuto con estrema cura.`;

  if (enrichment) {
    intro += ` Si tratta del modello ${enrichment.itemName}, un pezzo di grande valore per collezionisti e appassionati.`;
  }

  // Bullet points
  const bullets = [];

  // Taglia
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '48', '50', '52'];
  const size = sizes.find(s => {
    const regex = new RegExp(`\\b${s}\\b`, 'i');
    return fullText.match(regex);
  });
  if (size) {
    bullets.push(`${e(isShoes ? '👟' : '🧥')}taglia ${size.toUpperCase()}`);
  }

  // Condizioni
  if (fullText.includes('nuovo') || fullText.includes('mai usato')) {
    bullets.push(`${e('✨')}come nuovo, mai usato`);
  } else {
    bullets.push(`${e('💎')}ottime condizioni, come da foto`);
  }

  // Arricchimento
  if (enrichment) {
    enrichment.addedInfo.forEach((info: string) => {
      bullets.push(`${e('🔍')}${info}`);
    });
  }

  // Materiale/Dettaglio tecnico (se non troppo lungo)
  const tech = interpretTechnicalDetails(description);
  if (tech && tech.length < 50 && !tech.includes("Taglia")) {
    bullets.push(`${e('🧵')}dettagli: ${tech}`);
  }

  // Assicura che i bullet siano unici e che la spedizione sia l'ultimo
  const shipText = `${e('📦')}spedizione veloce 1/2 giorni`;
  let uniqueBullets = Array.from(new Set(bullets)).filter(b => !b.includes("spedizione veloce"));

  // Prendiamo i primi 4-5 e aggiungiamo la spedizione
  const finalBullets = uniqueBullets.slice(0, 5);
  finalBullets.push(shipText);

  const closing = "Resto a disposizione per qualsiasi domanda o foto extra!";
  const finalDesc = `${intro}\n${finalBullets.join('\n')}\n${closing}`;

  return antiSpamChecker(finalDesc.replace(/\*\*/g, '')).trim();
}

export function suggestCategories(input: string): CategoryOption[] {
  const lower = input.toLowerCase();
  if (lower.includes('jeans')) {
    return [
      { path: 'Uomo → Abbigliamento → Pantaloni → Jeans', confidence: 95, reason: 'Hai inserito il termine Jeans' },
      { path: 'Uomo → Abbigliamento → Pantaloni → Altro', confidence: 10, reason: 'Alternativa generica' },
      { path: 'Donna → Abbigliamento → Pantaloni → Jeans', confidence: 5, reason: 'Se fosse un modello unisex' }
    ];
  }

  if (lower.includes('felpa') || lower.includes('hoodie')) {
    return [
      { path: 'Uomo → Abbigliamento → Maglioni e felpe → Felpe con cappuccio', confidence: 92, reason: 'Hai indicato cappuccio o termini affini' },
      { path: 'Donna → Abbigliamento → Maglioni e felpe → Felpe con cappuccio', confidence: 15, reason: 'Possibile alternativa per fit unisex' },
      { path: 'Bambini → Abbigliamento → Maschi → Maglioni e felpe', confidence: 5, reason: 'Se la taglia è piccola' }
    ];
  }

  return [
    { path: 'Donna → Accessori → Altro', confidence: 40, reason: 'Categoria generica' },
    { path: 'Uomo → Accessori → Altro', confidence: 30, reason: 'Categoria generica' },
    { path: 'Casa → Articoli per la casa', confidence: 10, reason: 'Possibile oggetto per la casa' }
  ];
}

export function suggestPrice(input: string): PriceSuggestion {
  const lower = input.toLowerCase();
  let retailEstimate = 50; // Default

  if (lower.includes('anthony morato')) retailEstimate = 90;
  if (lower.includes('nike')) retailEstimate = 80;
  if (lower.includes('gucci')) retailEstimate = 400;

  // Formule basate sulla guida:
  // Vendita veloce: 25-35%
  // Prezzo giusto: 30-50%

  const final = Math.round(retailEstimate * 0.4);
  const range: [number, number] = [Math.round(retailEstimate * 0.3), Math.round(retailEstimate * 0.5)];

  return {
    range,
    final,
    reason: `Calcolato su una stima retail di €${retailEstimate}. Applicato il 40% per un prezzo "giusto" e competitivo su Vinted.`,
    confidence: 'alta'
  };
}

export function honestyChecker(input: ListingInput): string | null {
  const lower = input.description.toLowerCase();
  const titleLower = input.title.toLowerCase();

  if ((titleLower.includes('nuovo') || titleLower.includes('nuova')) && (lower.includes('difetto') || lower.includes('segni'))) {
    return "Attenzione: hai scritto 'nuovo' ma anche 'difetto'. Verifica la coerenza per evitare contestazioni.";
  }
  return null;
}

export function antiSpamChecker(text: string): string {
  return text
    .replace(/[!?]{2,}/g, (match) => match[0] || '')
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    .replace(/#{1,}/g, '') // Rimuove hashtag spam
    .trim();
}
