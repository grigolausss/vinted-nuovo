# Specifiche Tecniche e di Design: Vinted Listing Copilot

## 1. Visione del Prodotto
**Vinted Listing Copilot** è un'applicazione nativa per macOS progettata per trasformare il processo di vendita su Vinted in un'esperienza fluida, veloce e professionale. L'obiettivo è eliminare l'attrito creativo per l'utente, garantendo al contempo annunci ottimizzati per la visibilità (SEO) e la conversione.

L'app agisce come un partner intelligente che distilla input grezzi in inserzioni "pronto-incolla", mantenendo un tono umano e autentico, evitando automazioni percepibili come spam o artificiali.

---

## 2. Design System (macOS Apple-Level)

### Estetica e Identità Visiva
- **Minimalismo Elegante:** Interfaccia pulita con ampio uso di spazi bianchi (whitespace) per ridurre il carico cognitivo.
- **Materiali:** Utilizzo dell'effetto *Vibrancy* (translucidità) tipico di macOS per le barre laterali e le barre degli strumenti.
- **Tipografia:** San Francisco (SF Pro) come font di sistema. Gerarchia chiara:
  - Titoli: Semibold/Bold con spaziatura ottica curata.
  - Body: Regular, con interlinea aumentata per la massima leggibilità.
- **Iconografia:** Uso esclusivo di *SF Symbols* per un look nativo e coerente.

### UX & Micro-interazioni
- **Fluidità:** Transizioni morbide tra i Tab e durante la generazione dei contenuti.
- **Feedback Immediato:** Micro-animazioni di caricamento (shimmer effects o spinner discreti) durante l'elaborazione.
- **Stati di Successo:** I pulsanti di copia mostrano un feedback visivo temporaneo ("Copiato ✓") con un'animazione a molla (spring animation).

---

## 3. Architettura dell'Interfaccia (UI)

L'applicazione si struttura su una singola finestra macOS con una barra dei Tab (NSTabView) posizionata in alto, offrendo due sezioni principali:

### Tab 1: Genera (⌘1)
L'area di lavoro principale dove avviene la magia.
- **Layout:** Split-view verticale.
  - **Sinistra (Input):** Campi per il Titolo grezzo e la Descrizione grezza, con toggle per le Emoji.
  - **Destra (Output):** 4 Card dinamiche che appaiono dopo il clic su "Genera".
- **Pulsanti Azione:** Posizionati in basso a destra, con il pulsante "Genera" prominente.

### Tab 2: Archivio (⌘2)
Il centro di gestione post-vendita.
- **Layout:** Sidebar sinistra per i filtri (Venduti, Non Venduti, In Scadenza) e vista principale a lista/card per gli articoli.
- **Dettaglio:** Cliccando su un articolo nell'archivio si accede alla cronologia e ai suggerimenti di follow-up.

---

## 4. Specifiche Funzionali: Tab "Genera"

### Input (Colonna Sinistra)
- **Campo A: Titolo Grezzo**
  - Placeholder: "Cosa stai vendendo?"
  - Tipo: Text field a riga singola.
  - Vincolo: Focus automatico all'avvio e dopo ogni reset.
- **Campo B: Descrizione Grezza**
  - Placeholder: "Inserisci dettagli, misure, difetti o prove di autenticità..."
  - Tipo: Text area multi-riga con scroll fluido.
- **Toggle Emoji:** Interruttore ON/OFF (Default: OFF). Determina la presenza di emoji nella card "Descrizione".

### Azioni Principali
- **Pulsante "Genera":** Attiva il motore di elaborazione. Disabilitato se i campi sono vuoti.
- **Pulsante "Svuota":** Pulisce istantaneamente i campi input (scorciatoia ⌘⌫).
- **Pulsante "Procedi con nuovo articolo":**
  1. Salva i dati correnti nell'Archivio.
  2. Resetta i campi input e output.
  3. Riporta il focus sul "Titolo Grezzo".

### Output (4 Card in Colonna Destra)

Ogni card include un pulsante **"Copia"** nell'angolo in alto a destra.

#### Card 1: Titolo Vinted (Ottimizzato SEO)
- **Struttura:** `[BRAND] [ARTICOLO] [COLORE] [TAGLIA]` + Descrittore naturale (es. "Vintage", "Oversize").
- **Varianti:** Mostra il titolo principale e due alternative selezionabili (A/B).
- **Vincoli:** Max 70 caratteri, zero emoji, zero CAPS LOCK, zero punteggiatura spam.

#### Card 2: Descrizione (Umana e Professionale)
- **Stile:** Testo fluido, amichevole ma professionale, in italiano.
- **Contenuto:** Diviso in paragrafi (Stato, Condizioni/Difetti, Misure, Fit, Autenticità).
- **Regola Emoji:** Se Toggle ON, inserisce 1-2 emoji pertinenti per paragrafo. Se OFF, zero emoji.
- **Lunghezza:** 120-220 parole, adattate dinamicamente all'oggetto.

#### Card 3: Categoria (Top 3 Consigliate)
- **Visualizzazione:** Lista di 3 opzioni con percorso esatto (es. `Donna → Borse → Borse a spalla`).
- **Indicatori:**
  - Percentuale di confidenza per ogni opzione.
  - Badge "Migliore corrispondenza" sulla #1.
  - Motivazione breve (es. "Presenza di cappuccio e zip: Hoodies").
- **Stato Ambiguo:** Se la confidenza è bassa (<40%), mostra un avviso non invasivo suggerendo all'utente cosa controllare per decidere.

#### Card 4: Prezzo Consigliato (Analisi di Mercato)
- **Dati:** Range di prezzo (Min-Max) e Prezzo Finale suggerito.
- **Motivazione:** Spiegazione del perché di quel prezzo basata sulle condizioni dichiarate.
- **Fallback:** Se il sistema non trova comparabili affidabili, mostra "Confidenza bassa: stabilisci tu un prezzo" e abilita un campo di input manuale.

---

## 5. Specifiche Funzionali: Tab "Archivio" & Tracker

### Flusso di Archiviazione Automatica
Ogni volta che l'utente clicca su **"Procedi con nuovo articolo"**, i dati dell'inserzione appena generata vengono salvati localmente con i seguenti metadati:
- **ID Interno:** Univoco per articolo.
- **Timestamp:** Data e ora di creazione.
- **Stato Iniziale:** "Non venduto".
- **Contatore:** Giorni trascorsi dalla creazione (Giorno 0, Giorno 1, ecc.).

### Visualizzazione Archivio
- **Interfaccia:** Lista a card in stile Apple, ordinata per data (più recenti in alto).
- **Contenuto della Card:** Titolo, Prezzo finale, Categoria, Stato (Badge colorato), Giorni trascorsi.
- **Filtri Rapidi:** "Non venduti", "Venduti", "In scadenza", "Da ribassare", "Da relistare".
- **Ricerca Istantanea (⌘K):** Barra di ricerca superiore che filtra i risultati per titolo o categoria in tempo reale.

### Tracker: Promemoria e Suggerimenti Strategici
L'app monitora passivamente l'archivio e attiva suggerimenti visivi (discreti) in base all'anzianità dell'annuncio:
- **Giorno 4:** Suggerisce un ribasso lieve (-5%) o una revisione del titolo se le visualizzazioni sono basse.
- **Giorno 10:** Suggerisce il "Relist" (ri-pubblicazione) con una nuova foto principale e un ribasso fino al 10%.
- **Giorno 15+:** Suggerisce una decisione drastica: "Ribasso pesante" vs "Pausa/Rimozione".

### Gestione Stato Vendita
L'app interroga l'utente con notifiche in-app: *"Sono passati X giorni: venduto?"*
- **Se "Sì":** Sposta in "Venduti" e chiede opzionalmente il prezzo finale effettivo per le statistiche.
- **Se "No":** Propone una nuova strategia di prezzo.

### Sezione Insights (Lightweight)
Una vista minimalista accessibile dall'Archivio che mostra:
- **Tempo medio di vendita:** Calcolato sui "Venduti".
- **Tasso di successo (%):** Rapporto venduti/totali.
- **Analisi Prezzo:** Differenza tra prezzo consigliato e prezzo di vendita reale.
- **Top Categorie:** Quali categorie generano vendite più veloci.

---

## 6. Interazione Utente: Keyboard-First (macOS)

L'applicazione è progettata per essere utilizzata quasi esclusivamente tramite tastiera per massimizzare la velocità operativa.

| Scorciatoia | Azione |
| :--- | :--- |
| **⌘N** | Nuovo articolo (Tab Genera + focus su Titolo) |
| **⌘Enter** | Genera (quando i campi input sono compilati) |
| **⌘K** | Focus sulla barra di ricerca (Tab Archivio) |
| **⌘1** | Switch alla Tab "Genera" |
| **⌘2** | Switch alla Tab "Archivio" |
| **⌘⇧C** | Copia l'output della card attualmente attiva |
| **⌘⌫** | Svuota i campi input (con conferma visiva soft) |
| **⌘D** | Segna come "Venduto" (se un articolo è selezionato in Archivio) |
| **Frecce ↑/↓** | Navigazione tra le card di output o la lista in Archivio |
| **Tab / ⇧Tab** | Navigazione tra i campi di input |
| **Esc** | Chiude modali o toglie il focus dalla ricerca |

*Nota: Le scorciatoie sono indicate tramite tooltip eleganti vicino ai pulsanti corrispondenti.*

---

## 7. Linee Guida Microcopy & Tono di Voce

Il tono di voce deve riflettere l'identità di un assistente senior: esperto, affidabile, ma accessibile.

- **Lingua:** Italiano impeccabile, naturale e fluido.
- **Feedback Brevi:** "Copiato ✓", "Pronto per Vinted", "Archiviato".
- **Warning Non Invasivi:** Utilizzare messaggi costruttivi. Es: *"Sembra che manchino le misure: aggiungerle aiuterà a vendere prima."*
- **Evitare:** Slang eccessivo, termini troppo tecnici o formali ("corporatese"), e fioriture artificiali tipiche di alcune AI.

---

## 8. Controlli di Qualità e Sicurezza Testuale

Prima di mostrare l'output, il sistema esegue tre controlli automatici silenti:

1. **Honesty Checker:** Evidenzia contraddizioni tra i campi (es. si l'utente scrive "Nuovo" nel titolo ma descrive un "difetto" nel testo). Mostra un avviso: *"Rilevata incoerenza tra stato e descrizione. Verificare."*
2. **Anti-Spam Checker:** Pulisce l'output da liste di keyword innaturali, ripetizioni eccessive e punteggiatura spam (es. "!!!" o "???").
3. **No-Invention Rule:** Vincolo tecnico assoluto. Il sistema non deve MAI inventare dettagli non presenti nell'input (es. non inventare il materiale se non è citato).

---

## 9. Esempi Pratici di Input/Output

### Esempio 1: Felpa con micro difetto
**Input:**
- Titolo: "Felpa Nike nera"
- Descrizione: "Indossata poco, taglia M. C'è un piccolo graffio sulla manica sinistra quasi invisibile."
- Toggle Emoji: ON

**Output (Sintesi):**
- **Titolo:** Nike Tech Fleece Nero Taglia M (Variante A: Felpa Nike Nera M - Ottime Condizioni)
- **Descrizione:** "Ho indossato questa felpa Nike solo poche volte. È in condizioni eccellenti, fatta eccezione per un microscopico graffio sulla manica sinistra 🔍, quasi invisibile se non cercato con attenzione. Ideale per chi cerca comfort e stile sportivo 🧶. Misure standard Nike taglia M. Disponibile per altre foto! 📸"
- **Categoria:** Uomo → Abbigliamento → Maglioni e felpe → Felpe con cappuccio (92% Confidenza)
- **Prezzo:** €35 - €42 (Consigliato: €39). Motivazione: Il brand Nike tiene bene il valore, il micro difetto è compensato dall'uso ridotto.

---

### Esempio 2: Orologio Swatch (Full Set)
**Input:**
- Titolo: "Swatch vintage anni 90"
- Descrizione: "Pezzo da collezione, mai usato. Completo di scatola originale e documenti."
- Toggle Emoji: OFF

**Output (Sintesi):**
- **Titolo:** Swatch Vintage Limited Edition - Full Set - Anni 90
- **Descrizione:** "Raro esemplare di Swatch degli anni '90, un vero pezzo da collezione. L'orologio è nuovo, mai indossato e conservato meticolosamente. Viene fornito come set completo (Full Set), includendo la sua scatola originale dell'epoca e tutti i documenti di autenticità. Un'opportunità unica per collezionisti del brand o amanti dello stile vintage heritage."
- **Categoria:** Hobbies → Collezionismo → Orologi (88% Confidenza)
- **Prezzo:** €85 - €120 (Consigliato: €110). Motivazione: Il "Full Set" e lo stato "Mai usato" aumentano drasticamente il valore collezionistico.

---

### Esempio 3: Tavolino da caffè (No Brand)
**Input:**
- Titolo: "Tavolino legno"
- Descrizione: "Tavolino tondo in legno chiaro per salotto, diametro 60cm, altezza 45cm. Qualche segno di usura sul piano."
- Toggle Emoji: OFF

**Output (Sintesi):**
- **Titolo:** Tavolino da Caffè Tondo in Legno Chiaro - 60x45cm
- **Descrizione:** "Elegante tavolino da caffè per salotto in legno chiaro, caratterizzato da un design tondo minimalista. Dimensioni: diametro 60 cm, altezza 45 cm. Il piano presenta alcuni segni di usura dovuti all'utilizzo quotidiano, che non ne compromettono la stabilità o l'estetica generale. Perfetto per ambienti moderni o scandinavi."
- **Categoria:** Casa → Mobili → Tavoli → Tavolini da caffè (95% Confidenza)
- **Prezzo:** €15 - €25 (Consigliato: €20). Motivazione: Oggetto generico senza brand, prezzo basato sulla funzionalità e dimensioni. Confidenza automatica assistita.

---
