<script>
	import RestaurantItem from '#lib/component/RestaurantItem.svelte';

	/**
	 * @type {{
	 *   lists: import('#lib/types.js').RestaurantList[],
	 *   selectedId?: number | null,
	 *   onSelect?: ((restaurant: import('#lib/types.js').Restaurant) => void) | null
	 * }}
	 */
	let { lists, selectedId = null, onSelect = null } = $props(); 

	let activeIndex = $state(0);
	let cuisineIndex = $state(0);

	let activeListIndex = $derived(activeIndex < lists.length ? activeIndex : 0);
	let activeList = $derived(lists[activeListIndex] ?? null);
	let activeCuisineIndex = $derived(
		activeList && cuisineIndex < activeList.cuisines.length ? cuisineIndex : 0
	);
	let activeCuisine = $derived(activeList?.cuisines[activeCuisineIndex] ?? null);
	let items = $derived(activeCuisine?.items ?? []);

	/**
	 * @param {number} index
	 */
	function selectList(index) {
		activeIndex = index;
		cuisineIndex = 0;
	}

	/**
	 * @param {number} index
	 */
	function selectCuisine(index) {
		cuisineIndex = index;
	}
</script>

<div class="list-section">
	<div class="switch" role="group" aria-label="Restaurant lists">
		{#each lists as list, index (list.id)}
			<button
				class={['tab', { active: activeListIndex === index }]}
				type="button"
				aria-pressed={activeListIndex === index}
				onclick={() => selectList(index)}
			>
				{list.label}
				{#if list.badge}
					<span class="beta" aria-hidden="true">{list.badge}</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if activeList}
		<div class="filters" role="group" aria-label="Filter by cuisine">
			{#each activeList.cuisines as group, index (group.name)}
				<button
					class={['chip', { active: activeCuisineIndex === index }]}
					type="button"
					aria-pressed={activeCuisineIndex === index}
					onclick={() => selectCuisine(index)}
				>
					{group.name}
				</button>
			{/each}
		</div>
	{/if}

	<ul class="list">
		{#each items as restaurant, index (restaurant.id)}
			<RestaurantItem
				{restaurant}
				rank={activeList?.id === 'ranked' ? (restaurant.rank ?? index + 1) : index + 1}
				topPick={activeList?.id === 'ranked' && restaurant.rank === 1}
				active={restaurant.id === selectedId}
				{onSelect}
			/>
		{:else}
			<li class="empty">No tables to show here yet.</li>
		{/each}
	</ul>
</div>

<style>
	.list-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.switch {
		display: flex;
		align-items: center;
		gap: 16px;
		padding-bottom: 9px;
		border-bottom: 1px solid var(--color-line);
	}

	.tab {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-tab);
		font-size: 11.5px;
		font-weight: 550;
		cursor: pointer;
	}

	.tab.active {
		color: var(--color-ink-strong);
		font-weight: 650;
	}

	.beta {
		display: inline-grid;
		place-items: center;
		min-width: 12px;
		height: 12px;
		padding: 0 3px;
		border: 1px solid var(--color-beta-border);
		border-radius: 3px;
		color: var(--color-beta);
		font-size: 7px;
		font-weight: 600;
		line-height: 1;
		transform: translateY(-1px);
	}

	.filters {
		display: flex;
		flex: none;
		gap: 5px;
		margin: 10px -12px 4px;
		padding: 0 12px 2px;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.filters::-webkit-scrollbar {
		display: none;
	}

	.chip {
		flex: none;
		height: 22px;
		padding: 0 9px;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		background: var(--color-chip);
		color: var(--color-chip-ink);
		font-size: 10.5px;
		font-weight: 550;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.chip:hover {
		background: var(--color-chip-hover);
	}

	.chip.active {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.chip.active:hover {
		background: var(--color-accent-hover);
	}

	.chip:focus-visible,
	.tab:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.list {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 1px;
		min-height: 0;
		margin: 4px -6px 0;
		padding: 0 0 8px;
		overflow-y: auto;
		list-style: none;
		scrollbar-color: var(--color-scroll-thumb) transparent;
		scrollbar-width: thin;
	}

	.list::-webkit-scrollbar {
		width: 5px;
	}

	.list::-webkit-scrollbar-thumb {
		border-radius: var(--radius-pill);
		background: var(--color-scroll-thumb);
	}

	.empty {
		padding: 24px 8px;
		color: var(--color-hint);
		font-size: 11px;
		text-align: center;
	}
</style>
