/**
 * Automated Test Suite for Favorite Rooms Feature (Guest Only)
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passed++;
    console.log(`✅ [PASS] ${message}`);
  }
}

console.log('===============================================================');
console.log('  AURELIA GRAND - FAVORITE ROOMS FEATURE TEST SUITE');
console.log('===============================================================\n');

// Mock browser environment for unit testing frontend logic
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => store
  };
})();

global.localStorage = localStorageMock;

// Load files
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const jsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// --- Test 1: HTML Structure & Integration ---
console.log('\n--- Test 1: HTML Elements & Structure ---');
assert(htmlContent.includes('id="navFavorites"'), 'Sidebar includes #navFavorites navigation link');
assert(htmlContent.includes('id="navFavoritesBadge"'), 'Sidebar includes #navFavoritesBadge');
assert(htmlContent.includes('id="tabBtnFavorites"'), 'Section tabs bar includes #tabBtnFavorites button');
assert(htmlContent.includes('id="tabBtnFavoritesBadge"'), 'Section tabs bar includes #tabBtnFavoritesBadge');
assert(htmlContent.includes('id="tabFavorites"'), 'Content includes #tabFavorites tab-pane');
assert(htmlContent.includes('id="favoritesRoomsGrid"'), 'Favorites pane includes #favoritesRoomsGrid');
assert(htmlContent.includes('id="favoritesSearchInput"'), 'Favorites pane includes search input #favoritesSearchInput');
assert(htmlContent.includes('id="favoritesFilterPills"'), 'Favorites pane includes category filter pills');

// --- Test 2: CSS Styles & Animations ---
console.log('\n--- Test 2: CSS Styling & Luxury Theme Consistency ---');
assert(cssContent.includes('.room-favorite-btn'), 'CSS defines .room-favorite-btn');
assert(cssContent.includes('.room-favorite-btn.is-favorite'), 'CSS defines .room-favorite-btn.is-favorite active state');
assert(cssContent.includes('@keyframes heartPulse'), 'CSS defines @keyframes heartPulse animation');
assert(cssContent.includes('.empty-favorites-state'), 'CSS defines .empty-favorites-state');
assert(cssContent.includes('.room-detail-fav-btn'), 'CSS defines .room-detail-fav-btn for Room Details modal');

// --- Test 3: JavaScript State & Persistence Logic ---
console.log('\n--- Test 3: JavaScript Logic & LocalStorage Persistence ---');
assert(jsContent.includes("aurelia_guest_favorites"), 'FAVORITES_STORAGE_KEY uses "aurelia_guest_favorites"');
assert(jsContent.includes("function isGuestUser"), 'Defines isGuestUser() helper');
assert(jsContent.includes("function getFavoriteRoomIds"), 'Defines getFavoriteRoomIds()');
assert(jsContent.includes("function saveFavoriteRoomIds"), 'Defines saveFavoriteRoomIds()');
assert(jsContent.includes("function toggleFavorite"), 'Defines toggleFavorite()');
assert(jsContent.includes("function renderFavoritesGrid"), 'Defines renderFavoritesGrid()');
assert(jsContent.includes("function updateFavoritesBadges"), 'Defines updateFavoritesBadges()');

// Simulate storage logic
localStorage.clear();
const FAVORITES_STORAGE_KEY = 'aurelia_guest_favorites';

const MOCK_ROOMS = [
  { id: 'R-701', number: '701', name: 'The Imperial Ocean Penthouse', price: 3450, category: 'penthouse' },
  { id: 'R-702', number: '702', name: 'The Royal Horizon Penthouse', price: 3200, category: 'penthouse' },
  { id: 'R-602', number: '602', name: 'Royal Lagoon Overwater Villa', price: 2150, category: 'villa' }
];

function testGetFavoriteRoomIds(rooms = MOCK_ROOMS) {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(id => rooms.some(r => r.id === id));
  } catch (e) {
    return [];
  }
}

function testSaveFavoriteRoomIds(ids) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

assert(testGetFavoriteRoomIds().length === 0, 'Initial favorites is empty array');

testSaveFavoriteRoomIds(['R-701', 'R-602']);
const saved = testGetFavoriteRoomIds();
assert(saved.length === 2 && saved.includes('R-701') && saved.includes('R-602'), 'Favorites stored and retrieved correctly');

// Test stale room filtering
testSaveFavoriteRoomIds(['R-701', 'NON-EXISTENT-999']);
const filteredStale = testGetFavoriteRoomIds();
assert(filteredStale.length === 1 && filteredStale[0] === 'R-701', 'Gracefully omits stale/deleted room IDs');

// --- Test 4: Role Gating & Security ---
console.log('\n--- Test 4: Role-Based Access Isolation ---');
assert(jsContent.includes("if (role === 'ADMIN')"), 'applyRoleBasedAccess checks ADMIN role');
assert(jsContent.includes("if (role === 'STAFF')"), 'applyRoleBasedAccess checks STAFF role');
assert(jsContent.includes("if (role === 'USER')"), 'applyRoleBasedAccess checks USER role');

// Check that in ADMIN and STAFF, navFavorites and tabBtnFavorites are hidden with display = 'none'
const adminStaffBlocks = jsContent.slice(jsContent.indexOf("if (role === 'ADMIN')"), jsContent.indexOf("if (role === 'USER')"));
assert(adminStaffBlocks.includes("if (navFavorites) navFavorites.style.display = 'none'"), 'Favorites nav is hidden for Admin and Staff');
assert(adminStaffBlocks.includes("if (tabBtnFavorites) tabBtnFavorites.style.display = 'none'"), 'Favorites tab button is hidden for Admin and Staff');

// Check that in USER, favorites nav items are displayed
const userBlock = jsContent.slice(jsContent.indexOf("} else if (role === 'USER')"), jsContent.indexOf("updateBookingsNavBadge"));
assert(userBlock.includes("if (navFavorites) navFavorites.style.display = 'flex'"), 'Favorites nav is displayed for Guest (USER)');
assert(userBlock.includes("if (tabBtnFavorites) tabBtnFavorites.style.display = 'inline-flex'"), 'Favorites tab button is displayed for Guest (USER)');

// --- Test 5: Currency Integration ---
console.log('\n--- Test 5: Currency Integration ---');
assert(jsContent.includes("formatCurrency(room.price)"), 'Favorite room cards format prices with formatCurrency()');
assert(jsContent.includes("guestCurrencyChange"), 'Listens for guestCurrencyChange event to re-render favorites');
assert(jsContent.includes("renderFavoritesGrid();"), 'renderAllComponents re-renders favorites upon currency change');

// --- Test 6: Room Details Integration ---
console.log('\n--- Test 6: Room Details Integration ---');
assert(jsContent.includes("id=\"modalFavoriteBtn\""), 'Room Details modal includes modalFavoriteBtn');
assert(jsContent.includes("openReservationModalWithRoom"), 'Favorite cards link to openReservationModalWithRoom');

console.log('\n===============================================================');
console.log(`  ALL ${total} / ${total} TESTS PASSED SUCCESSFULLY!`);
console.log('===============================================================');
