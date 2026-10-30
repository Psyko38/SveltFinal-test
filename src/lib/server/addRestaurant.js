import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { CreatePendingRestaurant } from '#lib/server/database.js';

const MAX_TAGS = 4;
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

/** @type {Record<string, string>} */
const PHOTO_EXTENSIONS = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

/** @type {Record<number, { min: number, max: number }>} */
const AVERAGE_SPEND = {
	1: { min: 15, max: 30 },
	2: { min: 30, max: 45 },
	3: { min: 45, max: 80 },
	4: { min: 80, max: 130 }
};

/**
 * @typedef {object} SubmissionValues
 * @property {string} name
 * @property {string} location
 * @property {string} address
 * @property {string} phone
 * @property {string} price_tier
 * @property {string} editorial_rating
 * @property {string} description
 * @property {string} latitude
 * @property {string} longitude
 * @property {string[]} tags
 */

/**
 * @typedef {{ ok: true, name: string, slug: string } | { ok: false, status: number, errors: Record<string, string>, values: SubmissionValues }} SubmissionResult
 */

/**
 * Validate and store an owner submission for editorial review.
 * @param {FormData} form
 * @returns {Promise<SubmissionResult>}
 */
export async function SubmitRestaurant(form) {
	/** @type {SubmissionValues} */
	const values = {
		name: text(form, 'name'),
		location: text(form, 'location'),
		address: text(form, 'address'),
		phone: text(form, 'phone'),
		price_tier: text(form, 'price_tier'),
		editorial_rating: text(form, 'editorial_rating'),
		description: text(form, 'description'),
		latitude: text(form, 'latitude'),
		longitude: text(form, 'longitude'),
		tags: uniqueTags(form)
	};

	/** @type {Record<string, string>} */
	const errors = {};

	if (values.name.length < 2) {
		errors.name = 'Please enter the restaurant name.';
	} else if (values.name.length > MAX_NAME_LENGTH) {
		errors.name = `Keep the name under ${MAX_NAME_LENGTH} characters.`;
	}

	if (!values.location) {
		errors.location = 'Tell us the neighbourhood and city.';
	}

	if (!values.address) {
		errors.address = 'Please enter the street address.';
	}

	if (values.phone.length > 40) {
		errors.phone = 'That phone number is too long.';
	}

	const priceTier = Number(values.price_tier);
	if (!Number.isInteger(priceTier) || priceTier < 1 || priceTier > 4) {
		errors.price_tier = 'Choose a price tier.';
	}

	const rating = values.editorial_rating === '' ? null : Number(values.editorial_rating);
	if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
		errors.editorial_rating = 'The rating must be between 0 and 5.';
	}

	if (values.description.length > MAX_DESCRIPTION_LENGTH) {
		errors.description = `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`;
	}

	const latitude = Number(values.latitude);
	const longitude = Number(values.longitude);

	if (!values.latitude || !values.longitude) {
		errors.position = 'Place the restaurant on the map.';
	} else if (
		!Number.isFinite(latitude) ||
		!Number.isFinite(longitude) ||
		latitude < -90 ||
		latitude > 90 ||
		longitude < -180 ||
		longitude > 180
	) {
		errors.position = 'That map position is not valid.';
	}

	if (values.tags.length > MAX_TAGS) {
		errors.tags = `Select at most ${MAX_TAGS} tags.`;
	} else if (values.tags.some((tag) => tag.length > 40)) {
		errors.tags = 'Each tag must be 40 characters or fewer.';
	}

	const photos = form
		.getAll('photos')
		.filter((entry) => entry instanceof File && entry.size > 0)
		.map((entry) => /** @type {File} */ (entry));

	if (photos.length > MAX_PHOTOS) {
		errors.photos = `Upload at most ${MAX_PHOTOS} photos.`;
	} else if (photos.some((photo) => photo.size > MAX_PHOTO_BYTES)) {
		errors.photos = 'Each photo must be 15 MB or smaller.';
	} else if (photos.some((photo) => !(photo.type in PHOTO_EXTENSIONS))) {
		errors.photos = 'Photos must be JPG, PNG or WebP files.';
	}

	if (Object.keys(errors).length > 0) {
		return { ok: false, status: 400, errors, values };
	}

	const parsedLocation = parseLocation(values.location);
	const parsedAddress = parseAddress(values.address);
	const spend = AVERAGE_SPEND[priceTier] ?? AVERAGE_SPEND[3];
	const folder = randomUUID();
	const uploadFolder = resolve('uploads', folder);

	/** @type {{ url: string, alt_text: string }[]} */
	const storedPhotos = [];

	try {
		if (photos.length > 0) {
			await mkdir(uploadFolder, { recursive: true });

			for (const [index, photo] of photos.entries()) {
				const extension = PHOTO_EXTENSIONS[photo.type];
				const filename = `${index + 1}.${extension}`;

				await writeFile(join(uploadFolder, filename), new Uint8Array(await photo.arrayBuffer()));

				storedPhotos.push({
					url: `/uploads/${folder}/${filename}`,
					alt_text: `${values.name} — photo ${index + 1}`
				});
			}
		}

		const submission = CreatePendingRestaurant({
			name: values.name,
			description: values.description || null,
			price_tier: priceTier,
			avg_spend_min: spend.min,
			avg_spend_max: spend.max,
			currency: 'EUR',
			editorial_rating: rating,
			phone: values.phone || null,
			street_address: parsedAddress.street,
			postcode: parsedAddress.postcode,
			neighborhood: parsedLocation.neighborhood,
			city: parsedLocation.city,
			latitude,
			longitude,
			tags: values.tags,
			photos: storedPhotos
		});

		return { ok: true, name: values.name, slug: submission.slug };
	} catch (error) {
		if (photos.length > 0) {
			await rm(uploadFolder, { recursive: true, force: true }).catch(() => {});
		}

		console.error('Failed to save restaurant submission', error);
		return {
			ok: false,
			status: 500,
			errors: { form: 'We could not save your restaurant. Please try again.' },
			values
		};
	}
}

/**
 * @param {FormData} form
 * @param {string} key
 * @returns {string}
 */
function text(form, key) {
	const value = form.get(key);
	return typeof value === 'string' ? value.trim() : '';
}

/**
 * @param {FormData} form
 * @returns {string[]}
 */
function uniqueTags(form) {
	/** @type {Set<string>} */
	const seen = new Set();
	/** @type {string[]} */
	const tags = [];

	for (const entry of form.getAll('tags')) {
		if (typeof entry !== 'string') continue;

		const tag = entry.trim().replace(/\s+/g, ' ');
		const key = tag.toLowerCase();
		if (!tag || seen.has(key)) continue;

		seen.add(key);
		tags.push(tag);
	}

	return tags;
}

/**
 * Split "Neighbourhood, City" as shown on the form.
 * @param {string} location
 * @returns {{ neighborhood: string, city: string }}
 */
function parseLocation(location) {
	const separator = location.indexOf(',');

	if (separator === -1) {
		return { neighborhood: location, city: 'London' };
	}

	return {
		neighborhood: location.slice(0, separator).trim(),
		city: location.slice(separator + 1).trim() || 'London'
	};
}

/**
 * Split "4 Redchurch Street, E1 6JL" into its street and UK postcode.
 * @param {string} address
 * @returns {{ street: string, postcode: string | null }}
 */
function parseAddress(address) {
	const match = address.match(/(?:^|,\s*|\s+)([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i);

	if (!match || match.index === undefined) {
		return { street: address, postcode: null };
	}

	const street = address
		.slice(0, match.index)
		.replace(/[,\s]+$/, '')
		.trim();

	return {
		street: street || address,
		postcode: match[1].toUpperCase().replace(/\s+/g, ' ')
	};
}
