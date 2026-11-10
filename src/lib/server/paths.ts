import path from 'node:path';
import fs from 'node:fs';

/** Dossier de données (SQLite), configurable via DATA_DIR */
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR, { recursive: true });
}
