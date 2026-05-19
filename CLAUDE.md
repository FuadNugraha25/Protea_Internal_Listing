# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **React 19** + **Vite 7**
- **Bootstrap 5** for layout and utility classes — NOT Tailwind. Tailwind classes like `uppercase`, `tracking-widest`, `mb-1.5` will silently do nothing. Use inline styles or Bootstrap classes instead.
- **Supabase** for auth, database, and file storage (`house-photos` bucket)
- **PrimeReact** for Dialog and Toast components
- **CSS custom properties** defined in `src/index.css` for the dark theme (e.g. `var(--primary)`, `var(--surface)`, `var(--text-secondary)`)

## Architecture

### Auth & Routing (`src/App.jsx`)
All routes are auth-gated. `App.jsx` checks `supabase.auth.getUser()` on load and listens to `onAuthStateChange`. If no user, renders `<CustomLogin />`. Otherwise renders a `<Router>` with all routes.

### Admin Check
Two hardcoded admin UUIDs are used throughout the codebase:
```js
const allowedUserId = ['ae43f00b-4138-4baa-9bf2-897e5ee7abfe', '4a971da9-0c28-4943-a379-c4a29ca22136'];
```
`profileUtils.js` also has an `isUserAdmin()` function that checks `profiles.is_admin` in the DB with fallback to the hardcoded list. The hardcoded list is still used directly in most components — they haven't been migrated to `isUserAdmin()` yet.

### Supabase Client (`src/supabaseClient.js`)
Single shared client exported as `supabase`. URL and anon key are hardcoded directly (not from `.env`).

### Key Database Tables
- `listings` — property listings. Key fields: `title`, `description`, `image_urls`, `lt`, `lb`, `kt`, `km`, `city`, `district`, `province`, `price`, `transaction_type`, `property_type`, `owner`, `user_id`
- `profiles` — user profiles. Key fields: `id`, `name`, `full_name`, `email`, `is_admin`

### Profile System (`src/utils/profileUtils.js`)
`getOrCreateProfile(user)` automatically creates a profile if one doesn't exist, deriving name from email. Used whenever a user's display name is needed.

### Navbar (`src/components/Navbar.jsx`)
Accepts boolean props to control which nav buttons appear: `showDashboardButton`, `showAdminButton`, `showTambahListingButton`, `showListingPribadiButton`. Also accepts `user` and `onLogout`. Admin buttons are shown based on the hardcoded UUID list.

### Styling Conventions
- Dark theme variables are in `src/index.css` — always use `var(--*)` tokens instead of hardcoded colors
- `.glass` and `.glass-card` are custom glassmorphism classes defined in `src/index.css`
- Bootstrap's `.text-primary` resolves to Bootstrap blue (`#0d6efd`), NOT the app's indigo `var(--primary)`. Always use `style={{ color: 'var(--primary)' }}` for the app's brand color
- Disabled/readonly inputs must get their background from CSS — browser defaults will flash white otherwise
- `.glass-card` transition is intentionally limited to `background` and `border-color` only — do NOT change it back to `transition: all`, as that causes an oval rendering artifact on page load due to `backdrop-filter` animating from its initial state

### Skeleton Loading
All loading states in admin pages use skeleton blocks, not spinners. The keyframe and utility class are global in `src/index.css`:
```css
@keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skeleton-block { background: linear-gradient(...); background-size: 200% 100%; animation: skeletonShimmer 2.5s infinite; border-radius: 8px; }
```
Use `<div className="skeleton-block" style={{ width, height }} />` for skeleton blocks. Shape them to match the actual content layout.

### Property Types
`property_type` can be `"Rumah"`, `"Kavling"`, or `"Apartemen"`. Kavling listings hide LB/KT/KM fields throughout the UI.

### Image Handling
Images are compressed client-side with `browser-image-compression` before upload to Supabase storage bucket `house-photos`. Only one image per listing is supported.

### AI Extract Feature (`src/components/PropertyForm.jsx`)
Uses Gemini API (`VITE_GEMINI_API_KEY` in `.env`) with model `gemini-2.5-flash` via endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`. Parses pasted property descriptions and auto-fills the form.

### Admin Pages & Routing
All admin routes are in `src/App.jsx` as inline page components. Each page has a persistent 280px sidebar with the same 5 nav items. Routes and their active sidebar button:
- `/admin` → Buat Listingan (active) — renders `<PropertyForm />`
- `/confirm-listings` → Listingan Log (active) — renders `<ConfirmListings />`
- `/total-listings` → Total Listingan (active) — renders `<TotalListings />`
- `/user-management` → Kelola User (active) — renders `<UserManagement />`
- `/backup` → Backup (active, pinned at bottom) — renders `<BackupListings />`

When adding a new admin page: add a new route + page component in `App.jsx`, add the "Kelola User"-style button to the sidebar of ALL existing admin page components, and mark the new page's own button as active (primary background, no border).

### User Management (`src/user_page/UserManagement.jsx`)
Admin-only page at `/user-management`. Displays all users from the `profiles` table (read-only). Shows avatar initials, full name, email, and Admin badge. No password operations — changing passwords requires a Supabase Edge Function with the service role key (not yet implemented).

### CustomDropdown (`src/components/CustomDropdown.jsx`)
Reusable dark-themed dropdown with optional `searchable` prop. Used for location fields (Provinsi → Kota → Kecamatan) in both `PropertyForm` and `EditPropertyForm`. Options are fetched from existing listings in Supabase and cascade: selecting a province filters the city list, selecting a city filters the district list. Accepts `options` (string array or `{value, label}[]`), `value`, `onChange`, `placeholder`, `searchable`, `disabled`.
