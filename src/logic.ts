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
  const cleanTitle = smartCapitalize(title);
  const lowerDesc = description.toLowerCase();

  // Estrazione colore e taglia per migliorare il SEO
  const colors = ['Nero', 'Bianco', 'Blu', 'Rosso', 'Verde', 'Grigio', 'Giallo', 'Marrone', 'Rosa', 'Arancione'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '40', '42', '44', '46', '48', '50', '52'];

  const detectedColor = colors.find(c => lowerDesc.includes(c.toLowerCase())) || '';
  const detectedSize = sizes.find(s => {
    const regex = new RegExp(`\\b${s}\\b`, 'i');
    return lowerDesc.match(regex);
  }) || '';

  const brandMatch = title.match(/(anthony morato|nike|zara|levis|adidas|gucci|prada)/i);
  const brand = brandMatch ? smartCapitalize(brandMatch[0]) : "";

  // Se il brand è già nel titolo, non lo duplichiamo
  let seoBase = cleanTitle;
  if (brand && !cleanTitle.toLowerCase().includes(brand.toLowerCase())) {
    seoBase = `${brand} ${cleanTitle}`;
  }

  const baseTitle = `${seoBase} ${detectedColor} ${detectedSize}`.replace(/\s+/g, ' ').trim();
  const variantA = `${baseTitle} - Ottimo Stato`;
  const variantB = `Vintage ${baseTitle} - Style Unico`;

  return [baseTitle, variantA, variantB].map(t => t.substring(0, 70));
}

export function generateDescription(input: ListingInput): string {
  const { title, description, useEmoji } = input;

  const brandMatch = title.match(/(anthony morato|nike|zara|levis|adidas|gucci|prada)/i);
  const brand = brandMatch ? smartCapitalize(brandMatch[0]) : "";

  const technicalInfo = interpretTechnicalDetails(description);

  // Creazione di una narrazione "umana" e "radiosa"
  const intro = `Ciao! Se stai cercando un capo che unisca stile e qualità, questo articolo fa proprio al caso tuo. `;

  const body = `Si tratta di un pezzo ${brand ? `firmato ${brand}` : 'molto bello'}, tenuto con una cura incredibile e pronto per vivere una nuova storia nel tuo guardaroba. `;

  const details = `L'articolo si presenta in condizioni davvero ottime, esattamente come puoi vedere dalle foto. ${technicalInfo ? `Ecco qualche dettaglio in più: ${technicalInfo}. ` : ''}`;

  const closing = `La vestibilità è fantastica e il design è pensato per non passare inosservato. Resto a tua completa disposizione se desideri ricevere misure millimetriche o scatti fotografici extra per apprezzare ogni minimo dettaglio. Un'occasione da non perdere, ti aspetto in chat!`;

  let finalDesc = `${intro}${body}${details}${closing}`;

  // Rimuove eventuali Markdown residui e pulisce spazi
  finalDesc = finalDesc.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

  if (useEmoji) {
    const emojis = ["✨", "💎", "🌟", "🔥", "📸", "📦", "🇮🇹", "🧶"];
    // Inserisce emoji in punti strategici
    finalDesc = `✨ ${finalDesc.replace('.', '. 🌟').replace('!', '! 💎')}`;
    if (finalDesc.length > 500) {
      finalDesc += " 📸";
    }
  }

  return finalDesc;
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
