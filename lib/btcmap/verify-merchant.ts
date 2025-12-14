/**
 * BTCMap API Integration
 *
 * This module provides functions to interact with the BTCMap API
 * to verify merchant information and extract details.
 *
 * API Documentation: https://api.btcmap.org/v2/docs
 */

export interface BTCMapElement {
  id: string;
  osm_json: {
    type?: string;
    id?: number;
    lat?: number;
    lon?: number;
    tags?: {
      name?: string;
      'name:en'?: string;
      amenity?: string;
      shop?: string;
      cuisine?: string;
      description?: string;
      'addr:street'?: string;
      'addr:housenumber'?: string;
      'addr:city'?: string;
      'addr:postcode'?: string;
      'addr:country'?: string;
      phone?: string;
      website?: string;
      'contact:website'?: string;
      'contact:phone'?: string;
      'contact:twitter'?: string;
      opening_hours?: string;
      'payment:bitcoin'?: string;
      'payment:lightning'?: string;
      'payment:onchain'?: string;
      [key: string]: any;
    };
  };
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface BTCMapMerchantInfo {
  osmNodeId: string;
  name: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  paymentMethods: {
    bitcoin: boolean;
    lightning: boolean;
    onchain: boolean;
  };
  lastUpdated: Date | null;
}

/**
 * Extract OSM node ID from BTCMap URL
 *
 * Examples:
 * - https://btcmap.org/merchant/123456 → "123456"
 * - https://btcmap.org/map?id=n123456 → "123456"
 * - https://btcmap.org/element/n123456 → "123456"
 */
export function extractOsmNodeId(btcmapUrl: string): string | null {
  try {
    // Try direct merchant ID format
    const merchantMatch = btcmapUrl.match(/merchant\/(\d+)/);
    if (merchantMatch) return merchantMatch[1];

    // Try map/element format with 'n' prefix
    const nodeMatch = btcmapUrl.match(/[?&]id=n(\d+)|element\/n(\d+)/);
    if (nodeMatch) return nodeMatch[1] || nodeMatch[2];

    return null;
  } catch (error) {
    console.error('Failed to extract OSM node ID:', error);
    return null;
  }
}

/**
 * Fetch merchant data from BTCMap API
 *
 * @param osmNodeId - The OpenStreetMap node ID (without 'n' prefix)
 * @returns BTCMap element data or null if not found
 */
export async function fetchBTCMapElement(osmNodeId: string): Promise<BTCMapElement | null> {
  try {
    // BTCMap API uses 'node:' prefix for OSM node IDs
    const elementId = `node:${osmNodeId}`;
    const apiUrl = `https://api.btcmap.org/v2/elements/${elementId}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`BTCMap element not found: ${elementId}`);
        return null;
      }
      throw new Error(`BTCMap API error: ${response.status} ${response.statusText}`);
    }

    const data: BTCMapElement = await response.json();

    // Check if element is deleted
    if (data.deleted_at) {
      console.log(`BTCMap element deleted: ${elementId}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch BTCMap element ${osmNodeId}:`, error);
    return null;
  }
}

/**
 * Parse BTCMap element data into structured merchant info
 */
export function parseBTCMapElement(element: BTCMapElement): BTCMapMerchantInfo {
  const tags = element.osm_json.tags || {};
  const osm = element.osm_json;

  // Extract name (prefer English if available)
  const name = tags['name:en'] || tags.name || 'Unknown Merchant';

  // Determine category from amenity or shop tags
  const category = tags.amenity || tags.shop || tags.cuisine || 'other';

  // Build address string
  const addressParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(' ') : null;

  // Extract location
  const latitude = osm.lat || null;
  const longitude = osm.lon || null;

  // Extract contact info
  const website = tags.website || tags['contact:website'] || null;
  const phone = tags.phone || tags['contact:phone'] || null;

  // Parse payment methods
  const paymentMethods = {
    bitcoin: tags['payment:bitcoin'] === 'yes' || true, // Assume true since it's on BTCMap
    lightning: tags['payment:lightning'] === 'yes' || false,
    onchain: tags['payment:onchain'] === 'yes' || false,
  };

  return {
    osmNodeId: osm.id?.toString() || element.id.replace('node:', ''),
    name,
    category,
    latitude,
    longitude,
    address,
    city: tags['addr:city'] || null,
    country: tags['addr:country'] || null,
    phone,
    website,
    openingHours: tags.opening_hours || null,
    paymentMethods,
    lastUpdated: element.updated_at ? new Date(element.updated_at) : null,
  };
}

/**
 * Verify a merchant against BTCMap and return structured data
 *
 * @param btcmapUrl - Full BTCMap URL
 * @returns Verified merchant info or null if verification fails
 */
export async function verifyMerchant(btcmapUrl: string): Promise<BTCMapMerchantInfo | null> {
  // Extract OSM node ID
  const osmNodeId = extractOsmNodeId(btcmapUrl);
  if (!osmNodeId) {
    console.error('❌ Invalid BTCMap URL format:', btcmapUrl);
    console.error('Expected formats:');
    console.error('  - https://btcmap.org/merchant/123456');
    console.error('  - https://btcmap.org/map?id=n123456');
    console.error('  - https://btcmap.org/element/n123456');
    return null;
  }

  console.log(`✅ Extracted OSM node ID: ${osmNodeId} from URL: ${btcmapUrl}`);

  // Fetch element from BTCMap
  const element = await fetchBTCMapElement(osmNodeId);
  if (!element) {
    console.error(`❌ Merchant with ID ${osmNodeId} not found on BTCMap API`);
    console.error(`API endpoint tried: https://api.btcmap.org/v2/elements/node:${osmNodeId}`);
    return null;
  }

  console.log(`✅ Found merchant on BTCMap: ${element.osm_json.tags?.name || 'Unknown'}`);

  // Parse and return merchant info
  return parseBTCMapElement(element);
}

/**
 * Build BTCMap URL from OSM node ID
 */
export function buildBTCMapUrl(osmNodeId: string): string {
  return `https://btcmap.org/map?id=n${osmNodeId}`;
}

/**
 * Search for nearby merchants on BTCMap
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @param limit - Maximum number of results (default: 20)
 * @returns Array of BTCMap elements
 */
export async function searchNearbyMerchants(
  lat: number,
  lon: number,
  limit: number = 20
): Promise<BTCMapElement[]> {
  try {
    // BTCMap API for area search
    const apiUrl = `https://api.btcmap.org/v2/elements`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`BTCMap API error: ${response.status}`);
    }

    const elements: BTCMapElement[] = await response.json();

    // Filter by proximity (simple distance calculation)
    const nearby = elements
      .filter(el => el.osm_json.lat && el.osm_json.lon && !el.deleted_at)
      .map(el => {
        const distance = calculateDistance(
          lat,
          lon,
          el.osm_json.lat!,
          el.osm_json.lon!
        );
        return { element: el, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(item => item.element);

    return nearby;
  } catch (error) {
    console.error('Failed to search nearby merchants:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
