<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	let status = '';
	let isSending = false;
	let statusType: 'success' | 'error' | 'info' = 'info';

	async function handleSubmit() {
		isSending = true;
		status = 'Sending...';
		statusType = 'info';

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email, subject, message })
			});

			const result = await response.json();

			if (response.ok && result.success) {
				status = result.message || 'Message sent successfully!';
				statusType = 'success';
				// Optionally reset form on success
				name = '';
				email = '';
				subject = '';
				message = '';
			} else {
				status = result.message || 'An error occurred.';
				statusType = 'error';
			}
		} catch (error) {
			console.error('Error submitting contact form:', error);
			status = 'Could not reach server. Please check your connection.';
			statusType = 'error';
		} finally {
			isSending = false;
		}
	}
</script>

<div class="page-content">
	<h1>Contact</h1>
	<p>Get in touch using the form below. Alternatively, use <code>cat contact</code> for details.</p>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-group">
			<label for="name">Name:</label>
			<input type="text" id="name" bind:value={name} required disabled={isSending} />
		</div>
		<div class="form-group">
			<label for="email">Email:</label>
			<input type="email" id="email" bind:value={email} required disabled={isSending} />
		</div>
		<div class="form-group">
			<label for="subject">Subject:</label>
			<input type="text" id="subject" bind:value={subject} required disabled={isSending} />
		</div>
		<div class="form-group">
			<label for="message">Message:</label>
			<textarea id="message" rows="5" bind:value={message} required disabled={isSending}></textarea>
		</div>
		<button type="submit" disabled={isSending}>
			{#if isSending}Sending...{:else}Send Message{/if}
		</button>
	</form>

	{#if status}
		<p class="status-message {statusType}">{status}</p>
	{/if}
</div>

<style>
	.page-content {
		padding: 2rem;
	}
	.form-group {
		margin-bottom: 1rem;
	}
	label {
		display: block;
		margin-bottom: 0.25rem;
	}
	input,
	textarea {
		width: 100%;
		max-width: 500px; /* Limit width */
		background-color: rgba(255, 255, 255, 0.1); /* Keep light background for contrast */
		border: 1px solid var(--primary-color);
		color: var(--primary-color);
		padding: 0.5rem;
		font-family: inherit;
		font-size: 0.9rem;
		outline: none;
	}
	input:focus,
	textarea:focus {
		background-color: rgba(255, 255, 255, 0.2);
	}
	textarea {
		resize: vertical; /* Allow vertical resize */
	}
	button {
		background-color: var(--primary-color);
		color: var(--secondary-color);
		border: none;
		padding: 0.75rem 1.5rem;
		font-family: inherit;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			opacity 0.2s ease;
	}
	button:hover {
		/* Prevent hover effect when disabled */
		background-color: var(--primary-color);
		color: var(--secondary-color);
		border: 1px solid var(--secondary-color);
	}
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	button:disabled:hover {
		background-color: var(--primary-color); /* Keep disabled style on hover */
		color: var(--secondary-color);
		border: none;
	}
	.status-message {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid;
		border-radius: 4px;
	}
	.status-message.info {
		color: #cccccc; /* Lighter gray for info */
		border-color: #cccccc;
	}
	.status-message.success {
		color: var(--primary-color);
		border-color: var(--primary-color);
	}
	.status-message.error {
		color: var(--error-color);
		border-color: var(--error-color);
	}
	.page-content code {
		background-color: rgba(128, 128, 128, 0.2);
		padding: 0.1em 0.3em;
		border-radius: 3px;
	}
</style>
