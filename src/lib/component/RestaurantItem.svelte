<script>
	import { MAX_PRICE_TIER, clampPriceTier, currencySymbol } from '#lib/format.js';

	/**
	 * @type {{
	 *   restaurant: import('#lib/types.js').Restaurant,
	 *   rank: number,
	 *   topPick?: boolean,
	 *   active?: boolean,
	 *   onSelect?: ((restaurant: import('#lib/types.js').Restaurant) => void) | null
	 * }}
	 */
	let { restaurant, rank, topPick = false, active = false, onSelect = null } = $props();

	let meta = $derived.by(() => {
		const parts = [];

		if (restaurant.tagline) parts.push(restaurant.tagline);
		if (restaurant.neighborhood) parts.push(restaurant.neighborhood);

		return parts.join(' · ');
	});

	let priceTier = $derived(clampPriceTier(restaurant.price_tier));
	let symbol = $derived(currencySymbol(restaurant.currency ?? 'GBP'));
</script>

<li class={['item', { 'top-pick': topPick, active }]}>
	<button class="row" type="button" aria-pressed={active} onclick={() => onSelect?.(restaurant)}>
		<span class="rank">{rank}</span>

		{#if restaurant.cover_url}
			<img class="thumb" src={restaurant.cover_url} alt="" loading="lazy" width="36" height="36" />
		{:else}
			<span class="thumb" aria-hidden="true"></span>
		{/if}

		<span class="info">
			<span class="name">{restaurant.name}</span>
			<span class="meta">{meta}</span>
		</span>

		<span class="trailing">
			{#if topPick}
				<span class="top-pick-badge">Top pick</span>
			{/if}
			<span class="price" role="img" aria-label={`Price tier ${priceTier} of ${MAX_PRICE_TIER}`}>
				{#each { length: MAX_PRICE_TIER }, symbolIndex}
					<span class={{ dim: symbolIndex >= priceTier }}>{symbol}</span>
				{/each}
			</span>
		</span>
	</button>
</li>

<style>
	.item {
		border-radius: var(--radius-card);
	}

	.row {
		display: grid;
		grid-template-columns: 14px 36px minmax(0, 1fr) auto;
		align-items: center;
		gap: 0 8px;
		width: 100%;
		padding: 6px;
		border: 0;
		border-radius: inherit;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.item:hover {
		background: var(--color-row-hover);
	}

	.item.top-pick {
		margin: 1px 0 3px;
		background: var(--color-top-pick);
	}

	.item.top-pick:hover {
		background: var(--color-top-pick-hover);
	}

	.item.active {
		background: var(--color-selected);
		box-shadow: inset 0 0 0 1px var(--color-selected-border);
	}

	.item.top-pick.active {
		background: var(--color-top-pick-selected);
	}

	.row:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.rank {
		color: var(--color-rank);
		font-size: 12.5px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		text-align: center;
	}

	.thumb {
		display: block;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: var(--color-thumb);
		box-shadow: inset 0 0 0 1px rgb(0 0 0 / 4%);
		object-fit: cover;
	}

	.info {
		display: block;
		min-width: 0;
	}

	.name,
	.meta {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		color: var(--color-ink-strong);
		font-size: 12.5px;
		font-weight: 650;
		letter-spacing: -0.012em;
		line-height: 1.2;
	}

	.meta {
		margin-top: 3px;
		color: var(--color-meta);
		font-size: 10px;
		letter-spacing: -0.005em;
		line-height: 1.25;
	}

	.trailing {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 4px;
	}

	.top-pick-badge {
		padding: 2px 6px;
		border-radius: 5px;
		background: var(--color-badge);
		color: var(--color-badge-ink);
		font-size: 7.5px;
		font-weight: 700;
		letter-spacing: 0.075em;
		line-height: 1.25;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.price {
		display: flex;
		gap: 1px;
		color: var(--color-price);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.01em;
		line-height: 1;
	}

	.price .dim {
		color: var(--color-price-dim);
		font-weight: 500;
	}
</style>
