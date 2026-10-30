<script>
	import { MAX_PRICE_TIER, clampPriceTier, currencySymbol } from '#lib/format.js';

	const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=';

	/**
	 * @type {{
	 *   detail: import('#lib/types.js').RestaurantDetail,
	 *   onBack?: (() => void) | null
	 * }}
	 */
	let { detail, onBack = null } = $props();

	let priceTier = $derived(clampPriceTier(detail.price_tier));
	let symbol = $derived(currencySymbol(detail.currency ?? 'GBP'));
	let directionsUrl = $derived(`${DIRECTIONS_URL}${encodeURIComponent(detail.full_address)}`);
</script>

<div class="detail">
	<header class="topbar">
		<div class="topbar-inner">
			<button class="back-link" type="button" onclick={() => onBack?.()}>
				<svg
					viewBox="0 0 20 20"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M16 10H4M8.5 5.5 4 10l4.5 4.5" />
				</svg>
				Back to all places
			</button>
		</div>
	</header>

	<div class="content">
		<div class="gallery">
			{#each detail.photos as photo (photo.url)}
				<figure class="photo">
					<img src={photo.url} alt={photo.alt_text ?? ''} />
					{#if photo.caption}
						<figcaption>{photo.caption}</figcaption>
					{/if}
				</figure>
			{/each}
		</div>

		<article class="place">
			<h1>{detail.name}</h1>

			<div class="meta">
				<div class="tags">
					{#each detail.tags as tag (tag)}
						<span class="tag">{tag}</span>
					{/each}
				</div>
				<span class="meta-dot" aria-hidden="true">·</span>
				<span class="price" role="img" aria-label={`Price tier ${priceTier} of ${MAX_PRICE_TIER}`}>
					{#each { length: MAX_PRICE_TIER }, index}
						<span class={{ dim: index >= priceTier }}>{symbol}</span>
					{/each}
				</span>

				<div class="rating">
					<svg
						class="star"
						viewBox="0 0 20 20"
						width="14"
						height="14"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							d="m10 1.8 2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.42l-4.94 2.6.94-5.51-4-3.9 5.53-.8L10 1.8Z"
						/>
					</svg>
					<strong>{detail.rating_avg.toFixed(1)}</strong>
					<span class="reviews">({detail.rating_count} reviews)</span>
				</div>
			</div>

			{#if detail.description}
				<p class="description">{detail.description}</p>
			{/if}

			<hr class="rule" />

			<div class="location">
				<svg
					class="pin"
					viewBox="0 0 24 24"
					width="17"
					height="17"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
					<circle cx="12" cy="10" r="2.4" />
				</svg>

				<div class="location-copy">
					<address>
						{detail.full_address} <span aria-hidden="true">·</span>
						{detail.neighborhood}
					</address>
					<a class="directions" href={directionsUrl} target="_blank" rel="external noreferrer">
						Get Directions
						<svg
							viewBox="0 0 20 20"
							width="12"
							height="12"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M6 14 14 6M7 6h7v7" />
						</svg>
					</a>
				</div>
			</div>
		</article>
	</div>

	<footer class="cta-bar">
		<div class="cta-inner">
			<button class="book-button" type="button">
				<svg
					viewBox="0 0 24 24"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M7 3v18M4.5 3v5.5a2.5 2.5 0 0 0 5 0V3" />
					<path d="M17.5 3c-1.5 2.4-2.3 4.8-2.3 7 0 2.1 1 3.3 2.3 3.6V21" />
				</svg>
				Book a Table
			</button>
		</div>
	</footer>
</div>

<style>
	.detail {
		--gutter: 16px;

		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		width: 100%;
		overflow-y: auto;
		overscroll-behavior: contain;
		background: var(--color-detail-canvas);
		color: var(--color-detail-ink);
		scrollbar-color: var(--color-scroll-thumb) transparent;
	}

	.topbar {
		flex: none;
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--color-detail-canvas);
		background: color-mix(in srgb, var(--color-detail-canvas) 94%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-detail-line);
	}

	.topbar-inner,
	.cta-inner {
		width: 100%;
		padding: 0 var(--gutter);
	}

	.topbar-inner {
		display: flex;
		align-items: center;
		height: 52px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 0;
		border: 0;
		border-radius: 6px;
		background: none;
		color: var(--color-detail-ink);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: -0.01em;
		cursor: pointer;
	}

	.back-link svg {
		flex: none;
	}

	.back-link:hover {
		opacity: 0.62;
	}

	.back-link:focus-visible,
	.directions:focus-visible,
	.book-button:focus-visible {
		outline: 2px solid var(--color-detail-accent);
		outline-offset: 3px;
	}

	.content {
		flex: 1 0 auto;
		width: 100%;
		padding: 14px var(--gutter) 36px;
	}

	.gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
	}

	.photo {
		position: relative;
		overflow: hidden;
		aspect-ratio: 12 / 7;
		background: var(--color-thumb);
	}

	.photo:first-child {
		grid-column: 1 / -1;
	}

	.photo img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.photo::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 58%;
		background: linear-gradient(to top, rgb(0 0 0 / 34%), transparent);
		pointer-events: none;
	}

	.photo figcaption {
		position: absolute;
		left: 11px;
		bottom: 9px;
		z-index: 1;
		color: #fff;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.005em;
		line-height: 1.25;
		text-shadow: 0 1px 3px rgb(0 0 0 / 55%);
		pointer-events: none;
	}

	.place {
		padding-top: 22px;
	}

	h1 {
		font-family: 'Gelasio', Georgia, 'Times New Roman', serif;
		font-size: clamp(28px, 7.6vw, 32px);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.025em;
		color: var(--color-detail-ink);
	}

	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 14px;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		height: 18px;
		padding: 0 8px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-pill);
		color: var(--color-chip-ink);
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 0.09em;
		line-height: 1;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.meta-dot {
		margin-left: 2px;
		color: var(--color-detail-soft);
		font-size: 12px;
		line-height: 1;
	}

	.price {
		display: flex;
		gap: 1px;
		color: var(--color-price);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.04em;
		line-height: 1;
	}

	.price .dim {
		color: var(--color-detail-dim);
		font-weight: 500;
	}

	.rating {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-left: auto;
		white-space: nowrap;
	}

	.star {
		color: var(--color-rating);
		transform: translateY(1px);
	}

	.rating strong {
		color: var(--color-ink-strong);
		font-size: 12.5px;
		font-weight: 700;
	}

	.reviews {
		color: var(--color-detail-soft);
		font-size: 10px;
	}

	.description {
		max-width: 40em;
		margin-top: 16px;
		color: var(--color-detail-muted);
		font-size: 14.5px;
		line-height: 1.7;
	}

	.rule {
		margin: 25px 0 0;
		border: 0;
		border-top: 1px solid var(--color-detail-line);
	}

	.location {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		margin-top: 14px;
	}

	.pin {
		flex: none;
		margin-top: 1px;
		color: var(--color-muted);
	}

	.location-copy {
		min-width: 0;
	}

	address {
		color: var(--color-control-ink);
		font-size: 12.5px;
		font-style: normal;
		font-weight: 500;
		line-height: 1.5;
	}

	.directions {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-top: 3px;
		color: var(--color-detail-accent);
		font-size: 12px;
		font-weight: 600;
		text-decoration: none;
		border-radius: 3px;
	}

	.directions:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.cta-bar {
		flex: none;
		position: sticky;
		bottom: 0;
		z-index: 20;
		margin-top: auto;
		background: var(--color-detail-canvas);
		background: color-mix(in srgb, var(--color-detail-canvas) 95%, transparent);
		backdrop-filter: blur(14px);
		border-top: 1px solid var(--color-detail-line);
	}

	.cta-inner {
		padding-top: 11px;
		padding-bottom: calc(11px + env(safe-area-inset-bottom));
	}

	.book-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		height: 45px;
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--color-detail-accent);
		color: #fff;
		font-size: 13.5px;
		font-weight: 600;
		letter-spacing: 0.005em;
		cursor: pointer;
		transition:
			background 160ms ease,
			transform 160ms ease;
	}

	.book-button:hover {
		background: var(--color-detail-accent-hover);
	}

	.book-button:active {
		transform: scale(0.995);
	}

	@media (min-width: 600px) {
		.detail {
			--gutter: 20px;
		}

		.content {
			padding-top: 18px;
		}

		.topbar-inner {
			height: 58px;
		}

		.place {
			padding-top: 26px;
		}

		.photo figcaption {
			left: 13px;
			bottom: 11px;
			font-size: 12px;
		}

		.description {
			font-size: 15px;
		}

		.cta-inner {
			padding-top: 13px;
			padding-bottom: calc(13px + env(safe-area-inset-bottom));
		}

		.book-button {
			height: 48px;
			font-size: 14px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.book-button {
			transition: none;
		}
	}
</style>
