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

export function generateSeoTitles(input: string): string[] {
  // Pattern: [BRAND] [ITEM] [COLORE] [TAGLIA]
  // Extract info from input if possible, otherwise use placeholders or keep raw
  const parts = input.split(' ').filter(p => p.length > 0);
  const main = parts.join(' ');

  return [
    main,
    `${main} - Ottime condizioni`,
    `Vintage ${main}`
  ].map(t => t.substring(0, 70));
}

export function generateDescription(input: ListingInput): string {
  const { description, useEmoji } = input;

  const paragraphs = [
    `**Stato e Motivo Vendita:**\nHo deciso di vendere questo articolo perché sto rinnovando il mio guardaroba. È stato tenuto con molta cura.`,
    `**Condizioni Reali + Difetti:**\n${description || 'L\'articolo è in ottime condizioni, come mostrato nelle foto.'}`,
    `**Fit e Autenticità:**\nCalzata regolare e qualità garantita. Disponibile per inviare foto dei dettagli o misure extra su richiesta.`,
  ];

  let finalDesc = paragraphs.join('\n\n');

  if (useEmoji) {
    finalDesc = finalDesc
      .replace('Stato e Motivo Vendita:', 'Stato e Motivo Vendita: ✨')
      .replace('Condizioni Reali + Difetti:', 'Condizioni Reali + Difetti: 🔍')
      .replace('Fit e Autenticità:', 'Fit e Autenticità: ✅');
  }

  return finalDesc;
}

export function suggestCategories(input: string): CategoryOption[] {
  // Mock logic based on keywords
  const lower = input.toLowerCase();
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

export function suggestPrice(_input: string): PriceSuggestion {
  // Mock pricing logic
  return {
    range: [25, 45],
    final: 35,
    reason: 'Basato su articoli simili venduti recentemente su Vinted.',
    confidence: 'alta'
  };
}

export function honestyChecker(input: ListingInput): string | null {
  const lower = input.description.toLowerCase();
  const titleLower = input.title.toLowerCase();

  if ((titleLower.includes('nuovo') || titleLower.includes('nuova')) && (lower.includes('difetto') || lower.includes('segni'))) {
    return "Attenzione: hai scritto 'nuovo' ma anche 'difetto'. Verifica la coerenza.";
  }
  return null;
}

export function antiSpamChecker(text: string): string {
  // Rimuove punteggiatura eccessiva e parole ripetute consecutivamente
  return text
    .replace(/[!?]{2,}/g, (match) => match[0] || '')
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    .trim();
}
