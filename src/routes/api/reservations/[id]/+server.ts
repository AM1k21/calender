// API endpoints for managing individual reservations (update and delete)

import { json } from '@sveltejs/kit';
import { getReservationById, updateReservation, deleteReservation, getAllReservations } from '$lib/server/sheets';
import { validateReservationDate, validateReservationTimes, isTimeSlotAvailable } from '$lib/utils';
import type { ApiResponse } from '$lib/types';

// Get a specific reservation
export async function GET({ params }: { params: { id: string } }) {
	try {
		const reservation = await getReservationById(params.id);
		
		if (!reservation) {
			return json<ApiResponse>({
				success: false,
				error: 'Reservation not found'
			}, { status: 404 });
		}
		
		return json<ApiResponse>({
			success: true,
			data: reservation
		});
	} catch (error) {
		console.error('Error fetching reservation:', error);
		return json<ApiResponse>({
			success: false,
			error: 'Failed to fetch reservation'
		}, { status: 500 });
	}
}

// Update a reservation (admin only)
export async function PUT({ params, request }: { params: { id: string }; request: Request }) {
	try {
		const data = await request.json();
		
		// Validate if provided
		if (data.date) {
			const dateValidation = validateReservationDate(data.date);
			if (!dateValidation.valid) {
				return json<ApiResponse>({
					success: false,
					error: dateValidation.error
				}, { status: 400 });
			}
		}
		
		if (data.startTime && data.endTime) {
			const timeValidation = validateReservationTimes(data.startTime, data.endTime);
			if (!timeValidation.valid) {
				return json<ApiResponse>({
					success: false,
					error: timeValidation.error
				}, { status: 400 });
			}
		}
		
		// Check for conflicts if time or room is being changed
		if (data.date || data.startTime || data.endTime || data.roomId) {
			const existingReservation = await getReservationById(params.id);
			if (!existingReservation) {
				return json<ApiResponse>({
					success: false,
					error: 'Reservation not found'
				}, { status: 404 });
			}
			
			const allReservations = await getAllReservations();
			const isAvailable = isTimeSlotAvailable(
				data.roomId || existingReservation.roomId,
				data.date || existingReservation.date,
				data.startTime || existingReservation.startTime,
				data.endTime || existingReservation.endTime,
				allReservations,
				params.id // Exclude current reservation from conflict check
			);
			
			if (!isAvailable) {
				return json<ApiResponse>({
					success: false,
					error: 'This time slot is already reserved. Please select a different time.'
				}, { status: 409 });
			}
		}
		
		const updatedReservation = await updateReservation(params.id, data);
		
		return json<ApiResponse>({
			success: true,
			data: updatedReservation,
			message: 'Reservation updated successfully'
		});
	} catch (error) {
		console.error('Error updating reservation:', error);
		return json<ApiResponse>({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update reservation'
		}, { status: 500 });
	}
}

// Delete a reservation (admin only)
export async function DELETE({ params }: { params: { id: string } }) {
	try {
		await deleteReservation(params.id);
		
		return json<ApiResponse>({
			success: true,
			message: 'Reservation deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting reservation:', error);
		return json<ApiResponse>({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete reservation'
		}, { status: 500 });
	}
}
