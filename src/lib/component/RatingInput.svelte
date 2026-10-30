<script>
	/** @type {{ value?: string, error?: string }} */
	let { value = $bindable(''), error = '' } = $props();

	let rating = $derived(Math.min(5, Math.max(0, Number(value) || 0)));
	let filledStars = $derived(Math.floor(rating));

	/** @param {number} star */
	function setRating(star) {
		value = String(star);
	}
</script>

<div class="field">
	<div class="label-row">
		<label for="editorial_rating">Editorial Grade / Rating</label>

		<div class="stars">
			{#each [1, 2, 3, 4, 5] as star (star)}
				<button
					class="star"
					class:filled={filledStars >= star}
					type="button"
					aria-label={`Set rating to ${star} out of 5`}
					aria-pressed={filledStars >= star}
					onclick={() => setRating(star)}
				>
					<svg viewBox="0 0 20 20" aria-hidden="true">
						<path
							d="m10 1.8 2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.42l-4.94 2.6.94-5.51-4-3.9 5.53-.8L10 1.8Z"
						></path>
					</svg>
				</button>
			{/each}
		</div>
	</div>

	<input
		id="editorial_rating"
		name="editorial_rating"
		type="number"
		min="0"
		max="5"
		step="0.1"
		{value}
		oninput={(event) => (value = event.currentTarget.value)}
		placeholder="4.8"
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? 'rating-error' : undefined}
	/>

	{#if error}
		<p class="error" id="rating-error">{error}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.label-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
	}

	label {
		color: var(--color-ink);
		font-size: 12px;
		font-weight: 650;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.stars {
		display: flex;
		gap: 1px;
		margin: -2px 0;
	}

	.star {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		padding: 0;
		border: 0;
		background: none;
		color: #cfc3a8;
		cursor: pointer;
		transition: color 0.15s ease;
	}

	.star:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.star svg {
		width: 15px;
		height: 15px;
		fill: transparent;
		stroke: currentColor;
		stroke-width: 1.3;
		stroke-linejoin: round;
	}

	.star.filled {
		color: var(--color-rating);
	}

	.star.filled svg {
		fill: currentColor;
		stroke: currentColor;
	}

	.star:hover {
		color: var(--color-rating);
	}

	input {
		width: 100%;
		height: 38px;
		min-width: 0;
		padding: 0 14px;
		border: 1px solid var(--color-line-soft);
		border-radius: var(--radius-pill);
		background: var(--color-control);
		color: var(--color-ink);
		font-size: 12.5px;
		line-height: 1.3;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	input::placeholder {
		color: var(--color-placeholder);
		opacity: 1;
	}

	input:focus {
		outline: none;
		border-color: var(--color-detail-accent);
		box-shadow: 0 0 0 3px rgb(62 107 72 / 12%);
	}

	input[aria-invalid='true'] {
		border-color: #c98577;
	}

	.error {
		margin: 0;
		color: #a74b3b;
		font-size: 10.5px;
		font-weight: 500;
		line-height: 1.4;
	}
</style>
