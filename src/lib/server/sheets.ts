// Google Sheets service for managing reservations
// This runs on the server only and handles all Google Sheets API interactions

import { google } from 'googleapis';
import { env } from '$env/dynamic/private';
import type { Reservation, SheetRow } from '$lib/types';
import { generateId } from '$lib/utils';

const SHEET_NAME = 'Reservations';

/**
 * Get authenticated Google Sheets client
 */
function getGoogleSheetsClient() {
	const auth = new google.auth.GoogleAuth({
		credentials: {
			client_email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
			private_key: env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
		},
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	});

	return google.sheets({ version: 'v4', auth });
}

/**
 * Convert sheet row to Reservation object
 */
function rowToReservation(row: string[]): Reservation | null {
	if (!row || row.length < 9) return null;

	return {
		id: row[0],
		roomId: row[1],
		roomName: row[2],
		date: row[3],
		startTime: row[4],
		endTime: row[5],
		reservedBy: row[6],
		company: row[7],
		createdAt: row[8]
	};
}

/**
 * Convert Reservation object to sheet row
 */
function reservationToRow(reservation: Reservation): string[] {
	return [
		reservation.id,
		reservation.roomId,
		reservation.roomName,
		reservation.date,
		reservation.startTime,
		reservation.endTime,
		reservation.reservedBy,
		reservation.company,
		reservation.createdAt
	];
}

/**
 * Initialize the Google Sheet with headers if it doesn't exist
 */
export async function initializeSheet(): Promise<void> {
	try {
		const sheets = getGoogleSheetsClient();

		// Check if sheet exists
		const spreadsheet = await sheets.spreadsheets.get({
			spreadsheetId: env.GOOGLE_SHEET_ID
		});

		const sheetExists = spreadsheet.data.sheets?.some(
			(sheet) => sheet.properties?.title === SHEET_NAME
		);

		if (!sheetExists) {
			// Create the sheet
			await sheets.spreadsheets.batchUpdate({
				spreadsheetId: env.GOOGLE_SHEET_ID,
				requestBody: {
					requests: [
						{
							addSheet: {
								properties: {
									title: SHEET_NAME
								}
							}
						}
					]
				}
			});
		}

		// Check if headers exist
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			range: `${SHEET_NAME}!A1:I1`
		});

		if (!response.data.values || response.data.values.length === 0) {
			// Add headers
			await sheets.spreadsheets.values.update({
				spreadsheetId: env.GOOGLE_SHEET_ID,
				range: `${SHEET_NAME}!A1:I1`,
				valueInputOption: 'RAW',
				requestBody: {
					values: [[
						'Reservation ID',
						'Room ID',
						'Room Name',
						'Date',
						'Start Time',
						'End Time',
						'Reserved By',
						'Company',
						'Created At'
					]]
				}
			});
		}
	} catch (error) {
		console.error('Error initializing sheet:', error);
		throw new Error('Failed to initialize Google Sheet');
	}
}

/**
 * Get all reservations from the sheet
 */
export async function getAllReservations(): Promise<Reservation[]> {
	try {
		const sheets = getGoogleSheetsClient();

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			range: `${SHEET_NAME}!A2:I` // Skip header row
		});

		if (!response.data.values) {
			return [];
		}

		return response.data.values
			.map(rowToReservation)
			.filter((r): r is Reservation => r !== null);
	} catch (error) {
		console.error('Error fetching reservations:', error);
		throw new Error('Failed to fetch reservations from Google Sheets');
	}
}

/**
 * Get a single reservation by ID
 */
export async function getReservationById(id: string): Promise<Reservation | null> {
	const reservations = await getAllReservations();
	return reservations.find((r) => r.id === id) || null;
}

/**
 * Create a new reservation
 */
export async function createReservation(
	reservation: Omit<Reservation, 'id' | 'createdAt'>
): Promise<Reservation> {
	try {
		const sheets = getGoogleSheetsClient();

		const newReservation: Reservation = {
			...reservation,
			id: generateId(),
			createdAt: new Date().toISOString()
		};

		await sheets.spreadsheets.values.append({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			range: `${SHEET_NAME}!A:I`,
			valueInputOption: 'RAW',
			requestBody: {
				values: [reservationToRow(newReservation)]
			}
		});

		return newReservation;
	} catch (error) {
		console.error('Error creating reservation:', error);
		throw new Error('Failed to create reservation in Google Sheets');
	}
}

/**
 * Update an existing reservation
 */
export async function updateReservation(
	id: string,
	updates: Partial<Omit<Reservation, 'id' | 'createdAt'>>
): Promise<Reservation> {
	try {
		const sheets = getGoogleSheetsClient();

		// Get all reservations to find the row number
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			range: `${SHEET_NAME}!A2:I`
		});

		if (!response.data.values) {
			throw new Error('Reservation not found');
		}

		const rowIndex = response.data.values.findIndex((row) => row[0] === id);

		if (rowIndex === -1) {
			throw new Error('Reservation not found');
		}

		const existingReservation = rowToReservation(response.data.values[rowIndex]);
		if (!existingReservation) {
			throw new Error('Invalid reservation data');
		}

		const updatedReservation: Reservation = {
			...existingReservation,
			...updates
		};

		// Update the row (rowIndex + 2 because we skip header and arrays are 0-indexed)
		const rowNumber = rowIndex + 2;
		await sheets.spreadsheets.values.update({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			range: `${SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
			valueInputOption: 'RAW',
			requestBody: {
				values: [reservationToRow(updatedReservation)]
			}
		});

		return updatedReservation;
	} catch (error) {
		console.error('Error updating reservation:', error);
		throw new Error('Failed to update reservation in Google Sheets');
	}
}

/**
 * Delete a reservation
 */
export async function deleteReservation(id: string): Promise<void> {
	try {
		const sheets = getGoogleSheetsClient();

		// Get all reservations to find the row number
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			range: `${SHEET_NAME}!A2:I`
		});

		if (!response.data.values) {
			throw new Error('Reservation not found');
		}

		const rowIndex = response.data.values.findIndex((row) => row[0] === id);

		if (rowIndex === -1) {
			throw new Error('Reservation not found');
		}

		// Get sheet ID
		const spreadsheet = await sheets.spreadsheets.get({
			spreadsheetId: env.GOOGLE_SHEET_ID
		});

		const sheet = spreadsheet.data.sheets?.find(
			(s) => s.properties?.title === SHEET_NAME
		);

		if (!sheet || !sheet.properties?.sheetId) {
			throw new Error('Sheet not found');
		}

		// Delete the row (rowIndex + 1 because we skip header)
		const rowNumber = rowIndex + 1;
		await sheets.spreadsheets.batchUpdate({
			spreadsheetId: env.GOOGLE_SHEET_ID,
			requestBody: {
				requests: [
					{
						deleteDimension: {
							range: {
								sheetId: sheet.properties.sheetId,
								dimension: 'ROWS',
								startIndex: rowNumber,
								endIndex: rowNumber + 1
							}
						}
					}
				]
			}
		});
	} catch (error) {
		console.error('Error deleting reservation:', error);
		throw new Error('Failed to delete reservation from Google Sheets');
	}
}

/**
 * Get reservations filtered by criteria
 */
export async function getFilteredReservations(filters: {
	roomId?: string;
	date?: string;
	company?: string;
	startDate?: string;
	endDate?: string;
}): Promise<Reservation[]> {
	let reservations = await getAllReservations();

	if (filters.roomId) {
		reservations = reservations.filter((r) => r.roomId === filters.roomId);
	}

	if (filters.date) {
		reservations = reservations.filter((r) => r.date === filters.date);
	}

	if (filters.company) {
		reservations = reservations.filter((r) => 
			r.company.toLowerCase().includes(filters.company!.toLowerCase())
		);
	}

	if (filters.startDate) {
		reservations = reservations.filter((r) => r.date >= filters.startDate!);
	}

	if (filters.endDate) {
		reservations = reservations.filter((r) => r.date <= filters.endDate!);
	}

	// Sort by date and time
	return reservations.sort((a, b) => {
		const dateCompare = a.date.localeCompare(b.date);
		if (dateCompare !== 0) return dateCompare;
		return a.startTime.localeCompare(b.startTime);
	});
}
