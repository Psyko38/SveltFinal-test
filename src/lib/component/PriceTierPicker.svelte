<script>
	const AVERAGE_SPEND = [
		{ min: 15, max: 30 },
		{ min: 30, max: 45 },
		{ min: 45, max: 80 },
		{ min: 80, max: 130 }
	];

	/** @type {{ tier?: number, error?: string }} */
	let { tier = $bindable(3), error = '' } = $props();

	let spend = $derived(AVERAGE_SPEND[tier - 1] ?? AVERAGE_SPEND[2]);
</script>

<div class="field">
	<span class="label" id="price-tier-label">Price Tier</span>

	<div class="tiers" role="group" aria-labelledby="price-tier-label">
		{#each [1, 2, 3, 4] as value (value)}
			<button
				class={['tier', { selected: tier === value }]}
				type="button"
				aria-pressed={tier === value}
				aria-label={`Price tier ${value} of 4`}
				onclick={() => (tier = value)}
			>
				{'€'.repeat(value)}
			</button>
		{/each}
	</div>

	<input type="hidden" name="price_tier" value={tier} />

	<p class="hint">Average spend: €{spend.min} – €{spend.max} per person with wine</p>

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.label {
		color: var(--color-ink);
		font-size: 12px;
		font-weight: 650;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.tiers {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 7px;
	}

	.tier {
		height: 36px;
		border: 1px solid var(--color-line-soft);
		border-radius: var(--radius-pill);
		background: var(--color-control);
		color: var(--color-control-ink);
		font-size: 11px;
		font-weight: 550;
		letter-spacing: 0.03em;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.tier:hover {
		background: var(--color-control-hover);
	}

	.tier:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.tier.selected {
		border-color: var(--color-detail-accent);
		background: #eaf0e7;
		box-shadow: inset 0 0 0 1px var(--color-detail-accent);
		color: var(--color-detail-accent);
		font-weight: 700;
	}

	.hint {
		margin: 0;
		color: var(--color-hint);
		font-size: 10px;
		font-weight: 500;
		line-height: 1.4;
	}

	.error {
		margin: 0;
		color: #a74b3b;
		font-size: 10.5px;
		font-weight: 500;
		line-height: 1.4;
	}
</style>
