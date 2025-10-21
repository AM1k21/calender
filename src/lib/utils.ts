// Utility functions for date/time manipulation and reservation logic

import { format, parse, addDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import type { Reservation, TimeSlot } from './types';

/**
 * Generate a unique ID for reservations
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date): string {
	return format(date, 'HH:mm');
}

/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export function parseDate(dateString: string): Date {
	return parseISO(dateString);
}

/**
 * Parse time string (HH:MM) to Date object for today
 */
export function parseTime(timeString: string): Date {
	return parse(timeString, 'HH:mm', new Date());
}

/**
 * Get start of current week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
	return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

/**
 * Get end of current week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
	return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

/**
 * Generate array of dates for a week
 */
export function getWeekDates(startDate: Date): Date[] {
	const dates: Date[] = [];
	for (let i = 0; i < 7; i++) {
		dates.push(addDays(startDate, i));
	}
	return dates;
}

/**
 * Generate time slots for a day (e.g., 08:00 to 20:00 in 30-minute intervals)
 */
export function generateTimeSlots(
	startHour: number = 8,
	endHour: number = 20,
	intervalMinutes: number = 30
): string[] {
	const slots: string[] = [];
	for (let hour = startHour; hour < endHour; hour++) {
		for (let minute = 0; minute < 60; minute += intervalMinutes) {
			const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
			slots.push(time);
		}
	}
	return slots;
}

/**
 * Check if two reservations overlap
 */
export function doReservationsOverlap(
	reservation1: { date: string; startTime: string; endTime: string; roomId: string },
	reservation2: { date: string; startTime: string; endTime: string; roomId: string }
): boolean {
	// Different rooms or different dates = no overlap
	if (reservation1.roomId !== reservation2.roomId || reservation1.date !== reservation2.date) {
		return false;
	}

	// Parse times for comparison
	const start1 = parseTime(reservation1.startTime);
	const end1 = parseTime(reservation1.endTime);
	const start2 = parseTime(reservation2.startTime);
	const end2 = parseTime(reservation2.endTime);

	// Check if times overlap
	return start1 < end2 && start2 < end1;
}

/**
 * Check if a time slot is available (not occupied by any reservation)
 */
export function isTimeSlotAvailable(
	roomId: string,
	date: string,
	startTime: string,
	endTime: string,
	reservations: Reservation[],
	excludeReservationId?: string
): boolean {
	const newReservation = { roomId, date, startTime, endTime };

	return !reservations.some((reservation) => {
		// Skip the reservation we're editing (if any)
		if (excludeReservationId && reservation.id === excludeReservationId) {
			return false;
		}

		return doReservationsOverlap(newReservation, reservation);
	});
}

/**
 * Get reservations for a specific room and date
 */
export function getReservationsForRoomAndDate(
	reservations: Reservation[],
	roomId: string,
	date: string
): Reservation[] {
	return reservations.filter((r) => r.roomId === roomId && r.date === date);
}

/**
 * Validate reservation times
 */
export function validateReservationTimes(startTime: string, endTime: string): {
	valid: boolean;
	error?: string;
} {
	try {
		const start = parseTime(startTime);
		const end = parseTime(endTime);

		if (start >= end) {
			return { valid: false, error: 'End time must be after start time' };
		}

		// Check if duration is reasonable (e.g., max 8 hours)
		const durationMs = end.getTime() - start.getTime();
		const durationHours = durationMs / (1000 * 60 * 60);

		if (durationHours > 8) {
			return { valid: false, error: 'Reservation cannot exceed 8 hours' };
		}

		if (durationMs < 15 * 60 * 1000) {
			return { valid: false, error: 'Reservation must be at least 15 minutes' };
		}

		return { valid: true };
	} catch (error) {
		return { valid: false, error: 'Invalid time format' };
	}
}

/**
 * Validate reservation date
 */
export function validateReservationDate(dateString: string): {
	valid: boolean;
	error?: string;
} {
	try {
		const date = parseDate(dateString);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (date < today) {
			return { valid: false, error: 'Cannot reserve in the past' };
		}

		// Max 1 year in advance
		const maxDate = addDays(today, 365);
		if (date > maxDate) {
			return { valid: false, error: 'Cannot reserve more than 1 year in advance' };
		}

		return { valid: true };
	} catch (error) {
		return { valid: false, error: 'Invalid date format' };
	}
}

/**
 * Format date for display (e.g., "Mon, Jan 15")
 */
export function formatDateForDisplay(dateString: string): string {
	try {
		const date = parseDate(dateString);
		return format(date, 'EEE, MMM d');
	} catch {
		return dateString;
	}
}

/**
 * Format full date for display (e.g., "Monday, January 15, 2024")
 */
export function formatFullDateForDisplay(dateString: string): string {
	try {
		const date = parseDate(dateString);
		return format(date, 'EEEE, MMMM d, yyyy');
	} catch {
		return dateString;
	}
}

/**
 * Get day of week (0-6, Sunday = 0)
 */
export function getDayOfWeek(dateString: string): number {
	return parseDate(dateString).getDay();
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
	const date = parseDate(dateString);
	const today = new Date();
	return formatDate(date) === formatDate(today);
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
	return formatTime(new Date());
}

/**
 * Round time to nearest interval (e.g., round to nearest 15 minutes)
 */
export function roundTimeToInterval(time: string, intervalMinutes: number = 15): string {
	const date = parseTime(time);
	const minutes = date.getMinutes();
	const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes;
	date.setMinutes(roundedMinutes);
	date.setSeconds(0);
	return formatTime(date);
}
