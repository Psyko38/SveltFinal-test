import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const UPLOAD_ROOT = resolve('uploads');

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const filePath = resolve(UPLOAD_ROOT, params.path);

	if (!filePath.startsWith(`${UPLOAD_ROOT}${sep}`)) {
		error(404, 'Not found');
	}

	const contentType = CONTENT_TYPES[extname(filePath).toLowerCase()];
	if (!contentType) {
		error(404, 'Not found');
	}

	try {
		const file = await readFile(filePath);

		return new Response(new Uint8Array(file), {
			headers: {
				'content-type': contentType,
				'x-content-type-options': 'nosniff',
				'cache-control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		error(404, 'Not found');
	}
}
