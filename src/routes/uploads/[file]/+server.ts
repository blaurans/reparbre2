import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '$lib/server/paths';

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp'
};

/** Sert les photos uploadées depuis DATA_DIR/uploads/ */
export const GET = async ({ params }) => {
	const filename = params.file;

	// Sécurité : refuser les traversals de chemin et extensions non autorisées
	if (!filename || filename.includes('..') || filename.includes('/')) {
		error(400, 'Nom de fichier invalide');
	}

	const ext = path.extname(filename).toLowerCase();
	if (!MIME_TYPES[ext]) {
		error(400, 'Format non supporté');
	}

	const filepath = path.join(DATA_DIR, 'uploads', filename);

	// Double vérification : le fichier résolu doit rester dans uploads/
	if (!filepath.startsWith(path.join(DATA_DIR, 'uploads'))) {
		error(400, 'Nom de fichier invalide');
	}

	if (!fs.existsSync(filepath)) {
		error(404, 'Photo introuvable');
	}

	const content = fs.readFileSync(filepath);
	return new Response(new Uint8Array(content), {
		headers: {
			'Content-Type': MIME_TYPES[ext],
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
