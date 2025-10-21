# Meeting Room Reservation System - Setup Guide

Complete guide to setting up and deploying the Meeting Room Reservation System.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Google Sheets Setup](#google-sheets-setup)
4. [Local Development Setup](#local-development-setup)
5. [Environment Variables](#environment-variables)
6. [Vercel Deployment](#vercel-deployment)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- pnpm package manager installed (`npm install -g pnpm`)
- Google Account
- Vercel account (free tier)

## Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `meeting-room-reservation`
4. Click "Create"

### 2. Enable Google Sheets API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 3. Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in details:
   - Service account name: `reservation-system`
   - Service account ID: (auto-generated)
   - Description: "Service account for meeting room reservation system"
4. Click "Create and Continue"
5. Skip optional steps, click "Done"

### 4. Generate Service Account Key

1. In "Credentials" page, find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create"
7. A JSON file will download - **SAVE THIS SECURELY**

### 5. Extract Credentials from JSON

Open the downloaded JSON file. You'll need:
- `client_email` - This is your `GOOGLE_SHEETS_CLIENT_EMAIL`
- `private_key` - This is your `GOOGLE_SHEETS_PRIVATE_KEY`

## Google Sheets Setup

### 1. Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it: "Meeting Room Reservations"
4. Copy the Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
   The SHEET_ID is the long string between `/d/` and `/edit`

### 2. Share Sheet with Service Account

1. In your Google Sheet, click "Share" button
2. Paste the service account email (from JSON file: `client_email`)
3. Select "Editor" permission
4. **UNCHECK** "Notify people"
5. Click "Share"

### 3. Sheet Structure

The application will automatically create the "Reservations" sheet with these columns:
- Reservation ID
- Room ID
- Room Name
- Date
- Start Time
- End Time
- Reserved By
- Company
- Created At

**Note:** The sheet will be automatically initialized on first run.

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
cd path/to/reservation
pnpm install
```

### 2. Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` file with your credentials:

```env
# From Google Service Account JSON
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"

# The private_key from JSON - keep the quotes and newlines
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# From Google Sheet URL
GOOGLE_SHEET_ID="your-sheet-id-from-url"

# Set a strong admin password
ADMIN_PASSWORD="your-secure-password-here"
```

**Important Notes:**
- The `GOOGLE_SHEETS_PRIVATE_KEY` must include `\n` for newlines
- Keep the entire private key on one line
- Use a strong password for `ADMIN_PASSWORD`

### 4. Run Development Server

```bash
pnpm run dev
```

Visit `http://localhost:5173` to see the application.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Service account email | `service@project.iam.gserviceaccount.com` |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Private key from JSON (with \n) | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_SHEET_ID` | Google Sheet ID from URL | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `ADMIN_PASSWORD` | Admin panel password | `MySecureP@ssw0rd!` |

### Security Best Practices

- Never commit `.env` file to Git (already in `.gitignore`)
- Use different passwords for dev and production
- Rotate credentials periodically
- Use strong, unique admin password

## Vercel Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Connect to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: SvelteKit
   - Build Command: `pnpm run build`
   - Output Directory: `.svelte-kit`
   - Install Command: `pnpm install`

#### Option B: Using Vercel CLI

```bash
vercel
```

Follow the prompts to link your project.

### 3. Set Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable:

   **GOOGLE_SHEETS_CLIENT_EMAIL**
   ```
   your-service-account@project.iam.gserviceaccount.com
   ```

   **GOOGLE_SHEETS_PRIVATE_KEY**
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
   (your full private key here)
   ...
   -----END PRIVATE KEY-----
   ```
   
   **Important:** In Vercel, paste the actual key with real newlines, not `\n`

   **GOOGLE_SHEET_ID**
   ```
   1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

   **ADMIN_PASSWORD**
   ```
   YourProductionPassword123!
   ```

4. Select environments: Production, Preview, Development
5. Click "Save"

### 4. Deploy

#### Via Git Push
```bash
git add .
git commit -m "Initial deployment"
git push
```

Vercel will automatically deploy on push.

#### Via Vercel CLI
```bash
vercel --prod
```

### 5. Custom Domain (Optional)

1. In Vercel Dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

## Testing

### Test Locally

1. **Test Public Calendar:**
   - Visit `http://localhost:5173`
   - View calendar with all 4 rooms
   - Click on an available time slot
   - Fill in reservation form
   - Submit and verify reservation appears

2. **Test Admin Panel:**
   - Visit `http://localhost:5173/admin`
   - Login with your `ADMIN_PASSWORD`
   - View all reservations
   - Test filtering
   - Test deletion
   - Test logout

### Test Production

After deployment, test the same flows on your Vercel URL.

### Verify Google Sheets

1. Open your Google Sheet
2. Check that the "Reservations" tab exists
3. Verify new reservations appear in the sheet
4. Verify deletions remove rows from the sheet

## Troubleshooting

### "Failed to fetch reservations"

**Cause:** Google Sheets API authentication issue

**Solutions:**
1. Verify service account email is correct
2. Verify private key is properly formatted
3. Ensure sheet is shared with service account email
4. Check that Google Sheets API is enabled

### "Module not found" errors

**Cause:** Dependencies not installed

**Solution:**
```bash
pnpm install
```

### "Sheet not found" or 404 errors

**Cause:** Sheet ID incorrect or sheet not shared

**Solutions:**
1. Double-check `GOOGLE_SHEET_ID` in environment variables
2. Verify sheet is shared with service account
3. Ensure service account has "Editor" permission

### "Invalid password" on admin login

**Cause:** `ADMIN_PASSWORD` doesn't match

**Solutions:**
1. Verify environment variable is set correctly
2. Check for typos or extra spaces
3. Restart dev server after changing `.env`

### Build fails on Vercel

**Causes:**
- Missing environment variables
- Incorrect build configuration

**Solutions:**
1. Verify all 4 environment variables are set in Vercel
2. Check build logs for specific errors
3. Ensure `@sveltejs/adapter-auto` is in `package.json`

### Reservations not saving

**Cause:** Google Sheets permissions or API errors

**Solutions:**
1. Check browser console for errors
2. Verify service account has "Editor" permission
3. Check Google Cloud Console API quotas

## Room Configuration

To change room names or add/remove rooms, edit `src/lib/constants.ts`:

```typescript
export const ROOMS: Room[] = [
	{ id: 'room-1', name: 'Conference Room A', description: 'Large room' },
	{ id: 'room-2', name: 'Meeting Room B', description: 'Small room' },
	// Add more rooms as needed
];
```

## Company Names

To change company names, edit `src/lib/constants.ts`:

```typescript
export const COMPANIES = ['Company A', 'Company B', 'Company C'] as const;
```

## Working Hours

To change working hours, edit `src/lib/constants.ts`:

```typescript
export const WORKING_HOURS = {
	START_HOUR: 8,    // 8 AM
	END_HOUR: 20,     // 8 PM
	INTERVAL_MINUTES: 30  // 30-minute slots
} as const;
```

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check Vercel deployment logs
4. Verify Google Cloud Console for API errors

## Security Checklist

- [ ] Admin password is strong and unique
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables set in Vercel
- [ ] Service account key file is stored securely
- [ ] Google Sheet is only shared with service account
- [ ] HTTPS is enabled (automatic with Vercel)

## Maintenance

### Regular Tasks

1. **Monitor Usage:** Check Google Sheet for reservation patterns
2. **Backup Data:** Export Google Sheet periodically
3. **Update Dependencies:** Run `pnpm update` monthly
4. **Review Logs:** Check Vercel logs for errors

### Updating the Application

1. Make changes to code
2. Test locally
3. Commit and push to Git
4. Vercel auto-deploys
5. Test production deployment

---

## Quick Start Summary

```bash
# 1. Install dependencies
pnpm install

# 2. Setup Google Cloud (see detailed steps above)

# 3. Create .env file with credentials
cp .env.example .env
# Edit .env with your credentials

# 4. Run locally
pnpm run dev

# 5. Test application
# - Visit http://localhost:5173
# - Create a test reservation
# - Login to /admin

# 6. Deploy to Vercel
vercel

# 7. Set environment variables in Vercel Dashboard

# 8. Deploy to production
git push
```

Your Meeting Room Reservation System is now live! 🎉
