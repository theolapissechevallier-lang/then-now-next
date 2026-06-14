export type ItemKind = "skin" | "hair" | "outfit" | "accessory" | "background" | "pet-skin" | "pet-accessory";

export type CosmeticItem = {
  id: string;
  kind: ItemKind;
  name: string;
  price: number; // coins, 0 = free default
  premium?: boolean; // requires Premium
  swatch?: string;
  emoji?: string;
  // Visual data
  hairColor?: string;
  outfitColor?: string;
  skinColor?: string;
  bg?: string; // CSS background
  petColor?: string;
  petPattern?: "none" | "stars" | "fire" | "aurora";
  badge?: string; // small label like "Aurora"
};

export const ITEMS: CosmeticItem[] = [
  // Skin tones
  { id: "skin-warm", kind: "skin", name: "Warm", price: 0, skinColor: "#f1c7a7", swatch: "#f1c7a7" },
  { id: "skin-tan", kind: "skin", name: "Tan", price: 0, skinColor: "#d6a073", swatch: "#d6a073" },
  { id: "skin-deep", kind: "skin", name: "Deep", price: 0, skinColor: "#7a4a30", swatch: "#7a4a30" },
  { id: "skin-cool", kind: "skin", name: "Cool", price: 0, skinColor: "#f8d9c2", swatch: "#f8d9c2" },

  // Hair
  { id: "hair-short", kind: "hair", name: "Short", price: 0, hairColor: "#2c2c34", swatch: "#2c2c34" },
  { id: "hair-buzz", kind: "hair", name: "Buzz cut", price: 40, hairColor: "#3a2a1c", swatch: "#3a2a1c" },
  { id: "hair-curly", kind: "hair", name: "Curly", price: 60, hairColor: "#2c2c34", swatch: "#2c2c34" },
  { id: "hair-long", kind: "hair", name: "Long flow", price: 80, hairColor: "#5b3a25", swatch: "#5b3a25" },
  { id: "hair-pink", kind: "hair", name: "Neon pink", price: 0, premium: true, hairColor: "#ff5cae", swatch: "#ff5cae" },
  { id: "hair-gold", kind: "hair", name: "Solar gold", price: 0, premium: true, hairColor: "#f5c542", swatch: "#f5c542" },

  // Outfit
  { id: "outfit-hoodie", kind: "outfit", name: "Hoodie", price: 0, outfitColor: "#3b7a57", swatch: "#3b7a57" },
  { id: "outfit-tee", kind: "outfit", name: "Plain tee", price: 30, outfitColor: "#9ca3af", swatch: "#9ca3af" },
  { id: "outfit-blazer", kind: "outfit", name: "Blazer", price: 90, outfitColor: "#1f2937", swatch: "#1f2937" },
  { id: "outfit-athlete", kind: "outfit", name: "Athlete", price: 70, outfitColor: "#e85d3a", swatch: "#e85d3a" },
  { id: "outfit-aurora", kind: "outfit", name: "Aurora", price: 0, premium: true, outfitColor: "#7c3aed", swatch: "#7c3aed", badge: "Aurora" },
  { id: "outfit-monk", kind: "outfit", name: "Founder", price: 0, premium: true, outfitColor: "#111114", swatch: "#111114" },

  // Accessories
  { id: "acc-none", kind: "accessory", name: "None", price: 0, emoji: "✕" },
  { id: "acc-glasses", kind: "accessory", name: "Glasses", price: 50, emoji: "🕶️" },
  { id: "acc-headphones", kind: "accessory", name: "Headphones", price: 80, emoji: "🎧" },
  { id: "acc-halo", kind: "accessory", name: "Halo", price: 0, premium: true, emoji: "😇" },
  { id: "acc-crown", kind: "accessory", name: "Crown", price: 0, premium: true, emoji: "👑" },

  // Backgrounds
  { id: "bg-aurora", kind: "background", name: "Aurora", price: 0, bg: "linear-gradient(135deg,#0d3b3b,#5b2a72)" },
  { id: "bg-sunset", kind: "background", name: "Sunset", price: 30, bg: "linear-gradient(135deg,#ff5e62,#ff9966)" },
  { id: "bg-ocean", kind: "background", name: "Ocean", price: 30, bg: "linear-gradient(135deg,#0c2340,#2d8a9e)" },
  { id: "bg-cosmic", kind: "background", name: "Cosmic", price: 0, premium: true, bg: "linear-gradient(135deg,#020024,#7c3aed,#00d4ff)" },

  // Pet skins
  { id: "pet-blob", kind: "pet-skin", name: "Lumi (default)", price: 0, petColor: "#5be1c4", petPattern: "none", swatch: "#5be1c4" },
  { id: "pet-ember", kind: "pet-skin", name: "Ember", price: 120, petColor: "#ff7a3a", petPattern: "fire", swatch: "#ff7a3a" },
  { id: "pet-night", kind: "pet-skin", name: "Nocturne", price: 200, petColor: "#5b2a72", petPattern: "stars", swatch: "#5b2a72" },
  { id: "pet-aurora", kind: "pet-skin", name: "Aurora pet", price: 0, premium: true, petColor: "#7c3aed", petPattern: "aurora", swatch: "#7c3aed" },

  // Pet accessories
  { id: "pet-acc-none", kind: "pet-accessory", name: "None", price: 0, emoji: "✕" },
  { id: "pet-acc-bow", kind: "pet-accessory", name: "Bow", price: 60, emoji: "🎀" },
  { id: "pet-acc-crown", kind: "pet-accessory", name: "Tiny crown", price: 0, premium: true, emoji: "👑" },
  { id: "pet-acc-cap", kind: "pet-accessory", name: "Beanie", price: 80, emoji: "🧢" },
];

export const ITEMS_BY_ID: Record<string, CosmeticItem> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export function itemsOfKind(kind: ItemKind) {
  return ITEMS.filter((i) => i.kind === kind);
}

// ---------- Foods ----------

export type Food = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  hunger: number;
  happy: number;
  xp: number;
  premium?: boolean;
  desc: string;
};

export const FOODS: Food[] = [
  { id: "berry", name: "Wildberries", emoji: "🍓", price: 10, hunger: 15, happy: 5, xp: 2, desc: "Cheap and quick." },
  { id: "bowl", name: "Power bowl", emoji: "🥗", price: 25, hunger: 35, happy: 12, xp: 6, desc: "A balanced meal." },
  { id: "feast", name: "Feast", emoji: "🍱", price: 60, hunger: 70, happy: 25, xp: 15, desc: "A real celebration." },
  { id: "elixir", name: "Focus elixir", emoji: "🧪", price: 0, premium: true, hunger: 40, happy: 40, xp: 30, desc: "Premium: massive boost." },
];