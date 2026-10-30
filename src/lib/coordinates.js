const EARTH_RADIUS_KM = 6371;

/**
 * Validate and normalize a coordinate pair.
 * @param {number | null | undefined} lat
 * @param {number | null | undefined} lng
 * @returns {import('#lib/types.js').MapCenter | null}
 */
export function toCoordinates(lat, lng) {
	if (typeof lat !== 'number' || typeof lng !== 'number') return null;
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

	return { lat, lng };
}

/**
 * Coordinates of a restaurant, or null when it cannot be placed on the map.
 * @param {import('#lib/types.js').Restaurant} restaurant
 * @returns {import('#lib/types.js').MapCenter | null}
 */
export function coordinatesOf(restaurant) {
	return toCoordinates(restaurant.latitude, restaurant.longitude);
}

/**
 * Map marker for a restaurant, or null when it has no usable coordinates.
 * @param {import('#lib/types.js').Restaurant} restaurant
 * @returns {import('#lib/types.js').MapMarker | null}
 */
export function markerOf(restaurant) {
	const coordinates = coordinatesOf(restaurant);
	if (!coordinates) return null;

	return {
		id: restaurant.id,
		lat: coordinates.lat,
		lng: coordinates.lng,
		label: restaurant.name
	};
}

/**
 * Great-circle distance between two coordinates, in kilometres.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number}
 */
export function distanceInKm(lat1, lng1, lat2, lng2) {
	/** @param {number} degrees */
	const toRadians = (degrees) => (degrees * Math.PI) / 180;
	const deltaLat = toRadians(lat2 - lat1);
	const deltaLng = toRadians(lng2 - lng1);

	const a =
		Math.sin(deltaLat / 2) ** 2 +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2;

	return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Mean coordinate of the restaurants that can be placed on the map.
 * @param {import('#lib/types.js').Restaurant[]} restaurants
 * @returns {import('#lib/types.js').MapCenter | null}
 */
export function averageCenter(restaurants) {
	let lat = 0;
	let lng = 0;
	let count = 0;

	for (const restaurant of restaurants) {
		const coordinates = coordinatesOf(restaurant);
		if (!coordinates) continue;

		lat += coordinates.lat;
		lng += coordinates.lng;
		count += 1;
	}

	if (count === 0) return null;

	return { lat: lat / count, lng: lng / count };
}
