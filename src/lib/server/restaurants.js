import {
	averageCenter,
	coordinatesOf,
	distanceInKm,
	markerOf,
	toCoordinates
} from '#lib/coordinates.js';
import {
	GetAllRestaurantExtras,
	GetAllRestaurants,
	GetRestaurantsByName
} from '#lib/server/database.js';

const RADIUS_KM = 1;
const DEFAULT_CITY = 'London';

/** @type {{ id: 'ranked' | 'want_to_try', label: string, badge: string | null }[]} */
const LIST_TABS = [
	{ id: 'ranked', label: 'Ranked', badge: 'β' },
	{ id: 'want_to_try', label: 'Want to try', badge: null }
];

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'resto-map/1.0 (local demo)';
const LANGUAGE = 'fr,en';
const MIN_REQUEST_INTERVAL_MS = 1100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 8000;

/** @type {Map<string, { value: import('#lib/types.js').MapCenter | null, expiresAt: number }>} */
const geocodeCache = new Map();

let nextRequestAt = 0;

/**
 * Load everything the page needs for one query.
 * @param {string} rawQuery
 */
export async function getPageData(rawQuery) {
	const query = rawQuery.trim().replace(/\s+/g, ' ');
	const allRestaurants = GetAllRestaurants();

	if (!query) {
		return toPage(allRestaurants, searchInfo('all', allRestaurants, averageCenter(allRestaurants)));
	}

	const nameMatches = GetRestaurantsByName(query);

	if (nameMatches.length > 0) {
		return toPage(nameMatches, searchInfo('name', nameMatches, averageCenter(nameMatches)));
	}

	const place = await geocode(query);

	if (!place) {
		return toPage([], searchInfo('not-found', [], null));
	}

	const nearby = restaurantsNear(allRestaurants, place);
	return toPage(nearby, searchInfo('address', nearby, place));
}

/**
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @param {import('#lib/types.js').SearchInfo} search
 */
function toPage(restaurants, search) {
	return {
		markers: buildMarkers(restaurants),
		lists: buildLists(restaurants),
		details: buildDetails(restaurants),
		search
	};
}

/**
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @returns {Record<number, import('#lib/types.js').RestaurantDetail>}
 */
function buildDetails(restaurants) {
	const extras = GetAllRestaurantExtras();
	/** @type {Record<number, import('#lib/types.js').RestaurantDetail>} */
	const details = {};

	for (const restaurant of restaurants) {
		const extra = extras.get(restaurant.id);
		if (!extra) continue;

		details[restaurant.id] = { ...restaurant, tags: extra.tags, photos: extra.photos };
	}

	return details;
}

/**
 * @param {import('#lib/types.js').SearchMode} mode
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @param {import('#lib/types.js').MapCenter | null} center
 * @returns {import('#lib/types.js').SearchInfo}
 */
function searchInfo(mode, restaurants, center) {
	return {
		mode,
		center,
		radiusKm: RADIUS_KM,
		city: restaurants.length > 0 ? restaurants[0].city : DEFAULT_CITY
	};
}

/**
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @param {import('#lib/types.js').MapCenter} center
 * @returns {import('#lib/types.js').Restaurant[]}
 */
function restaurantsNear(restaurants, center) {
	/** @type {import('#lib/types.js').Restaurant[]} */
	const nearby = [];

	for (const restaurant of restaurants) {
		const coordinates = coordinatesOf(restaurant);
		if (!coordinates) continue;

		const distance = distanceInKm(center.lat, center.lng, coordinates.lat, coordinates.lng);
		if (distance <= RADIUS_KM) nearby.push(restaurant);
	}

	return nearby;
}

/**
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @returns {import('#lib/types.js').MapMarker[]}
 */
function buildMarkers(restaurants) {
	/** @type {import('#lib/types.js').MapMarker[]} */
	const markers = [];

	for (const restaurant of restaurants) {
		const marker = markerOf(restaurant);
		if (marker) markers.push(marker);
	}

	return markers;
}

/**
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @returns {import('#lib/types.js').RestaurantList[]}
 */
function buildLists(restaurants) {
	/** @type {import('#lib/types.js').RestaurantList[]} */
	const lists = [];

	for (const tab of LIST_TABS) {
		/** @type {import('#lib/types.js').Restaurant[]} */
		const items = [];

		for (const restaurant of restaurants) {
			if (restaurant.listing_status !== 'published') continue;
			if (restaurant.list_status !== tab.id) continue;

			items.push(restaurant);
		}

		if (items.length === 0) continue;

		items.sort(tab.id === 'ranked' ? byRank : byId);

		lists.push({
			id: tab.id,
			label: tab.label,
			badge: tab.badge,
			cuisines: buildCuisines(items)
		});
	}

	return lists;
}

/** @param {import('#lib/types.js').Restaurant} a @param {import('#lib/types.js').Restaurant} b */
function byRank(a, b) {
	return (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) || a.id - b.id;
}

/** @param {import('#lib/types.js').Restaurant} a @param {import('#lib/types.js').Restaurant} b */
function byId(a, b) {
	return a.id - b.id;
}

/**
 * @param {import('#lib/types.js').Restaurant[]} items
 * @returns {import('#lib/types.js').CuisineGroup[]}
 */
function buildCuisines(items) {
	/** @type {import('#lib/types.js').CuisineGroup[]} */
	const cuisines = [{ name: 'All', items }];
	/** @type {Set<string>} */
	const names = new Set();

	for (const restaurant of items) {
		for (const cuisine of restaurant.cuisines) names.add(cuisine);
	}

	for (const name of [...names].sort()) {
		/** @type {import('#lib/types.js').Restaurant[]} */
		const group = [];

		for (const restaurant of items) {
			if (restaurant.cuisines.includes(name)) group.push(restaurant);
		}

		cuisines.push({ name, items: group });
	}

	return cuisines;
}

/**
 * Resolve a free-form query to coordinates through Nominatim.
 * @param {string} query
 * @returns {Promise<import('#lib/types.js').MapCenter | null>}
 */
async function geocode(query) {
	const key = query.toLowerCase();
	const cached = geocodeCache.get(key);

	if (cached && cached.expiresAt > Date.now()) return cached.value;

	const now = Date.now();
	const startAt = Math.max(now, nextRequestAt);
	nextRequestAt = startAt + MIN_REQUEST_INTERVAL_MS;

	if (startAt > now) {
		await new Promise((resolve) => setTimeout(resolve, startAt - now));
	}

	const value = await requestPlace(query);
	geocodeCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
	return value;
}

/**
 * @param {string} query
 * @returns {Promise<import('#lib/types.js').MapCenter | null>}
 */
async function requestPlace(query) {
	const url = new URL(NOMINATIM_URL);
	url.searchParams.set('q', query);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('limit', '1');

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': USER_AGENT,
				'Accept-Language': LANGUAGE
			},
			signal: AbortSignal.timeout(TIMEOUT_MS)
		});

		if (!response.ok) {
			console.error(`Geocoding failed with status ${response.status} for "${query}"`);
			return null;
		}

		const results = await response.json();
		const first = Array.isArray(results) ? results[0] : null;
		if (!first) return null;

		return toCoordinates(Number(first.lat), Number(first.lon));
	} catch (error) {
		console.error(`Geocoding failed for "${query}"`, error);
		return null;
	}
}
