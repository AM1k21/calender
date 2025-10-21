<script lang="ts">
	import { formatFullDateForDisplay } from '$lib/utils';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let filterRoomId = $state('');
	let filterCompany = $state('');
	let filterDate = $state('');
	let deleteConfirmId = $state<string | null>(null);
	
	let filteredReservations = $derived(() => {
		let result = [...data.reservations];
		
		if (filterRoomId) {
			result = result.filter(r => r.roomId === filterRoomId);
		}
		
		if (filterCompany) {
			result = result.filter(r => 
				r.company.toLowerCase().includes(filterCompany.toLowerCase())
			);
		}
		
		if (filterDate) {
			result = result.filter(r => r.date === filterDate);
		}
		
		return result.sort((a, b) => {
			const dateCompare = b.date.localeCompare(a.date);
			if (dateCompare !== 0) return dateCompare;
			return b.startTime.localeCompare(a.startTime);
		});
	});
	
	function confirmDelete(id: string) {
		deleteConfirmId = id;
	}
	
	function cancelDelete() {
		deleteConfirmId = null;
	}
</script>

<div class="container">
	<header class="admin-header">
		<div>
			<h1>Admin Dashboard</h1>
			<p class="text-secondary">Manage all meeting room reservations</p>
		</div>
		<form method="POST" action="?/logout" use:enhance>
			<button type="submit" class="btn btn-secondary">Logout</button>
		</form>
	</header>
	
	{#if data.error}
		<div class="alert alert-error">
			{data.error}
		</div>
	{/if}
	
	<!-- Filters -->
	<div class="filters-card card mb-lg">
		<h2>Filters</h2>
		<div class="filters-grid">
			<div class="form-group">
				<label for="filterRoom">Room</label>
				<select id="filterRoom" bind:value={filterRoomId}>
					<option value="">All Rooms</option>
					{#each data.rooms as room}
						<option value={room.id}>{room.name}</option>
					{/each}
				</select>
			</div>
			
			<div class="form-group">
				<label for="filterCompany">Company</label>
				<input
					type="text"
					id="filterCompany"
					bind:value={filterCompany}
					placeholder="Filter by company"
				/>
			</div>
			
			<div class="form-group">
				<label for="filterDate">Date</label>
				<input
					type="date"
					id="filterDate"
					bind:value={filterDate}
				/>
			</div>
			
			<div class="form-group" style="display: flex; align-items: flex-end;">
				<button
					type="button"
					class="btn btn-secondary"
					onclick={() => {
						filterRoomId = '';
						filterCompany = '';
						filterDate = '';
					}}
				>
					Clear Filters
				</button>
			</div>
		</div>
	</div>
	
	<!-- Reservations Table -->
	<div class="card">
		<h2>All Reservations ({filteredReservations().length})</h2>
		
		{#if filteredReservations().length === 0}
			<p class="text-secondary text-center" style="padding: var(--spacing-xl);">
				No reservations found.
			</p>
		{:else}
			<div class="table-container">
				<table class="table">
					<thead>
						<tr>
							<th>Room</th>
							<th>Date</th>
							<th>Time</th>
							<th>Reserved By</th>
							<th>Company</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredReservations() as reservation (reservation.id)}
							<tr>
								<td>
									<span class="font-medium">{reservation.roomName}</span>
								</td>
								<td>
									{formatFullDateForDisplay(reservation.date)}
								</td>
								<td>
									<span class="font-medium">
										{reservation.startTime} - {reservation.endTime}
									</span>
								</td>
								<td>{reservation.reservedBy}</td>
								<td>{reservation.company}</td>
								<td class="text-sm text-secondary">
									{new Date(reservation.createdAt).toLocaleString()}
								</td>
								<td>
									<div class="action-buttons">
										{#if deleteConfirmId === reservation.id}
											<div class="confirm-delete">
												<span class="text-sm">Confirm?</span>
												<form method="POST" action="?/delete" use:enhance>
													<input type="hidden" name="id" value={reservation.id} />
													<button type="submit" class="btn btn-danger btn-sm">
														Yes, Delete
													</button>
												</form>
												<button
													type="button"
													class="btn btn-secondary btn-sm"
													onclick={cancelDelete}
												>
													Cancel
												</button>
											</div>
										{:else}
											<button
												type="button"
												class="btn btn-danger btn-sm"
												onclick={() => confirmDelete(reservation.id)}
											>
												Delete
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-2xl);
	}
	
	.text-secondary {
		color: var(--color-text-secondary);
	}
	
	.filters-card h2 {
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-lg);
	}
	
	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}
	
	.table-container {
		overflow-x: auto;
		margin-top: var(--spacing-lg);
	}
	
	.action-buttons {
		display: flex;
		gap: var(--spacing-sm);
	}
	
	.confirm-delete {
		display: flex;
		gap: var(--spacing-xs);
		align-items: center;
	}
	
	.text-center {
		text-align: center;
	}
	
	@media (max-width: 768px) {
		.admin-header {
			flex-direction: column;
			gap: var(--spacing-md);
			align-items: flex-start;
		}
		
		.filters-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
