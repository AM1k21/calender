<script lang="ts">
	import { formatDateForDisplay, getReservationsForRoomAndDate } from '$lib/utils';
	import type { PageData } from './$types';
	import ReservationModal from '$lib/components/ReservationModal.svelte';
	
	let { data }: { data: PageData } = $props();
	
	let activeRoomId = $state(data.rooms[0]?.id || 'room-1');
	let showModal = $state(false);
	let selectedSlot = $state<{
		roomId: string;
		roomName: string;
		date: string;
		time: string;
	} | null>(null);
	
	let activeRoom = $derived(data.rooms.find(r => r.id === activeRoomId) || data.rooms[0]);
	
	function switchRoom(roomId: string) {
		activeRoomId = roomId;
	}
	
	function openReservationModal(roomId: string, roomName: string, date: string, time: string) {
		selectedSlot = { roomId, roomName, date, time };
		showModal = true;
	}
	
	function closeModal() {
		showModal = false;
		selectedSlot = null;
	}
	
	function checkAvailability(roomId: string, date: string, time: string): boolean {
		const roomReservations = getReservationsForRoomAndDate(data.reservations, roomId, date);
		
		return !roomReservations.some(reservation => {
			const slotTime = time;
			return slotTime >= reservation.startTime && slotTime < reservation.endTime;
		});
	}
	
	function getReservationForSlot(roomId: string, date: string, time: string) {
		const roomReservations = getReservationsForRoomAndDate(data.reservations, roomId, date);
		
		return roomReservations.find(reservation => {
			return time >= reservation.startTime && time < reservation.endTime;
		});
	}
	
	function getTimeSlotsForDate(roomId: string, date: string) {
		const roomReservations = getReservationsForRoomAndDate(data.reservations, roomId, date);
		const slots: Array<{
			startTime: string;
			endTime: string;
			isAvailable: boolean;
			reservation?: any;
		}> = [];
		
		const workStart = '08:00';
		const workEnd = '18:00';
		
		// Sort reservations by start time
		const sortedReservations = [...roomReservations].sort((a, b) => 
			a.startTime.localeCompare(b.startTime)
		);
		
		let currentTime = workStart;
		
		for (const reservation of sortedReservations) {
			// Add available slot before this reservation
			if (currentTime < reservation.startTime) {
				slots.push({
					startTime: currentTime,
					endTime: reservation.startTime,
					isAvailable: true
				});
			}
			
			// Add occupied slot
			slots.push({
				startTime: reservation.startTime,
				endTime: reservation.endTime,
				isAvailable: false,
				reservation
			});
			
			currentTime = reservation.endTime;
		}
		
		// Add remaining available time
		if (currentTime < workEnd) {
			slots.push({
				startTime: currentTime,
				endTime: workEnd,
				isAvailable: true
			});
		}
		
		return slots;
	}
	
	function calculateSlotHeight(startTime: string, endTime: string): number {
		const [startHour, startMin] = startTime.split(':').map(Number);
		const [endHour, endMin] = endTime.split(':').map(Number);
		
		const startMinutes = startHour * 60 + startMin;
		const endMinutes = endHour * 60 + endMin;
		const durationMinutes = endMinutes - startMinutes;
		
		// Each minute = 1.8px (more stretched)
		return durationMinutes * 1.8;
	}
</script>

<div class="container">
	<header class="page-header">
		<h1>Meeting Room Reservations</h1>
		<p class="text-secondary">Select a time slot to make a reservation</p>
	</header>
	
	{#if data.error}
		<div class="alert alert-error">
			{data.error}
		</div>
	{/if}
	
	<div class="calendar-container">
		<!-- Room Tabs -->
		<div class="room-tabs">
			{#each data.rooms as room}
				<button
					class="room-tab"
					class:active={activeRoomId === room.id}
					onclick={() => switchRoom(room.id)}
				>
					<span class="room-tab-name">{room.name}</span>
					{#if room.description}
						<span class="room-tab-description">{room.description}</span>
					{/if}
				</button>
			{/each}
		</div>
		
		<!-- Legend -->
		<div class="legend">
			<div class="legend-item">
				<div class="legend-color available"></div>
				<span>Available</span>
			</div>
			<div class="legend-item">
				<div class="legend-color occupied"></div>
				<span>Occupied</span>
			</div>
		</div>
		
		<!-- Week navigation -->
		<div class="week-nav">
			<a href="?week={new Date(new Date(data.weekStart).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" class="btn btn-secondary">
				← Previous Week
			</a>
			<h2>Week of {formatDateForDisplay(data.weekStart)}</h2>
			<a href="?week={new Date(new Date(data.weekStart).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}" class="btn btn-secondary">
				Next Week →
			</a>
		</div>
		
		<!-- Calendar grid for active room -->
		<div class="calendar-grid">
			<!-- Header row with dates -->
			<div class="calendar-header">
				{#each data.dates as date}
					<div class="day-header">
						{formatDateForDisplay(date)}
					</div>
				{/each}
			</div>
			
			<!-- Timeline columns -->
			<div class="timeline-wrapper">
				{#each data.dates as date}
					{@const timeSlots = getTimeSlotsForDate(activeRoomId, date)}
					<div class="day-column">
						{#each timeSlots as slot}
							{@const height = calculateSlotHeight(slot.startTime, slot.endTime)}
							
							<button
								class="time-slot"
								class:available={slot.isAvailable}
								class:occupied={!slot.isAvailable}
								style="height: {height}px; min-height: {height}px;"
								onclick={() => {
									if (slot.isAvailable) {
										openReservationModal(activeRoomId, activeRoom.name, date, slot.startTime);
									}
								}}
								disabled={!slot.isAvailable}
								title={slot.isAvailable 
									? `${slot.startTime} - ${slot.endTime}\nClick to reserve` 
									: `${slot.startTime} - ${slot.endTime}\n${slot.reservation?.reservedBy}\n${slot.reservation?.company}`}
							>
								<div class="slot-time">{slot.startTime}</div>
								{#if !slot.isAvailable && slot.reservation}
									<div class="slot-info">
										<div class="slot-name">{slot.reservation.reservedBy}</div>
										<div class="slot-company">{slot.reservation.company}</div>
									</div>
								{/if}
								<div class="slot-time">{slot.endTime}</div>
							</button>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

{#if showModal && selectedSlot}
	<ReservationModal
		roomId={selectedSlot.roomId}
		roomName={selectedSlot.roomName}
		initialDate={selectedSlot.date}
		initialTime={selectedSlot.time}
		onClose={closeModal}
	/>
{/if}

<style>
	.page-header {
		margin-bottom: var(--spacing-2xl);
		text-align: center;
	}
	
	.text-secondary {
		color: var(--color-text-secondary);
	}
	
	.calendar-container {
		background-color: var(--color-bg-primary);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
	}
	
	/* Room Tabs */
	.room-tabs {
		display: flex;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-lg);
		border-bottom: 2px solid var(--border-color);
		overflow-x: auto;
	}
	
	.room-tab {
		flex: 1;
		min-width: 150px;
		padding: var(--spacing-md) var(--spacing-lg);
		background-color: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	
	.room-tab:hover {
		background-color: var(--color-gray-50);
	}
	
	.room-tab.active {
		border-bottom-color: var(--color-primary);
		background-color: var(--color-gray-50);
	}
	
	.room-tab-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}
	
	.room-tab.active .room-tab-name {
		color: var(--color-primary);
	}
	
	.room-tab-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
	
	/* Legend */
	.legend {
		display: flex;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
		padding: var(--spacing-md);
		background-color: var(--color-gray-50);
		border-radius: var(--border-radius-sm);
		border: var(--border-width) solid var(--border-color-light);
		justify-content: center;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
	
	.legend-color {
		width: 24px;
		height: 24px;
		border-radius: var(--border-radius-sm);
		border: var(--border-width) solid var(--border-color-light);
	}
	
	.legend-color.available {
		background-color: #d1fae5;
	}
	
	.legend-color.occupied {
		background-color: #fecaca;
	}
	
	.week-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: var(--border-width) solid var(--border-color-light);
	}
	
	.week-nav h2 {
		margin: 0;
		font-size: var(--font-size-xl);
	}
	
	.calendar-grid {
		background-color: var(--color-bg-primary);
		border: var(--border-width) solid var(--border-color-light);
		border-radius: var(--border-radius-sm);
		overflow: hidden;
	}
	
	.calendar-header {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		background-color: var(--color-gray-100);
		border-bottom: 2px solid var(--border-color);
	}
	
	.day-header {
		padding: var(--spacing-md);
		text-align: center;
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-sm);
		border-right: var(--border-width) solid var(--border-color-light);
	}
	
	.day-header:last-child {
		border-right: none;
	}
	
	.timeline-wrapper {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--spacing-md);
		min-height: 1080px;
		padding: var(--spacing-sm);
		background-color: var(--color-gray-50);
	}
	
	.day-column {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-primary);
		border-radius: var(--border-radius-sm);
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.time-slot {
		width: 100%;
		border: none;
		border-bottom: var(--border-width) solid rgba(229, 231, 235, 0.5);
		padding: var(--spacing-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		position: relative;
		text-align: center;
		overflow: hidden;
	}
	
	.time-slot.available {
		background-color: #d1fae5;
	}
	
	.time-slot.available:hover {
		background-color: #a7f3d0;
		transform: scaleY(1.01);
		z-index: 1;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.time-slot.occupied {
		background-color: #fecaca;
		cursor: not-allowed;
	}
	
	.time-slot:disabled {
		opacity: 1;
	}
	
	.slot-time {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		line-height: 1.2;
	}
	
	.slot-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) 0;
		overflow: hidden;
	}
	
	.slot-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
	
	.slot-company {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
	
	.font-medium {
		font-weight: var(--font-weight-medium);
	}
	
	@media (max-width: 1024px) {
		.room-tab {
			min-width: 120px;
			padding: var(--spacing-sm) var(--spacing-md);
		}
		
		.calendar-grid {
			overflow-x: auto;
		}
		
		.timeline-wrapper {
			gap: var(--spacing-sm);
		}
	}
	
	@media (max-width: 768px) {
		.room-tabs {
			flex-wrap: nowrap;
			overflow-x: scroll;
			-webkit-overflow-scrolling: touch;
		}
		
		.room-tab {
			min-width: 100px;
			flex: 0 0 auto;
		}
		
		.week-nav {
			flex-direction: column;
			gap: var(--spacing-md);
		}
		
		.week-nav h2 {
			order: -1;
			margin-bottom: var(--spacing-sm);
			font-size: var(--font-size-lg);
		}
		
		.calendar-header,
		.timeline-wrapper {
			grid-template-columns: repeat(7, 100px);
		}
		
		.timeline-wrapper {
			gap: var(--spacing-xs);
		}
		
		.day-header {
			font-size: var(--font-size-xs);
			padding: var(--spacing-xs);
		}
		
		.slot-time {
			font-size: 10px;
		}
		
		.slot-name {
			font-size: 10px;
		}
		
		.slot-company {
			font-size: 9px;
		}
	}
</style>
