<script>
	import { tick } from 'svelte';

	const FEATURED_TAGS = ['basque', 'wine-bar', 'british', 'italian', 'wood-fired', 'bakery'];

	/**
	 * @type {{
	 *   tags: import('#lib/types.js').Tag[],
	 *   selected?: string[],
	 *   maxTags?: number,
	 *   error?: string
	 * }}
	 */
	let { tags, selected = $bindable([]), maxTags = 4, error = '' } = $props();

	/** @type {string[]} */
	let extraTags = $state([]);
	let addingTag = $state(false);
	let tagDraft = $state('');
	let tagError = $state('');
	/** @type {HTMLInputElement | undefined} */
	let tagField = $state();

	let featuredTags = $derived(
		FEATURED_TAGS.flatMap((slug) => tags.filter((tag) => tag.slug === slug))
	);

	let tagOptions = $derived.by(() => {
		/** @type {string[]} */
		const seen = [];
		/** @type {string[]} */
		const options = [];

		for (const tag of [...featuredTags.map((tag) => tag.name), ...extraTags, ...selected]) {
			const key = tag.toLowerCase();
			if (seen.includes(key)) continue;

			seen.push(key);
			options.push(tag);
		}

		return options;
	});

	/**
	 * @param {string} tag
	 * @returns {boolean}
	 */
	function isSelected(tag) {
		return selected.some((value) => value.toLowerCase() === tag.toLowerCase());
	}

	/** @param {string} tag */
	function toggleTag(tag) {
		if (isSelected(tag)) {
			selected = selected.filter((value) => value.toLowerCase() !== tag.toLowerCase());
			tagError = '';
			return;
		}

		if (selected.length >= maxTags) {
			tagError = `Select up to ${maxTags} tags.`;
			return;
		}

		selected = [...selected, tag];
		tagError = '';
	}

	async function showTagField() {
		if (selected.length >= maxTags) {
			tagError = `Select up to ${maxTags} tags.`;
			return;
		}

		addingTag = true;
		await tick();
		tagField?.focus();
	}

	function cancelTag() {
		addingTag = false;
		tagDraft = '';
		tagError = '';
	}

	function commitTag() {
		const value = tagDraft.trim().replace(/\s+/g, ' ');
		if (!value) {
			cancelTag();
			return;
		}

		if (value.length > 40) {
			tagError = 'Keep tags under 40 characters.';
			return;
		}

		const existing = tagOptions.find((tag) => tag.toLowerCase() === value.toLowerCase());
		const tag = existing ?? value;

		if (isSelected(tag)) {
			tagError = 'That tag is already selected.';
			return;
		}

		if (selected.length >= maxTags) {
			tagError = `Select up to ${maxTags} tags.`;
			return;
		}

		if (!existing) {
			extraTags = [...extraTags, value];
		}

		selected = [...selected, tag];
		tagDraft = '';
		addingTag = false;
		tagError = '';
	}

	/** @param {KeyboardEvent} event */
	function tagKeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			commitTag();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelTag();
		}
	}
</script>

<div class="field">
	<div class="label-row">
		<span class="label">Cuisine &amp; Style</span>
		<span class="hint">Select up to {maxTags} tags</span>
	</div>

	<div class="chips">
		{#each tagOptions as tag (tag)}
			{@const active = isSelected(tag)}
			<button
				class={['chip', { selected: active }]}
				type="button"
				aria-pressed={active}
				disabled={!active && selected.length >= maxTags}
				onclick={() => toggleTag(tag)}
			>
				<span>{tag}</span>
				{#if active}
					<span class="chip-remove" aria-hidden="true">
						<svg viewBox="0 0 12 12" fill="none">
							<path
								d="m3 3 6 6M9 3 3 9"
								stroke="currentColor"
								stroke-width="1.4"
								stroke-linecap="round"
							></path>
						</svg>
					</span>
				{/if}
			</button>
		{/each}

		{#if addingTag}
			<span class="tag-form">
				<input
					bind:this={tagField}
					bind:value={tagDraft}
					type="text"
					aria-label="New tag"
					placeholder="New tag"
					maxlength="40"
					onkeydown={tagKeydown}
				/>
				<button class="tag-confirm" type="button" onclick={commitTag}>Add</button>
			</span>
		{:else}
			<button
				class="chip add"
				type="button"
				disabled={selected.length >= maxTags}
				onclick={showTagField}
			>
				+ Add tag
			</button>
		{/if}
	</div>

	{#if tagError || error}
		<p class="error">{tagError || error}</p>
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

	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 7px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 30px;
		padding: 0 11px;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		background: var(--color-control);
		color: var(--color-control-ink);
		font-size: 11px;
		font-weight: 550;
		letter-spacing: -0.005em;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.chip:hover {
		background: var(--color-chip-hover);
	}

	.chip.selected {
		background: var(--color-detail-accent);
		color: #fff;
	}

	.chip.selected:hover {
		background: var(--color-detail-accent-hover);
	}

	.chip:disabled,
	.chip.add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.chip:focus-visible,
	.tag-confirm:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.chip-remove {
		display: inline-flex;
		width: 10px;
		height: 10px;
	}

	.chip-remove svg {
		width: 100%;
		height: 100%;
	}

	.chip.add {
		border: 1px dashed #cfcbbf;
		background: transparent;
		color: var(--color-detail-accent);
		font-weight: 600;
	}

	.chip.add:hover {
		background: rgb(62 107 72 / 6%);
	}

	.tag-form {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 30px;
		padding: 2px 3px 2px 9px;
		border: 1px solid var(--color-detail-accent);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
	}

	.tag-form input {
		width: 96px;
		height: 24px;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: var(--color-ink);
		font-size: 11px;
		box-shadow: none;
	}

	.tag-form input:focus {
		outline: none;
		box-shadow: none;
	}

	.tag-confirm {
		height: 24px;
		padding: 0 9px;
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--color-detail-accent);
		color: #fff;
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
	}

	.error {
		margin: 0;
		color: #a74b3b;
		font-size: 10.5px;
		font-weight: 500;
		line-height: 1.4;
	}
</style>
