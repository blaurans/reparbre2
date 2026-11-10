import { randomBytes, createHash } from 'node:crypto';
import { Google } from 'arctic';
import { env } from '$env/dynamic/private';

let client: Google | null = null;

export function getGoogleClient(): Google {
	if (!client) {
		const clientId = env.GOOGLE_CLIENT_ID;
		const clientSecret = env.GOOGLE_CLIENT_SECRET;
		const redirectUri =
			env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';
		if (!clientId || !clientSecret) {
			throw new Error(
				'GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET doivent être définis dans .env'
			);
		}
		client = new Google(clientId, clientSecret, redirectUri);
	}
	return client;
}
