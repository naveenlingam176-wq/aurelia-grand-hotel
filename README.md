# AURELIA GRAND LUXURY RESORT & HOTEL MANAGEMENT SYSTEM
### Enterprise Hospitality Operations Dashboard & Portfolio Showcase

A state-of-the-art, luxury hotel management system and portfolio showcase built for high-end hospitality brands, boutique resorts, and multi-property international hotel chains.

---

## 🌟 Key Highlights & Architectural Features

### 1. High-Resolution Curated Web Imagery
- **Lagoon Villas & Penthouses**: Ultra-crisp architectural photography capturing oceanfront infinity pools, bespoke marble suites, and private terraces.
- **Michelin Fine Dining**: Curated gastronomy and mixology imagery (3-Star Michelin *L'Orangerie*, *The Amber Cellar*).
- **Longevity Spa Sanctuaries**: Immersive wellness imagery featuring hydrotherapy, Ayurvedic steam, and treatment rooms.
- **VIP Profiles**: Authentic executive portraits with loyalty tiers (Black Diamond, Imperial Gold, Silver Heritage).

### 2. Multi-Theme Luxury Styling Engine
The dashboard includes three bespoke themes powered by CSS Custom Properties and glassmorphism:
- **Imperial Midnight & Gold (Default)**: Deep obsidian (`#0a0d14`), brushed champagne gold (`#d4af37`), and subtle warm luminescence.
- **Emerald Sanctuary & Platinum**: Deep jade tones (`#06130f`), luminous mint, and platinum highlights for tropical eco-luxury resorts.
- **Sunlit Ivory & Bronze**: Warm travertine cream (`#f8f6f0`), brushed bronze, and alabaster accents designed for architectural editorial aesthetics.
- **Theme Switcher**: Instant transition with persistent state saved in `localStorage`.

### 3. Fully Interactive Hotel Operations
- **Live Room & Suite Inventory**:
  - Filterable by suite category: *All (48)*, *Penthouses (4)*, *Overwater Villas (12)*, *Sky Suites (16)*, *Deluxe Oceanfront (16)*.
  - Interactive status badges: `Available`, `Occupied`, `Maintenance`.
  - Room cards with quick inspection toggle, nightly rate, guest allocation, and high-res photo gallery modal.
- **Direct VIP Reservation Engine**:
  - Modal with real-time bill calculations (room rate × nights + luxury transfer + vintage champagne + private chef + 12% luxury taxes).
  - Instantly adds booking to the live reservations table and updates the KPI counters.
- **Live Concierge & Butler Dispatch Queue**:
  - Real-time pending requests (*Dom Pérignon P2*, *Rolls Royce Airport Transfer*, *Couples Spa Ritual*).
  - Action buttons to resolve requests or escalate to head butlers.
- **Yield & Performance Analytics**:
  - Dual-axis Chart.js trend visualization (Gross Revenue vs. Occupancy Rate %) with timeframe switching (7 Days, 30 Days, Quarterly).
  - Doughnut chart detailing revenue distribution by suite tier.
- **Multi-Property Switcher**:
  - Switch seamlessly between *Aurelia Grand - Maldives Atoll*, *Aurelia Alpine Palace - St. Moritz*, and *Aurelia Sanctuary - Kyoto*.
- **Native Web Audio API Feedback**:
  - Crystal bell and harmonic chord audio feedback without any external audio asset dependencies.
- **Instant CSV Export**:
  - One-click export of current operations, guest folios, and booking status into a clean CSV report.
- **Secure JWT Authentication & Role-Based Access (RBAC)**:
  - Full-stack authentication protecting the dashboard from unauthorized access.
  - Relational SQLite user database with cryptographic salted password hashing.
  - Role-based permissions across `ADMIN`, `STAFF`, and `USER` tiers.

---

## 🔐 Authentication & Security Architecture

The hotel management dashboard is protected by an enterprise-grade authentication backend:

| Role | Test Email | Test Password | Accessible Sections |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@aureliagrand.com` | `AdminPassword123!` | Full access to all operations, yield analytics, concierge queue, bookings, and report exports. |
| **STAFF** | `staff@aureliagrand.com` | `StaffPassword123!` | Hotel operations, suites inventory, guest folios, and concierge request dispatch. (Financial analytics masked/restricted). |
| **USER** | `user@aureliagrand.com` | `UserPassword123!` | Guest Portfolio Showcase & personal VIP reservations. (Back-office management restricted). |

### API Endpoints

- `POST /api/auth/login`: Authenticates credentials, verifies password hash, and issues signed HS256 JWT.
- `GET /api/auth/me`: Validates JWT token and returns authenticated user profile (Protected route).
- `POST /api/auth/logout`: Clears user session.
- `GET /api/health`: Health status endpoint.

---

## 🚀 How to Run the Project

### Option 1: One-Click Launcher (Windows)
Double-click `start.bat` in the project root directory. It automatically launches the backend server and opens `http://localhost:5000` in your default browser.

### Option 2: Command Line
```bash
# Start the backend server (serves both API and luxury dashboard)
node server.js
```
Then open `http://localhost:5000` in your web browser.

### Run Automated Tests
```bash
# Executes 33 automated tests validating DB schema, hashing, JWT, API, and RBAC
node test-auth.js
```

---

## 📱 Responsiveness
- Desktop displays (1440px - 4K)
- Laptops and tablets (collapsible sidebar, responsive CSS grids)
- Mobile phones (touch drawer navigation, stacked KPI ribbons, horizontally scrollable data tables)

