import { fail } from '@sveltejs/kit';
import { SubmitRestaurant } from '#lib/server/addRestaurant.js';
import { GetTags } from '#lib/server/database.js';
import { getPageData } from '#lib/server/restaurants.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url }) => {
	try {
		const data = await getPageData(url.searchParams.get('q') ?? '');
		return { ...data, addRestaurantTags: GetTags() };
	} catch (error) {
		console.error('Erreur dans load:', error);
		throw error;
	}
};

export const actions = {
	default: async ({ request }) => {
		const result = await SubmitRestaurant(await request.formData());

		if (result.ok) {
			return { success: true, name: result.name, slug: result.slug };
		}

		return fail(result.status, { errors: result.errors, values: result.values });
	}
};
