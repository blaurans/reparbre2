<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children, data } = $props();

	const liens = [
		{ href: '/', label: 'Accueil' },
		{ href: '/calin', label: 'Câliner' },
		{ href: '/intentions', label: 'Intentions' },
		{ href: '/profil', label: 'Profil' }
	];

	const montreAdmin = $derived(data.estAdmin === true);
</script>

<div class="mx-auto flex min-h-screen max-w-md flex-col">
	<header class="flex items-center justify-between px-5 pt-6 pb-2">
		<a href="/" class="flex items-center gap-2">
			<span class="text-2xl">🌳</span>
			<span class="text-lg font-bold tracking-tight text-foret-100">Réparbre</span>
		</a>
		{#if data.user}
			<a href="/profil" class="flex items-center gap-2 rounded-full bg-foret-800 px-3 py-1.5">
				{#if data.user.avatarUrl}
					<img src={data.user.avatarUrl} alt="" class="h-6 w-6 rounded-full" />
				{:else}
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-foret-600 text-xs font-bold"
					>
						{data.user.name.charAt(0).toUpperCase()}
					</span>
				{/if}
				<span class="text-sm text-foret-200">{data.user.name.split(' ')[0]}</span>
			</a>
		{:else}
			<a
				href="/auth/google"
				class="rounded-full bg-foret-500 px-4 py-1.5 text-sm font-medium text-foret-950"
			>
				Se connecter
			</a>
		{/if}
	</header>

	<main class="flex-1 px-5 pb-24">
		{@render children()}
	</main>

	<nav
		class="sticky bottom-0 mx-auto flex w-full max-w-md justify-around border-t border-foret-800 bg-foret-950/95 px-2 py-2 backdrop-blur"
	>
		{#each liens as lien}
			<a
				href={lien.href}
				class="rounded-lg px-3 py-2 text-sm transition-colors {page.url.pathname === lien.href
					? 'bg-foret-800 font-semibold text-foret-100'
					: 'text-foret-300 hover:text-foret-100'}"
			>
				{lien.label}
			</a>
		{/each}
		{#if montreAdmin}
			<a
				href="/admin"
				class="rounded-lg px-3 py-2 text-sm transition-colors {page.url.pathname === '/admin'
					? 'bg-foret-800 font-semibold text-foret-100'
					: 'text-foret-300 hover:text-foret-100'}"
			>
				Admin
			</a>
		{/if}
	</nav>
</div>
