export const MAX_PRICE_TIER = 4;

const currencySymbols = {
	GBP: '£',
	EUR: '€',
	USD: '$'
};

/**
 * @param {string} currency
 * @returns {string}
 */
export function currencySymbol(currency) {
	return currencySymbols[/** @type {'GBP' | 'EUR' | 'USD'} */ (currency)] ?? currency;
}

/**
 * @param {number | null | undefined} tier
 * @returns {number}
 */
export function clampPriceTier(tier) {
	return Math.min(Math.max(tier ?? 0, 0), MAX_PRICE_TIER);
}

/**
 * @param {number} kilometers
 * @returns {string}
 */
export function formatDistance(kilometers) {
	return `${kilometers} km`;
}
