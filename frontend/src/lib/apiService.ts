/**
 * API Service - Catálogo Web Público Wijutopia
 *
 * Este servicio puede trabajar en modo real contra el backend Express
 * o en modo MOCK si el backend no está disponible.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_PRODUCTS_URL = `${API_BASE_URL}/api/products`;
const API_HEALTH_URL = `${API_BASE_URL}/api/health`;

// ==================== TIPOS ====================
export interface Card {
  id: string;
  name: string;
  game: string;
  rarity: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CatalogFilter {
  game?: string;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ClickstreamEvent {
  eventType: string;
  cardId?: string;
  timestamp: string;
  sessionToken: string;
}

export interface PreorderIntent {
  cardId: string;
  quantity: number;
  sessionToken: string;
}

// ==================== MOCK DATA ====================
const MOCK_CARDS: Card[] = [
  {
    id: '1',
    name: 'Charizard ex',
    game: 'Pokemon',
    rarity: 'Rare Holo',
    price: 45.99,
    image: 'https://via.placeholder.com/300x400?text=Charizard+ex',
    quantity: 3,
  },
  {
    id: '2',
    name: 'Blastoise ex',
    game: 'Pokemon',
    rarity: 'Rare Holo',
    price: 39.99,
    image: 'https://via.placeholder.com/300x400?text=Blastoise+ex',
    quantity: 5,
  },
  {
    id: '3',
    name: 'Venusaur ex',
    game: 'Pokemon',
    rarity: 'Rare Holo',
    price: 42.5,
    image: 'https://via.placeholder.com/300x400?text=Venusaur+ex',
    quantity: 2,
  },
  {
    id: '4',
    name: 'Blue Eyes White Dragon',
    game: 'Yu-Gi-Oh',
    rarity: 'Ultra Rare',
    price: 89.99,
    image: 'https://via.placeholder.com/300x400?text=Blue+Eyes',
    quantity: 1,
  },
  {
    id: '5',
    name: 'Dark Magician',
    game: 'Yu-Gi-Oh',
    rarity: 'Ultra Rare',
    price: 75.5,
    image: 'https://via.placeholder.com/300x400?text=Dark+Magician',
    quantity: 4,
  },
  {
    id: '6',
    name: 'Gojo Satoru',
    game: 'Jujutsu Kaisen TCG',
    rarity: 'SR',
    price: 55.0,
    image: 'https://via.placeholder.com/300x400?text=Gojo+Satoru',
    quantity: 6,
  },
];

const normalizeProduct = (product: any): Card => ({
  id: String(product.id || product._id || ''),
  name: String(product.name || 'Carta sin nombre'),
  game: String(product.category || product.game || 'TCG'),
  rarity: String(product.product_tag || product.rarity || 'Normal'),
  price: Number(product.price || 0),
  image: String(product.image_url || product.image || 'https://via.placeholder.com/300x400?text=Sin+imagen'),
  quantity: Number(product.stock ?? product.quantity ?? 0),
});

const applyFilters = (cards: Card[], filters?: CatalogFilter): Card[] => {
  if (!filters) return cards;

  return cards.filter((card) => {
    if (filters.game && !card.game.toLowerCase().includes(filters.game.toLowerCase())) {
      return false;
    }
    if (filters.rarity && !card.rarity.toLowerCase().includes(filters.rarity.toLowerCase())) {
      return false;
    }
    if (filters.minPrice !== undefined && card.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && card.price > filters.maxPrice) {
      return false;
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesName = card.name.toLowerCase().includes(search);
      const matchesGame = card.game.toLowerCase().includes(search);
      return matchesName || matchesGame;
    }
    return true;
  });
};

const buildQuery = (filters?: CatalogFilter) => {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.game) params.set('category', filters.game);
  if (filters?.rarity) params.set('productTag', filters.rarity);
  if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  return params.toString();
};

const fetchProducts = async (query?: string): Promise<Card[]> => {
  const url = query ? `${API_PRODUCTS_URL}?${query}` : API_PRODUCTS_URL;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.message || 'Error al leer productos del backend');
  }

  return Array.isArray(payload.data) ? payload.data.map(normalizeProduct) : [];
};

// ==================== FUNCIONES DE CATÁLOGO ====================

export async function getAllCards(filters?: CatalogFilter): Promise<Card[]> {
  try {
    const query = buildQuery(filters);
    return await fetchProducts(query);
  } catch (error) {
    console.warn('Falling back to MOCK catalog due to backend error:', error);
    return applyFilters(MOCK_CARDS, filters);
  }
}

export async function getCardById(cardId: string): Promise<Card | null> {
  try {
    const response = await fetch(`${API_PRODUCTS_URL}/${encodeURIComponent(cardId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.success) {
      throw new Error(payload.message || 'Producto no encontrado');
    }

    return normalizeProduct(payload.data);
  } catch (error) {
    console.warn('Falling back to MOCK product detail due to backend error:', error);
    return MOCK_CARDS.find((card) => card.id === cardId) || null;
  }
}

export async function getAvailableGames(): Promise<string[]> {
  try {
    const products = await getAllCards();
    return Array.from(new Set(products.map((card) => card.game))).sort();
  } catch (error) {
    console.warn('Falling back to MOCK games list due to backend error:', error);
    return Array.from(new Set(MOCK_CARDS.map((card) => card.game))).sort();
  }
}

export async function getAvailableRarities(): Promise<string[]> {
  try {
    const products = await getAllCards();
    return Array.from(new Set(products.map((card) => card.rarity))).sort();
  } catch (error) {
    console.warn('Falling back to MOCK rarity list due to backend error:', error);
    return Array.from(new Set(MOCK_CARDS.map((card) => card.rarity))).sort();
  }
}

// ==================== TELEMETRÍA & EVENTOS ====================

export async function logClickstreamEvent(event: ClickstreamEvent): Promise<void> {
  try {
    console.log('📊 Evento registrado:', event);
    const response = await fetch(`${API_BASE_URL}/api/telemetry/clickstream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });

    if (!response.ok && response.status !== 404) {
      console.warn(`Telemetry endpoint responded with ${response.status}`);
    }
  } catch (error) {
    console.warn('Telemetry endpoint unavailable; event kept in browser log:', error);
  }
}

export async function trackAddToWishlist(cardId: string, sessionToken: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'ADD_TO_WISHLIST',
    cardId,
    timestamp: new Date().toISOString(),
    sessionToken,
  });
}

export async function trackAddToCart(cardId: string, sessionToken: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'ADD_TO_CART',
    cardId,
    timestamp: new Date().toISOString(),
    sessionToken,
  });
}

export async function trackDetailClick(cardId: string, sessionToken: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'DETAIL_CLICK',
    cardId,
    timestamp: new Date().toISOString(),
    sessionToken,
  });
}

export async function trackCheckoutAttempt(sessionToken?: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'CHECKOUT_ATTEMPT',
    timestamp: new Date().toISOString(),
    sessionToken: sessionToken || 'guest',
  });
}

export async function trackPageView(page: string, sessionToken: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'PAGE_VIEW',
    timestamp: new Date().toISOString(),
    sessionToken,
  });
}

// ==================== INTENCIONES DE COMPRA ====================

export async function createPreorderIntent(intent: PreorderIntent): Promise<string> {
  try {
    console.log('🛒 Intención de compra registrada (MOCK):', intent);
    // TODO: implementar POST /api/preorders en el backend y devolver la URL real de WhatsApp
    return 'https://wa.me/51XXXXXXXXX?text=Hola%2C%20me%20interesa%20esta%20carta%20en%20preventa';
  } catch (error) {
    console.error('Error creating preorder:', error);
    throw error;
  }
}

// ==================== VERIFICACIÓN DE CAPTCHA ====================

export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    console.log('✅ CAPTCHA verificado (MOCK)');
    return true;
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return false;
  }
}

// ==================== ESTADO DEL BACKEND ====================

export async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await fetch(API_HEALTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getBackendUrl(): string {
  return API_BASE_URL;
}

export function isMockMode(): boolean {
  return API_BASE_URL.includes('localhost');
}
