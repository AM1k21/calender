<script lang="ts">
	import { COMPANIES } from '$lib/constants';
	import { validateReservationDate, validateReservationTimes } from '$lib/utils';
	import type { ApiResponse } from '$lib/types';
	
	interface Props {
		roomId: string;
		roomName: string;
		initialDate: string;
		initialTime: string;
		onClose: () => void;
	}
	
	let { roomId, roomName, initialDate, initialTime, onClose }: Props = $props();
	
	let formData = $state({
		date: initialDate,
		startTime: initialTime,
		endTime: '',
		reservedBy: '',
		company: ''
	});
	
	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);
	let successMessage = $state('');
	let errorMessage = $state('');
	
	function validateForm(): boolean {
		errors = {};
		
		if (!formData.reservedBy.trim()) {
			errors.reservedBy = 'Name is required';
		}
		
		if (!formData.company.trim()) {
			errors.company = 'Company is required';
		}
		
		if (!formData.date) {
			errors.date = 'Date is required';
		} else {
			const dateValidation = validateReservationDate(formData.date);
			if (!dateValidation.valid) {
				errors.date = dateValidation.error || 'Invalid date';
			}
		}
		
		if (!formData.startTime) {
			errors.startTime = 'Start time is required';
		}
		
		if (!formData.endTime) {
			errors.endTime = 'End time is required';
		}
		
		if (formData.startTime && formData.endTime) {
			const timeValidation = validateReservationTimes(formData.startTime, formData.endTime);
			if (!timeValidation.valid) {
				errors.endTime = timeValidation.error || 'Invalid time range';
			}
		}
		
		return Object.keys(errors).length === 0;
	}
	
	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';
		successMessage = '';
		
		if (!validateForm()) {
			return;
		}
		
		isSubmitting = true;
		
		try {
			const response = await fetch('/api/reservations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					roomId,
					roomName,
					...formData
				})
			});
			
			const result: ApiResponse = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to create reservation');
			}
			
			successMessage = 'Reservation created successfully!';
			
			// Close modal after a short delay
			setTimeout(() => {
				window.location.reload(); // Refresh to show new reservation
			}, 1500);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
	
	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<div class="modal-overlay" onclick={handleOverlayClick}>
	<div class="modal">
		<div class="modal-header">
			<h2>Reserve {roomName}</h2>
			<button class="close-button" onclick={onClose} aria-label="Close">×</button>
		</div>
		
		<form class="modal-body" onsubmit={handleSubmit}>
			{#if successMessage}
				<div class="alert alert-success">
					{successMessage}
				</div>
			{/if}
			
			{#if errorMessage}
				<div class="alert alert-error">
					{errorMessage}
				</div>
			{/if}
			
			<div class="form-group">
				<label for="reservedBy">Your Name *</label>
				<input
					type="text"
					id="reservedBy"
					bind:value={formData.reservedBy}
					class:input-error={errors.reservedBy}
					placeholder="Enter your full name"
					required
				/>
				{#if errors.reservedBy}
					<p class="error-message">{errors.reservedBy}</p>
				{/if}
			</div>
			
			<div class="form-group">
				<label for="company">Company *</label>
				<select
					id="company"
					bind:value={formData.company}
					class:input-error={errors.company}
					required
				>
					<option value="">Select your company</option>
					{#each COMPANIES as company}
						<option value={company}>{company}</option>
					{/each}
				</select>
				{#if errors.company}
					<p class="error-message">{errors.company}</p>
				{/if}
			</div>
			
			<div class="form-group">
				<label for="date">Date *</label>
				<input
					type="date"
					id="date"
					bind:value={formData.date}
					class:input-error={errors.date}
					required
				/>
				{#if errors.date}
					<p class="error-message">{errors.date}</p>
				{/if}
			</div>
			
			<div class="form-row">
				<div class="form-group">
					<label for="startTime">Start Time *</label>
					<input
						type="time"
						id="startTime"
						bind:value={formData.startTime}
						class:input-error={errors.startTime}
						step="60"
						required
					/>
					{#if errors.startTime}
						<p class="error-message">{errors.startTime}</p>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="endTime">End Time *</label>
					<input
						type="time"
						id="endTime"
						bind:value={formData.endTime}
						class:input-error={errors.endTime}
						step="60"
						required
					/>
					{#if errors.endTime}
						<p class="error-message">{errors.endTime}</p>
					{/if}
				</div>
			</div>
			
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" onclick={onClose} disabled={isSubmitting}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
					{#if isSubmitting}
						<span class="spinner"></span>
						Creating...
					{:else}
						Create Reservation
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition: color var(--transition-fast);
		padding: 0;
		width: 2rem;
		height: 2rem;
	}
	
	.close-button:hover {
		color: var(--color-text-primary);
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.modal-header h2 {
		margin: 0;
	}
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}
	
	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
