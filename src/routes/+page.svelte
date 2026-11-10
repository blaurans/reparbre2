<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let lat = $state<number | null>(null);
	let lng = $state<number | null>(null);
	let gpsError = $state<string | null>(null);
	let gpsReady = $state(false);
	let timerS = $state(0);
	let hugEnCours = $state(false);
	let hugId = $state<string | null>(null);

	function formatTemps(s: number): string {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		if (!navigator.geolocation) {
			gpsError = "La géolocalisation n'est pas disponible sur cet appareil.";
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				lat = pos.coords.latitude;
				lng = pos.coords.longitude;
				gpsReady = true;
			},
			() => {
				gpsError = "Impossible d'obtenir ta position. Vérifie que la géolocalisation est activée.";
			},
			{ enableHighAccuracy: true, timeout: 10_000 }
		);
	});
</script>

<div class="space-y-6">
	<section class="rounded-3xl bg-foret-900 p-6 text-center shadow-lg">
		<div class="mb-3 text-6xl">🌳</div>
		<h1 class="text-2xl font-bold text-foret-100">Réparbre</h1>
		<p class="mt-2 text-sm text-foret-300">
			Se réparer en câlinant les arbres. Cette semaine, on honore :
		</p>
		{#if data.arbre}
			<p class="mt-3 text-xl font-semibold text-foret-200">{data.arbre.name}</p>
			<p class="text-sm text-foret-400">{data.arbre.species}</p>
		{:else}
			<p class="mt-3 text-foret-300">Aucun arbre choisi pour l'instant.</p>
		{/if}
	</section>

	<section class="grid grid-cols-2 gap-3">
		<div class="rounded-2xl bg-foret-900 p-4 text-center">
			<p class="text-3xl font-bold text-soleil">{data.mesPoints}</p>
			<p class="text-xs text-foret-300">mes points cette semaine</p>
		</div>
		<div class="rounded-2xl bg-foret-900 p-4 text-center">
			<p class="text-3xl font-bold text-foret-200">{data.totalHugs}</p>
			<p class="text-xs text-foret-300">câlins donnés à l'arbre</p>
		</div>
	</section>

	{#if form?.erreur}
		<p class="rounded-xl bg-red-950 p-3 text-center text-sm text-red-300">{form.erreur}</p>
	{/if}

	{#if data.user}
		<form
			method="POST"
			action="?/commencer"
			use:enhance
			class="rounded-2xl bg-foret-900 p-6 text-center"
		>
			<input type="hidden" name="lat" value={lat ?? ''} />
			<input type="hidden" name="lng" value={lng ?? ''} />
			<button
				type="submit"
				class="w-full rounded-2xl bg-foret-500 py-4 font-semibold text-foret-950 transition hover:bg-foret-400"
				disabled={!gpsReady}
			>
				Câliner l'arbre 🤗
			</button>
		</form>
	{:else}
		<a
			href="/auth/google"
			class="block rounded-2xl bg-foret-500 py-4 text-center font-semibold text-foret-950 transition hover:bg-foret-400"
		>
			Se connecter avec Google
		</a>
	{/if}
</div>
