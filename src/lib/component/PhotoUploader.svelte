<script>
	import { onDestroy } from 'svelte';

	const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

	/**
	 * @type {{
	 *   error?: string,
	 *   name?: string,
	 *   limit?: number,
	 *   maxMb?: number,
	 *   label?: string
	 * }}
	 */
	let { error = '', name = 'photos', limit = 3, maxMb = 15, label = 'Photography' } = $props();

	let maxBytes = $derived(maxMb * 1024 * 1024);
	/** @type {{ file: File, url: string }[]} */
	let photos = $state([]);
	let photoError = $state('');

	function clearPhotoUrls() {
		for (const photo of photos) {
			URL.revokeObjectURL(photo.url);
		}
	}

	/**
	 * @param {HTMLInputElement} input
	 * @param {string} message
	 */
	function rejectPhotos(input, message) {
		clearPhotoUrls();
		photos = [];
		input.value = '';
		photoError = message;
	}

	/** @param {Event} event */
	function handlePhotoChange(event) {
		const input = /** @type {HTMLInputElement} */ (event.currentTarget);
		const files = Array.from(input.files ?? []);

		clearPhotoUrls();
		photos = [];
		photoError = '';

		if (files.length === 0) return;

		if (files.length > limit) {
			rejectPhotos(input, `Choose up to ${limit} photos.`);
			return;
		}

		for (const file of files) {
			if (!PHOTO_TYPES.includes(file.type)) {
				rejectPhotos(input, 'Photos must be JPG, PNG or WebP files.');
				return;
			}

			if (file.size > maxBytes) {
				rejectPhotos(input, `Each photo must be ${maxMb} MB or smaller.`);
				return;
			}
		}

		photos = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
	}

	onDestroy(clearPhotoUrls);
</script>

<div class="field">
	<div class="label-row">
		<span class="label">{label}</span>
		<span class="hint">
			{photos.length === 0
				? `Up to ${limit} photos`
				: `${photos.length} photo${photos.length > 1 ? 's' : ''} ready`}
		</span>
	</div>

	<label class="upload">
		<input
			{name}
			type="file"
			accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
			multiple
			onchange={handlePhotoChange}
		/>

		{#if photos.length > 0}
			<span class="thumbs" aria-hidden="true">
				{#each photos as photo (photo.url)}
					<img src={photo.url} alt="" />
				{/each}
			</span>
			<strong>Click to change photography</strong>
		{:else}
			<svg class="upload-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6"
				></rect>
				<path
					d="m4 16 4.5-4.5 3.4 3.4 2.3-2.3L20 18"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path>
				<path d="M18.5 3v5M16 5.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
				></path>
			</svg>
			<strong>Upload high-res photography</strong>
			<span class="upload-hint">.jpg, .png, .webp · Max {maxMb}MB</span>
		{/if}
	</label>

	{#if photoError || error}
		<p class="error">{photoError || error}</p>
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

	.label {
		color: var(--color-ink);
		font-size: 12px;
		font-weight: 650;
		letter-spacing: -0.01em;
		line-height: 1.3;
	}

	.hint {
		color: var(--color-hint);
		font-size: 10px;
		font-weight: 500;
		line-height: 1.4;
	}

	.upload {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		min-height: 88px;
		padding: 10px 14px;
		border: 1px dashed #d8d4c7;
		border-radius: 12px;
		background: #fbfaf6;
		text-align: center;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease;
	}

	.upload:hover {
		border-color: #b8c4b4;
		background: #f7f8f2;
	}

	.upload input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.upload-icon {
		width: 20px;
		height: 20px;
		margin-bottom: 1px;
		color: var(--color-muted);
	}

	.upload strong {
		color: var(--color-ink);
		font-size: 11px;
		font-weight: 650;
	}

	.upload-hint {
		color: var(--color-hint);
		font-size: 10px;
	}

	.thumbs {
		display: flex;
		gap: 5px;
		margin-bottom: 3px;
	}

	.thumbs img {
		display: block;
		width: 46px;
		height: 46px;
		border: 1px solid var(--color-line);
		border-radius: 7px;
		object-fit: cover;
	}

	.upload:focus-within {
		border-color: var(--color-detail-accent);
		box-shadow: 0 0 0 3px rgb(62 107 72 / 12%);
	}

	.error {
		margin: 0;
		color: #a74b3b;
		font-size: 10.5px;
		font-weight: 500;
		line-height: 1.4;
	}
</style>
