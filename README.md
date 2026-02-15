# Classified Ads (Global Promotional Deals)

Classified Ads is a lightweight, local-first “classified deals” web app where anyone can submit a promotional ad (store + deal details + image), and an admin can review submissions before they go public.

It’s built as a simple moderation workflow:
**Submit ad → Pending review → Admin approves/rejects → Approved ads appear on the homepage**

---

## What this project does

### Public site (everyone)
- Browse a feed of **approved deals**, sorted by newest first.
- View each deal’s key info at a glance (country, date, title, short description, store name, and image).
- Submit a new promotional ad through a guided form.

### Submission flow (creators/shops)
A submission includes:
- Store name
- Ad title
- Description
- Country (dropdown list)
- Contact email
- Ad image (uploaded and previewed before submitting)

Submissions are saved as **pending** until an admin reviews them.

### Admin panel (moderation)
Admins can:
- Log in to a private admin area
- View **pending ads** and approve or reject them
- View **approved ads** and delete them if needed
- Change the admin password from a settings tab

---

## How it works (high-level)

### Local-first “database”
This project uses the browser’s **LocalStorage** as a simple database:
- Ads are stored as an array in LocalStorage.
- Each ad has a `status` field: `pending` or `approved`.
- Images are stored directly in the ad record as **Base64-encoded image data**, so the app can display uploaded images without a server.

### Admin authentication (demo-friendly)
Admin authentication is implemented locally:
- The admin account is initialized on first run.
- The password is stored as a **bcrypt hash** (still inside LocalStorage).
- Login creates a simple “token” with a built-in expiration time (a simulated JWT-style approach).
- Protected admin routes check the token before showing the dashboard.

This is intentionally lightweight for a frontend-only MVP.

---

## Tech stack

- React + TypeScript
- React Router (client-side routing)
- Tailwind CSS (via the Tailwind Vite plugin)
- LocalStorage for persistence (ads + admin + auth token)
- Utility libraries:
  - `uuid` for IDs
  - `bcryptjs` for hashing admin passwords
  - `date-fns` for date formatting
  - `clsx` + `tailwind-merge` for clean className composition

---

## Pages & user experience

- **Home**: “Latest Deals” feed showing approved ads.
- **Submit**: form-based submission with validation + image upload/preview.
- **Admin Login**: sign-in page for moderators.
- **Admin Dashboard**:
  - Pending tab: approve/reject submissions
  - Approved tab: review/delete live deals
  - Settings tab: change admin password

The header/footer automatically hide on admin routes to keep the admin UI focused.

---

## Data, privacy, and security notes (important)

- All data stays **in the user’s browser** (LocalStorage). There is no backend and no shared database.
- Clearing browser storage clears ads, admin settings, and login state.
- Because everything is client-side, the admin system is best viewed as **prototype/demo authentication**, not production security.

If you evolve this into a real product, the natural next step is adding a backend (database + real authentication + file storage for images).

---

## Repo structure (mental map)

- `src/pages/`
  - Public pages (Home, Submit)
  - Admin pages (Login, Dashboard)
- `src/components/`
  - Layout components (Header, Footer)
  - Reusable UI building blocks (Button, Input, Textarea, AdCard)
- `src/lib/`
  - LocalStorage “database” + auth helpers
- `src/context/`
  - Auth context/provider (login, logout, token validation)
- `src/types/`
  - TypeScript types for Ads and Admin users
- `src/utils/`
  - Utility helpers (Tailwind class merging)

---

## Build & deployment approach (what makes this easy to ship)

The project includes a single-file build plugin, which is useful when you want to distribute or deploy the app as a compact static bundle (for example: simple hosting that serves static assets).

---

## Known limitations (by design)

- No real backend: ads are not shared between users/devices.
- Image storage is Base64 in LocalStorage: large images can hit browser storage limits.
- Admin auth is local-only: it’s not suitable for real security requirements.
- The repo currently includes a `node_modules/` folder, which is not typical for professional repos (it increases repo size). In most projects, `node_modules/` is generated locally and excluded via `.gitignore`.

---

## Roadmap ideas (high-impact improvements)

- Add a backend database so ads are truly multi-user and persistent across devices.
- Add real admin accounts (server-side auth, sessions/JWT, role-based access).
- Store images in proper file storage (S3, Cloudinary, etc.) instead of Base64 in LocalStorage.
- Add categories/tags + search + filters (country/category/store).
- Add rate limiting and spam protection on submissions.
- Add moderation notes and an approval history log for admins.

---

## License

No license file is currently included. 
