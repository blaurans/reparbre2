<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let nom = $state('');
	let espece = $state('');
	let lat = $state('');
	let lng = $state('');
	let adresse = $state('');
	let description = $state('');
	let photoUrl = $state('');

	function resetForm() {
		nom = '';
		espece = '';
		lat = '';
		lng = '';
		adresse = '';
		description = '';
		photoUrl = '';
	}
</script>

<div class="space-y-8">
	<header>
		<h1 class="text-2xl font-bold text-foret-100">Administration</h1>
		<p class="mt-1 text-sm text-foret-300">Gère les arbres et le choix de la semaine.</p>
	</header>

	<!-- Choix de l'arbre de la semaine -->
	<section class="rounded-2xl bg-foret-900 p-5">
		<h2 class="font-semibold text-foret-100">Arbre de la semaine</h2>
		<p class="mt-1 text-sm text-foret-400">
			{#if data.arbreSemaineId}
				Arbre choisi :
				{data.arbres.find((a) => a.id === data.arbreSemaineId)?.name ?? 'inconnu'}
			{:else}
				Aucun arbre choisi pour la semaine du {data.week}.
			{/if}
		</p>

		<form method="POST" action="?/choisir" use:enhance class="mt-4 space-y-3">
			<select
				name="treeId"
				required
				class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 outline-none focus:ring-2 focus:ring-foret-500"
			>
				<option value="">— Choisir un arbre —</option>
				{#each data.arbres as arbre (arbre.id)}
					<option value={arbre.id}>{arbre.name} ({arbre.species})</option>
				{/each}
			</select>
			<button
				type="submit"
				class="w-full rounded-xl bg-foret-500 py-3 font-semibold text-foret-950 transition hover:bg-foret-400"
			>
				Désigner arbre de la semaine
			</button>
		</form>
	</section>

	<!-- Ajouter un arbre -->
	<section class="rounded-2xl bg-foret-900 p-5">
		<h2 class="font-semibold text-foret-100">Ajouter un arbre</h2>
		<form method="POST" action="?/creer" use:enhance class="mt-4 space-y-3">
			<input
				type="text"
				name="name"
				bind:value={nom}
				placeholder="Nom de l'arbre (ex : Le Chêne de la Liberté)"
				required
				class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
			/>
			<input
				type="text"
				name="species"
				bind:value={espece}
				placeholder="Espèce (ex : Chêne pédonculé)"
				required
				class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
			/>
			<div class="grid grid-cols-2 gap-3">
				<input
					type="number"
					step="any"
					name="lat"
					bind:value={lat}
					placeholder="Latitude"
					required
					class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
				/>
				<input
					type="number"
					step="any"
					name="lng"
					bind:value={lng}
					placeholder="Longitude"
					required
					class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
				/>
			</div>
			<input
				type="text"
				name="address"
				bind:value={adresse}
				placeholder="Adresse (facultatif)"
				class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
			/>
			<textarea
				name="description"
				bind:value={description}
				placeholder="Description (facultatif)"
				rows="3"
				class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
			></textarea>
			<button
				type="submit"
				class="w-full rounded-xl bg-foret-500 py-3 font-semibold text-foret-950 transition hover:bg-foret-400"
			>
				Ajouter l'arbre
			</button>
		</form>
	</section>

	<!-- Liste des arbres -->
	<section class="space-y-3">
		<h2 class="font-semibold text-foret-100">Les arbres</h2>
		{#each data.arbres as arbre (arbre.id)}
			<div class="rounded-2xl bg-foret-900 p-4">
				<p class="font-medium text-foret-100">{arbre.name}</p>
				<p class="text-xs text-foret-400">
					{arbre.species}
					{#if arbre.address}
						· {arbre.address}
					{/if}
				</p>
			</div>
		{:else}
			<p class="text-sm text-foret-400">Aucun arbre pour l'instant.</p>
		{/each}
	</section>
</div>
