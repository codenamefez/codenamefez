# Internal Status Page

A self-hosted status page for tracking product and service health internally. Non-technical team members can post updates, report incidents, and manage announcements through a simple admin interface.

## Features

- **Public status page** — Shows overall system health, individual product statuses, active incidents, and announcements
- **Admin dashboard** — Quick status updates without creating full incidents
- **Product management** — Add, edit, and remove products/services
- **Incident tracking** — Report incidents with timeline updates (investigating → identified → monitoring → resolved)
- **Announcements** — Post company-wide messages (info, maintenance, warning)
- **Settings** — Customise page title/description and admin password

## Quick Start

```bash
cd status-page
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the status page.

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

**Default admin password:** `changeme` — change this immediately in Settings after first login.

## Environment Variables

Create a `.env.local` file (optional):

```env
# Admin password on first run (before database is created)
ADMIN_PASSWORD=your-secure-password

# Session encryption secret (required in production)
SESSION_SECRET=at-least-32-characters-long-random-string
```

## Production Deployment

```bash
npm run build
npm start
```

The SQLite database is stored in `data/status.db`. Back this up regularly in production.

For Docker or cloud deployment, mount a persistent volume at `./data` so status data survives restarts.

## Usage Guide for Non-Technical Staff

### Posting a quick status update

1. Go to **Admin → Dashboard**
2. Find the product in the "Quick Status Update" section
3. Select the new status from the dropdown
4. Optionally add a short message (e.g. "Investigating slow response times")
5. Click **Update**

### Reporting an incident

1. Go to **Admin → Incidents → Report Incident**
2. Enter a title and initial message
3. Select affected products
4. Click **Create Incident**
5. Return to the incident page to post follow-up updates as the situation evolves
6. Set status to **Resolved** when the issue is fixed

### Posting an announcement

1. Go to **Admin → Announcements → New Announcement**
2. Enter a title and message
3. Choose type: Information, Maintenance, or Warning
4. Click **Publish Announcement**

Announcements appear at the top of the status page for all staff to see.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [SQLite](https://www.sqlite.org/) via better-sqlite3
- [Tailwind CSS](https://tailwindcss.com/)
- [iron-session](https://github.com/vvo/iron-session) for admin authentication

## Project Structure

```
status-page/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Public status page
│   │   └── admin/                # Management interface
│   ├── components/               # UI components
│   └── lib/
│       ├── db.ts                 # Database layer
│       ├── auth.ts               # Session management
│       └── status.ts             # Status helpers
└── data/                         # SQLite database (auto-created)
```
