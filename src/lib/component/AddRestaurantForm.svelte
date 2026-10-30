<script>
	import { enhance } from '$app/forms';
	import PriceTierPicker from '#lib/component/PriceTierPicker.svelte';
	import PhotoUploader from '#lib/component/PhotoUploader.svelte';
	import RatingInput from '#lib/component/RatingInput.svelte';
	import TagPicker from '#lib/component/TagPicker.svelte';

	/**
	 * @typedef {object} AddRestaurantValues
	 * @property {string} [name]
	 * @property {string} [location]
	 * @property {string} [address]
	 * @property {string} [phone]
	 * @property {string} [price_tier]
	 * @property {string} [editorial_rating]
	 * @property {string} [description]
	 * @property {string} [latitude]
	 * @property {string} [longitude]
	 * @property {string[]} [tags]
	 */

	/**
	 * @type {{
	 *   tags: import('#lib/types.js').Tag[],
	 *   actionData?: {
	 *     errors?: Record<string, string>,
	 *     values?: AddRestaurantValues
	 *   } | null,
	 *   position?: import('#lib/types.js').MapCenter | null,
	 *   onclose: () => void
	 * }}
	 */
	let { tags, actionData = null, position = null, onclose } = $props();

	// The form values restore a failed submit; they are intentionally a one-time snapshot.
	// svelte-ignore state_referenced_locally
	const initial = actionData?.values;

	let name = $state(initial?.name ?? '');
	let location = $state(initial?.location ?? '');
	let address = $state(initial?.address ?? '');
	let phone = $state(initial?.phone ?? '');
	let priceTier = $state(Number(initial?.price_tier) || 3);
	let rating = $state(initial?.editorial_rating ?? '');
	let description = $state(initial?.description ?? '');
	/** @type {string[]} */
	let selectedTags = $state(initial?.tags ?? []);

	let errors = $derived(actionData?.errors ?? {});
	let submitting = $state(false);

	/** @type {import('$app/forms').SubmitFunction} */
	function handleSubmit() {
		submitting = true;

		return async ({ update }) => {
			submitting = false;
			await update();
		};
	}
</script>

<form
	class="form"
	method="POST"
	enctype="multipart/form-data"
	use:enhance={handleSubmit}
	aria-label="Add your restaurant"
>
	<div class="body">
		{#if errors.form}
			<p class="alert" role="alert">{errors.form}</p>
		{/if}

		<div class="field">
			<label for="name">Restaurant Name <span class="required">*</span></label>

			<div class="name-wrap">
				<input
					id="name"
					name="name"
					type="text"
					bind:value={name}
					placeholder="Brat Clodagh & Co."
					autocomplete="organization"
					maxlength="120"
					required
					aria-invalid={errors.name ? 'true' : undefined}
					aria-describedby={errors.name ? 'name-error' : undefined}
				/>

				<svg class="verified" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.5"></circle>
					<path
						d="m8.7 12.2 2.2 2.2 4.4-4.8"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					></path>
				</svg>
			</div>

			{#if errors.name}
				<p class="error" id="name-error">{errors.name}</p>
			{/if}
		</div>

		<TagPicker {tags} bind:selected={selectedTags} error={errors.tags} />

		{#each selectedTags as tag (tag)}
			<input type="hidden" name="tags" value={tag} />
		{/each}

		<div class="row">
			<div class="field">
				<label for="location">Neighborhood &amp; City</label>
				<input
					id="location"
					name="location"
					type="text"
					bind:value={location}
					placeholder="Shoreditch, London"
					autocomplete="address-level2"
					maxlength="120"
					required
					aria-invalid={errors.location ? 'true' : undefined}
					aria-describedby={errors.location ? 'location-error' : undefined}
				/>
				{#if errors.location}
					<p class="error" id="location-error">{errors.location}</p>
				{/if}
			</div>

			<div class="field">
				<label for="address">Street Address</label>
				<input
					id="address"
					name="address"
					type="text"
					bind:value={address}
					placeholder="4 Redchurch Street, E1 6JL"
					autocomplete="street-address"
					maxlength="160"
					required
					aria-invalid={errors.address ? 'true' : undefined}
					aria-describedby={errors.address ? 'address-error' : undefined}
				/>
				{#if errors.address}
					<p class="error" id="address-error">{errors.address}</p>
				{/if}
			</div>
		</div>

		<div class="field">
			<div class="label-row">
				<span class="label">Restaurant Position <span class="required">*</span></span>
				{#if position}
					<span class="coords">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
				{/if}
			</div>

			<div class="position-card" class:missing={!position}>
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M12 21s6.2-5.4 6.2-10.2a6.2 6.2 0 1 0-12.4 0C5.8 15.6 12 21 12 21Z"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linejoin="round"
					></path>
					<circle cx="12" cy="10.6" r="2.2" fill="currentColor"></circle>
				</svg>

				<div class="position-copy">
					<strong>{position ? 'Pinned on the map' : 'No position selected'}</strong>
					<span>
						{position
							? 'Click anywhere on the map to move the pin.'
							: 'Click the map to place the restaurant.'}
					</span>
				</div>
			</div>

			{#if errors.position}
				<p class="error" id="position-error">{errors.position}</p>
			{/if}

			<input type="hidden" name="latitude" value={position?.lat ?? ''} />
			<input type="hidden" name="longitude" value={position?.lng ?? ''} />
		</div>

		<div class="field">
			<label for="phone">Phone Number</label>
			<input
				id="phone"
				name="phone"
				type="tel"
				bind:value={phone}
				placeholder="+44 20 215 2150"
				autocomplete="tel"
				maxlength="40"
				aria-invalid={errors.phone ? 'true' : undefined}
				aria-describedby={errors.phone ? 'phone-error' : undefined}
			/>
			{#if errors.phone}
				<p class="error" id="phone-error">{errors.phone}</p>
			{/if}
		</div>

		<PriceTierPicker bind:tier={priceTier} error={errors.price_tier} />

		<RatingInput bind:value={rating} error={errors.editorial_rating} />

		<div class="field">
			<label for="description">Culinary Concept &amp; Heritage</label>
			<textarea
				id="description"
				name="description"
				bind:value={description}
				rows="3"
				maxlength="2000"
				placeholder="Open wood-fired grills pairing Cornish seafood with northern Basque country culinary traditions."
				aria-invalid={errors.description ? 'true' : undefined}
				aria-describedby={errors.description ? 'description-error' : undefined}></textarea>
			{#if errors.description}
				<p class="error" id="description-error">{errors.description}</p>
			{/if}
		</div>

		<PhotoUploader error={errors.photos} />
	</div>

	<footer class="footer">
		<button class="button cancel" type="button" onclick={onclose}>Cancel</button>
		<button class="button publish" type="submit" disabled={submitting}>
			{#if submitting}
				Publishing…
			{:else}
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.5"></circle>
					<path
						d="m8.5 12.2 2.3 2.3 4.7-5"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					></path>
				</svg>
				Publish Restaurant
			{/if}
		</button>
	</footer>
</form>

<style>
	.form {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	.body {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 15px;
		min-height: 0;
		padding: 16px 18px 22px;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-color: var(--color-scroll-thumb) transparent;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.row .field {
		gap: 5px;
	}

	label,
	.label {
		color: var(--color-ink);
		font-size: 12px;
		font-weight: 650;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.label-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
	}

	.coords {
		color: var(--color-hint);
		font-size: 9.5px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.position-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border: 1px solid var(--color-line-soft);
		border-radius: 12px;
		background: #fbfaf6;
	}

	.position-card.missing {
		border-style: dashed;
		border-color: #d8d4c7;
	}

	.position-card svg {
		flex: none;
		width: 22px;
		height: 22px;
		color: var(--color-detail-accent);
	}

	.position-copy {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.position-copy strong {
		color: var(--color-ink);
		font-size: 11px;
		font-weight: 650;
	}

	.position-copy span {
		color: var(--color-hint);
		font-size: 10.5px;
		line-height: 1.4;
	}

	.required {
		color: var(--color-detail-accent);
	}

	.name-wrap {
		position: relative;
	}

	.name-wrap input {
		padding-right: 38px;
	}

	.verified {
		position: absolute;
		top: 50%;
		right: 13px;
		width: 17px;
		height: 17px;
		color: var(--color-detail-accent);
		transform: translateY(-50%);
		pointer-events: none;
	}

	input[type='text'],
	input[type='tel'],
	textarea {
		width: 100%;
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

	input[type='text'],
	input[type='tel'] {
		height: 38px;
	}

	textarea {
		padding: 10px 14px;
		border-radius: 14px;
		resize: vertical;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--color-placeholder);
		opacity: 1;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-detail-accent);
		box-shadow: 0 0 0 3px rgb(62 107 72 / 12%);
	}

	input[aria-invalid='true'],
	textarea[aria-invalid='true'] {
		border-color: #c98577;
	}

	.error {
		margin: 0;
		color: #a74b3b;
		font-size: 10.5px;
		font-weight: 500;
		line-height: 1.4;
	}

	.alert {
		padding: 9px 11px;
		border: 1px solid #f0d2ca;
		border-radius: 10px;
		background: #fbf0ed;
		color: #8d3b2f;
		font-size: 11px;
		line-height: 1.45;
	}

	.footer {
		flex: none;
		display: grid;
		grid-template-columns: 1fr 1.75fr;
		gap: 9px;
		padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
		border-top: 1px solid var(--color-line);
		background: var(--color-canvas);
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		height: 42px;
		border-radius: var(--radius-pill);
		font-size: 12.5px;
		font-weight: 600;
		letter-spacing: -0.005em;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.button.cancel {
		border: 1px solid var(--color-line);
		background: var(--color-surface);
		color: var(--color-ink);
	}

	.button.cancel:hover {
		background: var(--color-control-hover);
	}

	.button.publish {
		border: 0;
		background: var(--color-detail-accent);
		color: #fff;
	}

	.button.publish:hover {
		background: var(--color-detail-accent-hover);
	}

	.button.publish:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.button svg {
		width: 17px;
		height: 17px;
	}

	@media (max-width: 700px) {
		.body {
			padding-right: 16px;
			padding-left: 16px;
		}

		.footer {
			padding-right: 16px;
			padding-left: 16px;
		}
	}

	@media (max-width: 400px) {
		.row {
			grid-template-columns: 1fr;
		}
	}
</style>
