/**
 * Shared data shapes. This file only contains JSDoc types.
 */

/**
 * @typedef {object} MapCenter
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {object} MapMarker
 * @property {number} id
 * @property {number} lat
 * @property {number} lng
 * @property {string} label
 */

/**
 * @typedef {object} Restaurant
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {string | null} tagline
 * @property {string | null} description
 * @property {number} price_tier
 * @property {string} currency
 * @property {number} rating_avg
 * @property {number} rating_count
 * @property {string} street_address
 * @property {string | null} postcode
 * @property {string} full_address
 * @property {string} neighborhood
 * @property {string} city
 * @property {number | null} rank
 * @property {'ranked' | 'want_to_try' | null} list_status
 * @property {'published' | 'pending'} listing_status
 * @property {number | null} latitude
 * @property {number | null} longitude
 * @property {string | null} cover_url
 * @property {string[]} cuisines
 */

/**
 * @typedef {object} Tag
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {'cuisine' | 'style'} kind
 */

/**
 * @typedef {object} RestaurantPhoto
 * @property {string} url
 * @property {string | null} caption
 * @property {string | null} alt_text
 */

/**
 * Values collected by the "Add your restaurant" form.
 * @typedef {object} NewRestaurantSubmission
 * @property {string} name
 * @property {string | null} description
 * @property {number} price_tier
 * @property {number | null} avg_spend_min
 * @property {number | null} avg_spend_max
 * @property {string} currency
 * @property {number | null} editorial_rating
 * @property {string | null} phone
 * @property {string} street_address
 * @property {string | null} postcode
 * @property {string} neighborhood
 * @property {string} city
 * @property {number} latitude
 * @property {number} longitude
 * @property {string[]} tags
 * @property {{ url: string, alt_text: string }[]} photos
 */

/**
 * A restaurant plus the extra data only needed by the detail panel.
 * @typedef {Restaurant & { tags: string[], photos: RestaurantPhoto[] }} RestaurantDetail
 */

/**
 * @typedef {object} CuisineGroup
 * @property {string} name
 * @property {Restaurant[]} items
 */

/**
 * @typedef {object} RestaurantList
 * @property {string} id
 * @property {string} label
 * @property {string | null} badge
 * @property {CuisineGroup[]} cuisines
 */

/**
 * @typedef {'all' | 'name' | 'address' | 'not-found'} SearchMode
 */

/**
 * @typedef {object} SearchInfo
 * @property {SearchMode} mode
 * @property {MapCenter | null} center
 * @property {number} radiusKm
 * @property {string} city
 */

export {};
