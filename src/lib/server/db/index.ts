import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'node:path';
import { DATA_DIR } from '../paths';

const dbFile = path.join(DATA_DIR, 'reparbre.db');

export const client = createClient({ url: `file:${dbFile}` });
export const db = drizzle(client);

