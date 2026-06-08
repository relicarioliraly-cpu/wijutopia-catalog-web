/**
 * API Service - Catálogo Web Público Wijutopia
 * 
 * ⚠️ NOTA: Este servicio actualmente usa datos simulados (MOCK).
 * Cuando el backend de gestión de admin esté disponible, reemplaza
 * las llamadas MOCK con llamadas reales a las siguientes endpoints:
 * 
 * - GET /api/catalog/cards (lista de cartas)
 * - GET /api/catalog/inventory (stock e inventario)
 * - POST /api/telemetry/clickstream (enviar eventos de usuario)
 * - POST /api/preorders (generar intención de compra)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    price: 42.50,
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
    price: 75.50,
    image: 'https://via.placeholder.com/300x400?text=Dark+Magician',
    quantity: 4,
  },
  {
    id: '6',
    name: 'Gojo Satoru',
    game: 'Jujutsu Kaisen TCG',
    rarity: 'SR',
    price: 55.00,
    image: 'https://via.placeholder.com/300x400?text=Gojo+Satoru',
    quantity: 6,
  },
];

// ==================== FUNCIONES DE CATÁLOGO ====================

/**
 * Obtiene todas las cartas del catálogo (con MOCK)
 * TODO: Reemplazar con GET /api/catalog/cards cuando el backend esté disponible
 */
export async function getAllCards(filters?: CatalogFilter): Promise<Card[]> {
  try {
    // Simulamos latencia de red
    await new Promise(resolve => setTimeout(resolve, 500));

    let results = [...MOCK_CARDS];

    if (filters) {
      if (filters.game) {
        results = results.filter(card => 
          card.game.toLowerCase().includes(filters.game!.toLowerCase())
        );
      }
      if (filters.rarity) {
        results = results.filter(card => 
          card.rarity.toLowerCase().includes(filters.rarity!.toLowerCase())
        );
      }
      if (filters.minPrice) {
        results = results.filter(card => card.price >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        results = results.filter(card => card.price <= filters.maxPrice!);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(card =>
          card.name.toLowerCase().includes(searchLower) ||
          card.game.toLowerCase().includes(searchLower)
        );
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching catalog:', error);
    throw error;
  }
}

/**
 * Obtiene una carta específica por ID
 * TODO: Reemplazar con GET /api/catalog/cards/:id cuando el backend esté disponible
 */
export async function getCardById(cardId: string): Promise<Card | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CARDS.find(card => card.id === cardId) || null;
}

/**
 * Obtiene los juegos disponibles para filtrado
 * TODO: Obtener dinámicamente del backend
 */
export async function getAvailableGames(): Promise<string[]> {
  const games = Array.from(new Set(MOCK_CARDS.map(card => card.game)));
  return games.sort();
}

/**
 * Obtiene las rarezas disponibles para filtrado
 * TODO: Obtener dinámicamente del backend
 */
export async function getAvailableRarities(): Promise<string[]> {
  const rarities = Array.from(new Set(MOCK_CARDS.map(card => card.rarity)));
  return rarities.sort();
}

// ==================== TELEMETRÍA & EVENTOS ====================

/**
 * Registra un evento de clickstream (PAGE_VIEW, DETAIL_CLICK, etc.)
 * TODO: Cuando el backend esté disponible, enviar a POST /api/telemetry/clickstream
 */
export async function logClickstreamEvent(event: ClickstreamEvent): Promise<void> {
  try {
    console.log('📊 Evento registrado (MOCK):', event);
    
    // Aquí se enviaría: POST /api/telemetry/clickstream
    // await fetch(`${API_BASE_URL}/api/telemetry/clickstream`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
  } catch (error) {
    console.error('Error logging telemetry:', error);
  }
}

/**
 * Registra que el usuario agregó una carta a su lista de deseos
 */
export async function trackAddToWishlist(cardId: string, sessionToken: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'ADD_TO_WISHLIST',
    cardId,
    timestamp: new Date().toISOString(),
    sessionToken,
  });
}

/**
 * Registra una visualización de página
 */
export async function trackPageView(page: string, sessionToken: string): Promise<void> {
  return logClickstreamEvent({
    eventType: 'PAGE_VIEW',
    timestamp: new Date().toISOString(),
    sessionToken,
  });
}

// ==================== INTENCIONES DE COMPRA ====================

/**
 * Crea una intención de compra (preventa)
 * TODO: Cuando el backend esté disponible, enviar a POST /api/preorders
 *       Y retornar URL de WhatsApp Business
 */
export async function createPreorderIntent(intent: PreorderIntent): Promise<string> {
  try {
    console.log('🛒 Intención de compra registrada (MOCK):', intent);
    
    // Aquí se enviaría: POST /api/preorders
    // const response = await fetch(`${API_BASE_URL}/api/preorders`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(intent),
    // });
    // return response.json(); // { whatsappUrl: "..." }

    // Por ahora, retorna un placeholder
    const whatsappPlaceholder = 'https://wa.me/51XXXXXXXXX?text=Hola%2C%20me%20interesa%20esta%20carta%20en%20preventa';
    return whatsappPlaceholder;
  } catch (error) {
    console.error('Error creating preorder:', error);
    throw error;
  }
}

// ==================== VERIFICACIÓN DE CAPTCHA ====================

/**
 * Verifica que el usuario no sea un bot
 * TODO: Cuando el backend esté disponible, validar contra el servicio de captcha
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    console.log('✅ CAPTCHA verificado (MOCK)');
    
    // Aquí se enviaría: POST /api/captcha/verify
    // const response = await fetch(`${API_BASE_URL}/api/captcha/verify`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token }),
    // });
    // return response.json().isValid;

    return true; // MOCK: siempre retorna true por ahora
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return false;
  }
}

// ==================== ESTADO DEL BACKEND ====================

/**
 * Verifica la disponibilidad del backend
 */
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtiene la URL del backend configurada
 */
export function getBackendUrl(): string {
  return API_BASE_URL;
}

/**
 * Verifica si estamos en modo MOCK
 */
export function isMockMode(): boolean {
  return API_BASE_URL.includes('localhost');
}
