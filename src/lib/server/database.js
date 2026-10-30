import Database from 'better-sqlite3';

const database = new Database('./taste.sqlite');

// Cover photo and cuisines are resolved in SQL, so the rest of the app never
// needs to know how the database is structured.
const RESTAURANT_SELECT = `
	SELECT
		r.*,
		(
			SELECT p.url
			FROM photos p
			WHERE p.restaurant_id = r.id
			ORDER BY p.position
			LIMIT 1
		) AS cover_url,
		COALESCE((
			SELECT json_group_array(t.name)
			FROM restaurant_tags rt
			JOIN tags t ON t.id = rt.tag_id
			WHERE rt.restaurant_id = r.id AND t.kind = 'cuisine'
		), '[]') AS cuisines_json,
		r.street_address || ', ' || r.city || COALESCE(' ' || r.postcode, '') AS full_address
	FROM restaurants r
`;

const selectAll = database.prepare(`${RESTAURANT_SELECT} ORDER BY r.id`);
const selectByName = database.prepare(
	`${RESTAURANT_SELECT} WHERE r.name LIKE ? ESCAPE '\\' ORDER BY r.id`
);

const selectTags = database.prepare(`
	SELECT rt.restaurant_id, t.name
	FROM restaurant_tags rt
	JOIN tags t ON t.id = rt.tag_id
	ORDER BY rt.restaurant_id, rt.position
`);

const selectPhotos = database.prepare(`
	SELECT restaurant_id, url, caption, alt_text
	FROM photos
	ORDER BY restaurant_id, position
`);

const selectAllTags = database.prepare(`
	SELECT id, slug, name, kind
	FROM tags
	ORDER BY kind, name
`);

const selectTagByName = database.prepare(`
	SELECT id FROM tags WHERE lower(name) = lower(?)
`);

const selectRestaurantSlug = database.prepare(`SELECT 1 FROM restaurants WHERE slug = ?`);
const selectTagSlug = database.prepare(`SELECT 1 FROM tags WHERE slug = ?`);

const insertTag = database.prepare(`
	INSERT INTO tags (slug, name, kind) VALUES (?, ?, ?)
`);

const insertRestaurant = database.prepare(`
	INSERT INTO restaurants (
		slug, name, tagline, description, price_tier, avg_spend_min, avg_spend_max,
		currency, editorial_rating, phone, street_address, postcode, neighborhood, city,
		latitude, longitude, country_code, listing_status
	) VALUES (
		@slug, @name, @tagline, @description, @price_tier, @avg_spend_min, @avg_spend_max,
		@currency, @editorial_rating, @phone, @street_address, @postcode, @neighborhood, @city,
		@latitude, @longitude, 'GB', 'pending'
	)
`);

const insertRestaurantTag = database.prepare(`
	INSERT INTO restaurant_tags (restaurant_id, tag_id, position) VALUES (?, ?, ?)
`);

const insertPhoto = database.prepare(`
	INSERT INTO photos (restaurant_id, position, url, alt_text) VALUES (?, ?, ?, ?)
`);

/**
 * @param {Record<string, unknown>} row
 * @returns {import('#lib/types.js').Restaurant}
 */
function toRestaurant(row) {
	const { cuisines_json, ...restaurant } = row;

	return /** @type {import('#lib/types.js').Restaurant} */ ({
		...restaurant,
		cuisines: JSON.parse(String(cuisines_json))
	});
}

/** @returns {import('#lib/types.js').Restaurant[]} */
export function GetAllRestaurants() {
	return selectAll.all().map(toRestaurant);
}

/**
 * @param {string} query
 * @returns {import('#lib/types.js').Restaurant[]}
 */
export function GetRestaurantsByName(query) {
	const pattern = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
	return selectByName.all(pattern).map(toRestaurant);
}

/** @returns {import('#lib/types.js').Tag[]} */
export function GetTags() {
	return /** @type {import('#lib/types.js').Tag[]} */ (selectAllTags.all());
}

/**
 * Detail-page extras for every restaurant, keyed by restaurant id.
 * @returns {Map<number, { tags: string[], photos: import('#lib/types.js').RestaurantPhoto[] }>}
 */
export function GetAllRestaurantExtras() {
	/** @type {Map<number, { tags: string[], photos: import('#lib/types.js').RestaurantPhoto[] }>} */
	const extras = new Map();

	const tags = /** @type {Array<{ restaurant_id: number, name: string }>} */ (selectTags.all());
	const photos =
		/** @type {Array<{ restaurant_id: number, url: string, caption: string | null, alt_text: string | null }>} */ (
			selectPhotos.all()
		);

	for (const { restaurant_id, name } of tags) {
		extraOf(extras, restaurant_id).tags.push(name);
	}

	for (const { restaurant_id, url, caption, alt_text } of photos) {
		extraOf(extras, restaurant_id).photos.push({ url, caption, alt_text });
	}

	return extras;
}

/**
 * Store an owner submission for editorial review (listing_status = 'pending').
 * Tags that do not exist yet are created as style tags.
 * @param {import('#lib/types.js').NewRestaurantSubmission} submission
 * @returns {{ id: number, slug: string }}
 */
export function CreatePendingRestaurant(submission) {
	const create = database.transaction(
		(/** @type {import('#lib/types.js').NewRestaurantSubmission} */ input) => {
			const slug = uniqueSlug(input.name, (candidate) =>
				Boolean(selectRestaurantSlug.get(candidate))
			);
			const result = insertRestaurant.run({
				slug,
				name: input.name,
				tagline: input.tags.slice(0, 2).join(' · ') || null,
				description: input.description,
				price_tier: input.price_tier,
				avg_spend_min: input.avg_spend_min,
				avg_spend_max: input.avg_spend_max,
				currency: input.currency,
				editorial_rating: input.editorial_rating,
				phone: input.phone,
				street_address: input.street_address,
				postcode: input.postcode,
				neighborhood: input.neighborhood,
				city: input.city,
				latitude: input.latitude,
				longitude: input.longitude
			});
			const id = Number(result.lastInsertRowid);

			/** @type {Set<string>} */
			const seen = new Set();
			let position = 0;

			for (const name of input.tags) {
				const key = name.toLowerCase();
				if (!name || seen.has(key)) continue;

				seen.add(key);
				const tagId = findOrCreateTag(name);
				position += 1;
				insertRestaurantTag.run(id, tagId, position);
			}

			input.photos.forEach((photo, index) => {
				insertPhoto.run(id, index + 1, photo.url, photo.alt_text);
			});

			return { id, slug };
		}
	);

	return create(submission);
}

/**
 * @param {string} name
 * @returns {number}
 */
function findOrCreateTag(name) {
	const existing = /** @type {{ id: number } | undefined} */ (selectTagByName.get(name));
	if (existing) return existing.id;

	const slug = uniqueSlug(name, (candidate) => Boolean(selectTagSlug.get(candidate)));
	const result = insertTag.run(slug, name, 'style');
	return Number(result.lastInsertRowid);
}

/**
 * @param {string} value
 * @param {(candidate: string) => boolean} exists
 * @returns {string}
 */
function uniqueSlug(value, exists) {
	const base =
		value
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 80) || 'restaurant';

	let slug = base;
	let suffix = 2;

	while (exists(slug)) {
		slug = `${base}-${suffix}`;
		suffix += 1;
	}

	return slug;
}

/**
 * @param {Map<number, { tags: string[], photos: import('#lib/types.js').RestaurantPhoto[] }>} extras
 * @param {number} restaurantId
 */
function extraOf(extras, restaurantId) {
	let extra = extras.get(restaurantId);

	if (!extra) {
		extra = { tags: [], photos: [] };
		extras.set(restaurantId, extra);
	}

	return extra;
}
