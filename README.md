# Meeting Room Reservation System 🏢

A modern, free, and easy-to-use meeting room reservation system built with SvelteKit and Google Sheets. Perfect for small offices with shared meeting spaces between multiple companies.

## 🌟 Features

### Public Features
- **Visual Calendar View** - Week-by-week calendar showing all 4 meeting rooms
- **Real-time Availability** - Color-coded slots (Green = Available, Red = Occupied)
- **Easy Reservations** - Click any available slot to reserve
- **Minute-level Precision** - Book exact start and end times
- **No Authentication Required** - Simple form with name and company
- **Responsive Design** - Works on desktop, tablet, and mobile

### Admin Features
- **Password-Protected Dashboard** - Secure admin panel
- **Full Reservation Management** - View all reservations with complete details
- **Advanced Filtering** - Filter by room, company, or date
- **Delete Reservations** - Remove bookings with confirmation
- **Export to Google Sheets** - All data automatically saved

### Technical Features
- **Zero Cost** - Free hosting on Vercel, free database with Google Sheets
- **No Subscription Fees** - Completely free to run
- **Automatic Conflict Prevention** - System prevents double-booking
- **Secure** - Service account authentication, no public write access
- **Fast & Reliable** - Server-side rendering with SvelteKit
- **Scalable** - Handles 30+ users easily

## 🎨 Design

Clean, modern interface using Královéhradecký kraj brand colors:
- Primary brand blue: `#0066cc`
- Gray-scale design with minimal borders
- Square, professional aesthetics
- Inspired by [datakhk.cz](https://www.datakhk.cz/)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Google Account
- Vercel Account (free)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Google Cloud & Sheets**
   - Follow the detailed guide in [SETUP.md](./SETUP.md)
   - Enable Google Sheets API
   - Create service account
   - Create and share Google Sheet

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Run locally**
   ```bash
   pnpm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel
   ```

📖 **Full setup instructions:** See [SETUP.md](./SETUP.md)

## 📁 Project Structure

```
reservation/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── ReservationModal.svelte    # Reservation form modal
│   │   ├── server/
│   │   │   ├── sheets.ts                  # Google Sheets integration
│   │   │   └── auth.ts                    # Admin authentication
│   │   ├── constants.ts                   # Rooms, companies config
│   │   ├── types.ts                       # TypeScript types
│   │   └── utils.ts                       # Helper functions
│   ├── routes/
│   │   ├── +layout.svelte                 # Main layout with nav
│   │   ├── +page.svelte                   # Calendar view
│   │   ├── +page.server.ts                # Load reservations
│   │   ├── admin/
│   │   │   ├── +page.svelte               # Admin dashboard
│   │   │   ├── +page.server.ts            # Admin logic
│   │   │   └── login/
│   │   │       ├── +page.svelte           # Login form
│   │   │       └── +page.server.ts        # Auth logic
│   │   └── api/
│   │       └── reservations/
│   │           ├── +server.ts             # Create/list API
│   │           └── [id]/+server.ts        # Update/delete API
│   ├── app.css                            # Global styles
│   └── app.html                           # HTML template
├── .env.example                           # Environment template
├── SETUP.md                               # Detailed setup guide
├── package.json
└── svelte.config.js
```

## 🔧 Configuration

### Customize Rooms

Edit `src/lib/constants.ts`:

```typescript
export const ROOMS: Room[] = [
	{ id: 'room-1', name: 'Your Room Name 1', description: 'Description' },
	{ id: 'room-2', name: 'Your Room Name 2', description: 'Description' },
	// Add or remove rooms as needed
];
```

### Customize Companies

```typescript
export const COMPANIES = ['Your Company A', 'Your Company B'] as const;
```

### Customize Working Hours

```typescript
export const WORKING_HOURS = {
	START_HOUR: 8,        // Start at 8 AM
	END_HOUR: 20,         // End at 8 PM
	INTERVAL_MINUTES: 30  // 30-minute time slots
} as const;
```

## 🖥️ Usage

### For Regular Users

1. **View Calendar** - Visit homepage to see all 4 rooms and availability
2. **Make Reservation** - Click green slot, fill form, submit
3. **Limits** - Min 15 min, Max 8 hours, Book up to 1 year ahead

### For Administrators

1. **Login** - Visit `/admin` with password
2. **View All** - See complete reservation details
3. **Manage** - Filter and delete reservations
4. **Logout** - Session expires after 8 hours

## 🛠️ Tech Stack

- **Frontend:** Svelte 5, SvelteKit 2
- **Styling:** Custom CSS (no Tailwind)
- **Backend:** SvelteKit Server Routes
- **Database:** Google Sheets API
- **Hosting:** Vercel
- **Language:** TypeScript

## 📱 Browser Support

Chrome, Firefox, Safari, Edge (latest), Mobile browsers

## 🐛 Troubleshooting

See [SETUP.md - Troubleshooting](./SETUP.md#troubleshooting) section.

## 📄 License

Provided as-is for use in your organization.

---

**Made with ❤️ using SvelteKit and Google Sheets**

For detailed setup instructions, see [SETUP.md](./SETUP.md)
