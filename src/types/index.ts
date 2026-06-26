export type Locale = "en" | "cs" | "de" | "pl";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
];

export type PlantCategory = "vegetable" | "fruit" | "flower";

export interface PlantDefinition {
  id: string;
  category: PlantCategory;
  emoji: string;
  taskKeys: string[];
  months: number[];
}

export const PLANT_CATALOG: PlantDefinition[] = [
  { id: "tomato", category: "vegetable", emoji: "🍅", taskKeys: ["tomato_plant", "tomato_water", "tomato_prune"], months: [4, 5, 6, 7, 8, 9] },
  { id: "cucumber", category: "vegetable", emoji: "🥒", taskKeys: ["cucumber_water", "cucumber_harvest"], months: [5, 6, 7, 8] },
  { id: "pepper", category: "vegetable", emoji: "🫑", taskKeys: ["pepper_fertilize"], months: [5, 6, 7, 8] },
  { id: "carrot", category: "vegetable", emoji: "🥕", taskKeys: ["carrot_thin"], months: [3, 4, 5, 6, 7] },
  { id: "lettuce", category: "vegetable", emoji: "🥬", taskKeys: ["lettuce_harvest"], months: [3, 4, 5, 6, 9, 10] },
  { id: "strawberry", category: "fruit", emoji: "🍓", taskKeys: ["strawberry_mulch"], months: [4, 5, 6, 7] },
  { id: "basil", category: "flower", emoji: "🌿", taskKeys: ["basil_pinch"], months: [5, 6, 7, 8, 9] },
  { id: "rose", category: "flower", emoji: "🌹", taskKeys: ["rose_prune"], months: [5, 6, 7, 8, 9] },
  { id: "sunflower", category: "flower", emoji: "🌻", taskKeys: ["general_compost"], months: [4, 5, 6, 7, 8] },
  { id: "lavender", category: "flower", emoji: "💜", taskKeys: ["general_weed"], months: [5, 6, 7, 8] },
];

export interface UserProfile {
  id: string;
  city: string;
  locale: Locale;
  onboarded: boolean;
}

export interface UserPlant {
  id: string;
  user_id: string;
  plant_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "water" | "frost" | "heat" | "general";
  message_key: string;
  params: Record<string, string | number>;
  read: boolean;
  created_at: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  city: string;
  daysSinceRain?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
