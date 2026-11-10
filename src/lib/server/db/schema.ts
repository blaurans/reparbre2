import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

/** Les arbres qu'on peut câliner */
export const trees = sqliteTable('trees', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	species: text('species').notNull(),
	lat: real('lat').notNull(),
	lng: real('lng').notNull(),
	address: text('address'),
	description: text('description'),
	photoUrl: text('photo_url'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

/** L'arbre proposé au câlin pour une semaine donnée (lundi ISO en texte) */
export const weeklyTrees = sqliteTable(
	'weekly_trees',
	{
		id: text('id').primaryKey(),
		treeId: text('tree_id')
			.notNull()
			.references(() => trees.id),
		weekStart: text('week_start').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [uniqueIndex('weekly_trees_week_idx').on(t.weekStart)]
);

/** Utilisateurs (identifiés via Google) */
export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	googleSub: text('google_sub').notNull().unique(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	avatarUrl: text('avatar_url'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

/** Un câlin = une session complète, validée ou non */
export const hugs = sqliteTable(
	'hugs',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		treeId: text('tree_id')
			.notNull()
			.references(() => trees.id),
		weekStart: text('week_start').notNull(),
		startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
		endedAt: integer('ended_at', { mode: 'timestamp' }),
		durationS: integer('duration_s'),
		points: integer('points'),
		lat: real('lat').notNull(),
		lng: real('lng').notNull()
	},
	(t) => [
		index('hugs_user_idx').on(t.userId),
		index('hugs_week_idx').on(t.weekStart),
		index('hugs_tree_idx').on(t.treeId)
	]
);

/** Les bonnes intentions : ce qu'on veut faire de ses points */
export const intentions = sqliteTable(
	'intentions',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		text: text('text').notNull(),
		cost: integer('cost').notNull().default(10),
		status: text('status', { enum: ['planned', 'done'] }).notNull().default('planned'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		doneAt: integer('done_at', { mode: 'timestamp' })
	},
	(t) => [index('intentions_user_idx').on(t.userId)]
);

/** Sessions de connexion (token → utilisateur) */
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
