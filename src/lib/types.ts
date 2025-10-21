// Core data types for the meeting room reservation system

export interface Reservation {
	id: string;
	roomId: string;
	roomName: string;
	date: string; // YYYY-MM-DD format
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
	reservedBy: string; // Person's name
	company: string; // Company name
	createdAt: string; // ISO 8601 timestamp
}

export interface Room {
	id: string;
	name: string;
	description?: string;
}

export interface TimeSlot {
	time: string; // HH:MM format
	isAvailable: boolean;
	reservation?: Reservation;
}

export interface DaySchedule {
	date: string; // YYYY-MM-DD format
	rooms: RoomSchedule[];
}

export interface RoomSchedule {
	room: Room;
	timeSlots: TimeSlot[];
}

export interface ReservationFormData {
	roomId: string;
	roomName: string;
	date: string;
	startTime: string;
	endTime: string;
	reservedBy: string;
	company: string;
}

export interface CalendarView {
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	days: DaySchedule[];
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// Admin specific types
export interface AdminSession {
	isAuthenticated: boolean;
	expiresAt?: number;
}

export interface ReservationFilter {
	roomId?: string;
	date?: string;
	company?: string;
	startDate?: string;
	endDate?: string;
}

// Google Sheets row structure
export interface SheetRow {
	reservationId: string;
	roomId: string;
	roomName: string;
	date: string;
	startTime: string;
	endTime: string;
	reservedBy: string;
	company: string;
	createdAt: string;
}
