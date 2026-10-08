// Automated Test Suite for Aurelia Grand Advanced Search
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--------------------------------------------------');
console.log('RUNNING ADVANCED SEARCH TEST SUITE');
console.log('--------------------------------------------------');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

// 1. Inspect index.html
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert(htmlContent.includes('id="adminAdvancedSearchSection"'), 'index.html contains #adminAdvancedSearchSection in Admin Bookings');
assert(htmlContent.includes('id="adminAdvancedSearchInput"'), 'index.html contains #adminAdvancedSearchInput');
assert(htmlContent.includes('id="adminSearchCategory"'), 'index.html contains #adminSearchCategory dropdown');
assert(htmlContent.includes('id="adminSearchClearBtn"'), 'index.html contains #adminSearchClearBtn');
assert(htmlContent.includes('id="adminSearchResultsWrapper"'), 'index.html contains #adminSearchResultsWrapper');

assert(htmlContent.includes('id="staffAdvancedSearchSection"'), 'index.html contains #staffAdvancedSearchSection in Staff Bookings');
assert(htmlContent.includes('id="staffAdvancedSearchInput"'), 'index.html contains #staffAdvancedSearchInput');
assert(htmlContent.includes('id="staffSearchCategory"'), 'index.html contains #staffSearchCategory dropdown');
assert(htmlContent.includes('id="staffSearchClearBtn"'), 'index.html contains #staffSearchClearBtn');
assert(htmlContent.includes('id="staffSearchResultsWrapper"'), 'index.html contains #staffSearchResultsWrapper');

assert(!htmlContent.includes('guestAdvancedSearchSection'), 'Guest view strictly does NOT contain advanced search section');

// 2. Inspect styles.css
const cssPath = path.join(__dirname, 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert(cssContent.includes('.advanced-search-card'), 'styles.css contains .advanced-search-card styling');
assert(cssContent.includes('.search-results-grid'), 'styles.css contains .search-results-grid layout');
assert(cssContent.includes('.search-result-card'), 'styles.css contains .search-result-card component styling');
assert(cssContent.includes('.search-empty-state'), 'styles.css contains .search-empty-state styling');
assert(cssContent.includes('.badge-booking') && cssContent.includes('.badge-banquet') && cssContent.includes('.badge-suite'), 'styles.css defines badges for BOOKING, BANQUET, and SUITE');

// 3. Inspect app.js code & mock DOM sandbox
const appJsPath = path.join(__dirname, 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const mockLocalStorage = {};
const mockLocalStorageObj = {
  getItem: (key) => mockLocalStorage[key] || null,
  setItem: (key, val) => { mockLocalStorage[key] = String(val); },
  removeItem: (key) => { delete mockLocalStorage[key]; },
  clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};

const domElements = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === true) this.add(c);
        else if (force === false) this.remove(c);
        else if (this.contains(c)) this.remove(c);
        else this.add(c);
      }
    },
    value: '',
    innerHTML: '',
    textContent: '',
    options: [],
    appendChild: () => {},
    children: [],
    addEventListener: () => {},
    dispatchEvent: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

const mockDocument = {
  readyState: 'loading',
  body: {
    removeAttribute: () => {},
    setAttribute: () => {},
    style: {}
  },
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = createMockElement(id);
    }
    return domElements[id];
  },
  createElement: (tag) => createMockElement('temp', tag),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const mockWindow = {
  location: { protocol: 'http:', origin: 'http://localhost:5000' },
  addEventListener: () => {},
  dispatchEvent: () => {}
};

const context = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  localStorage: mockLocalStorageObj,
  sessionStorage: mockLocalStorageObj,
  document: mockDocument,
  window: mockWindow,
  navigator: { userAgent: 'node' },
  Intl,
  Date,
  Math,
  JSON,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Set,
  Map,
  CustomEvent: class {}
};

vm.createContext(context);

try {
  vm.runInContext(appJsContent, context);
  console.log('[PASS] app.js evaluated cleanly in sandbox without syntax errors');
  passedTests++;
} catch (e) {
  console.error('[FAIL] app.js failed to evaluate:', e);
  failedTests++;
}

// 4. Test ROOMS_DATA presence
const ROOMS_DATA = vm.runInContext('ROOMS_DATA', context);
assert(Array.isArray(ROOMS_DATA), 'ROOMS_DATA is an array');
const suite205 = ROOMS_DATA.find(r => r.id === 'SUITE-205');
assert(suite205 && suite205.name === 'Royal Grand Suite', 'ROOMS_DATA contains SUITE-205 ("Royal Grand Suite")');
const room101 = ROOMS_DATA.find(r => r.id === 'ROOM-101');
assert(room101 && room101.name === 'Deluxe Oceanfront Suite', 'ROOMS_DATA contains ROOM-101 ("Deluxe Oceanfront Suite")');

// 5. Test INITIAL_BOOKINGS_DATA and loadBookings
assert(typeof context.loadBookings === 'function', 'loadBookings function exists');
const bookings = vm.runInContext('loadBookings()', context);
assert(Array.isArray(bookings), 'loadBookings() returns an array');
const johnDoeBooking = bookings.find(b => b.id === 'AG-2026-00124');
assert(johnDoeBooking && johnDoeBooking.guestName === 'John Doe', 'Bookings include John Doe (AG-2026-00124)');
assert(johnDoeBooking && johnDoeBooking.guestId === 'GST-1024', 'John Doe booking has guestId GST-1024');
assert(johnDoeBooking && (johnDoeBooking.roomId === 'SUITE-205' || johnDoeBooking.roomNumber === '205'), 'John Doe booking is linked to SUITE-205');
assert(johnDoeBooking && johnDoeBooking.status === 'Confirmed', 'John Doe booking status is Confirmed');
assert(johnDoeBooking && johnDoeBooking.totalAmount === 120000, 'John Doe total amount is ₹1,20,000 (120000)');

const johnSmithBooking = bookings.find(b => b.id === 'AG-2026-00128');
assert(johnSmithBooking && johnSmithBooking.guestName === 'John Smith' && johnSmithBooking.guestId === 'GST-1028', 'Bookings include John Smith (GST-1028)');

const johnnyWilsonBooking = bookings.find(b => b.id === 'AG-2026-00129');
assert(johnnyWilsonBooking && johnnyWilsonBooking.guestName === 'Johnny Wilson' && johnnyWilsonBooking.guestId === 'GST-1029', 'Bookings include Johnny Wilson (GST-1029)');

const arunKumarBooking = bookings.find(b => b.id === 'AG-2026-00131');
assert(arunKumarBooking && arunKumarBooking.guestName === 'Arun Kumar' && arunKumarBooking.guestId === 'GST-1031', 'Bookings include Arun Kumar (GST-1031)');

// 6. Test Party Hall Bookings
const PARTY_HALL_BOOKINGS = vm.runInContext('PARTY_HALL_BOOKINGS', context);
assert(Array.isArray(PARTY_HALL_BOOKINGS), 'PARTY_HALL_BOOKINGS is an array');
const partyHallBooking = PARTY_HALL_BOOKINGS.find(b => b.id === 'AG-PH-00125');
assert(partyHallBooking && partyHallBooking.hostName === 'John Doe', 'PARTY_HALL_BOOKINGS includes AG-PH-00125 for John Doe');

// 7. Test executeAdvancedSearch engine
assert(typeof context.executeAdvancedSearch === 'function', 'executeAdvancedSearch is defined');

// Test prompt query 1: "John"
const resultsJohn = context.executeAdvancedSearch('John', 'all', 'ADMIN');
assert(resultsJohn.length >= 3, `Search 'John' returned ${resultsJohn.length} results (expected >= 3)`);
const hasJohnDoe = resultsJohn.some(r => (r.item.guestName === 'John Doe' || r.item.hostName === 'John Doe'));
assert(hasJohnDoe, "Search 'John' includes John Doe");

// Test prompt query 2: "AG-2026-00124"
const resultsBookingId = context.executeAdvancedSearch('AG-2026-00124', 'all', 'ADMIN');
assert(resultsBookingId.length >= 1 && resultsBookingId[0].item.id === 'AG-2026-00124', "Search 'AG-2026-00124' returns matching booking");

// Test prompt query 3: "Royal Grand Suite"
const resultsSuiteName = context.executeAdvancedSearch('Royal Grand Suite', 'all', 'ADMIN');
assert(resultsSuiteName.length >= 1, "Search 'Royal Grand Suite' returns matching records");

// Test prompt query 4: "SUITE-205"
const resultsSuiteId = context.executeAdvancedSearch('SUITE-205', 'all', 'ADMIN');
assert(resultsSuiteId.length >= 1, "Search 'SUITE-205' returns matching records");

// Test prompt query 5: "GST-1024"
const resultsGuestId = context.executeAdvancedSearch('GST-1024', 'all', 'ADMIN');
assert(resultsGuestId.length >= 1 && resultsGuestId.some(r => r.item.guestId === 'GST-1024'), "Search 'GST-1024' returns matching guest records");

// Test prompt query 6: "AG-PH-00125"
const resultsHall = context.executeAdvancedSearch('AG-PH-00125', 'all', 'ADMIN');
assert(resultsHall.length >= 1 && resultsHall[0].item.id === 'AG-PH-00125', "Search 'AG-PH-00125' returns party hall booking");

// 8. Test Category Dropdown Filtering
const catGuestResults = context.executeAdvancedSearch('John', 'guest', 'ADMIN');
assert(catGuestResults.length >= 2, "Category 'guest' with 'John' returns guest matches");

const catGuestIdResults = context.executeAdvancedSearch('GST-1024', 'guestId', 'ADMIN');
assert(catGuestIdResults.length >= 1 && catGuestIdResults[0].item.guestId === 'GST-1024', "Category 'guestId' with 'GST-1024' returns exact match");

const catBookingIdResults = context.executeAdvancedSearch('AG-2026-00124', 'bookingId', 'ADMIN');
assert(catBookingIdResults.length === 1 && catBookingIdResults[0].item.id === 'AG-2026-00124', "Category 'bookingId' with 'AG-2026-00124' returns 1 record");

const catRoomResults = context.executeAdvancedSearch('Royal', 'room', 'ADMIN');
assert(catRoomResults.length >= 1, "Category 'room' with 'Royal' returns room matches");

const catHallResults = context.executeAdvancedSearch('Glasshouse', 'hall', 'ADMIN');
assert(catHallResults.length >= 1, "Category 'hall' with 'Glasshouse' returns hall matches");

// 9. Test Empty Query & Non-existent Query
const emptyQueryResults = context.executeAdvancedSearch('', 'all', 'ADMIN');
assert(emptyQueryResults.length === 0, 'Empty query returns empty array');

const noMatchResults = context.executeAdvancedSearch('zzzz-nonexistent-keyword-999', 'all', 'ADMIN');
assert(noMatchResults.length === 0, 'Non-existent keyword returns empty array');

// 10. Test renderSearchResults
const testWrapper = createMockElement('testWrapper');
context.renderSearchResults([], testWrapper, '', 'ADMIN');
assert(testWrapper.innerHTML.includes('Search Guest, Booking, Room or Suite'), 'Awaiting query placeholder rendered when query is empty');

context.renderSearchResults([], testWrapper, 'nonexistentxyz', 'ADMIN');
assert(testWrapper.innerHTML.includes('No Records Found'), 'Empty state rendered when no records found');

context.renderSearchResults(resultsJohn, testWrapper, 'John', 'ADMIN');
assert(testWrapper.innerHTML.includes('Found') && testWrapper.innerHTML.includes('matching record'), 'Results count header rendered for successful query');
assert(testWrapper.innerHTML.includes('search-result-card'), 'Result cards rendered in results wrapper');
assert(testWrapper.innerHTML.includes('John Doe'), 'John Doe rendered in search result card');
assert(testWrapper.innerHTML.includes('GST-1024'), 'Guest ID GST-1024 rendered in search result card');

// 11. Test Role-Based Access Isolation
const adminSection = mockDocument.getElementById('adminAdvancedSearchSection');
const staffSection = mockDocument.getElementById('staffAdvancedSearchSection');

// Test Admin role access
context.applyRoleBasedAccess('ADMIN');
assert(adminSection.style.display === 'block', 'applyRoleBasedAccess("ADMIN") displays #adminAdvancedSearchSection');
assert(staffSection.style.display === 'none', 'applyRoleBasedAccess("ADMIN") hides #staffAdvancedSearchSection');

// Test Staff role access
context.applyRoleBasedAccess('STAFF');
assert(adminSection.style.display === 'none', 'applyRoleBasedAccess("STAFF") hides #adminAdvancedSearchSection');
assert(staffSection.style.display === 'block', 'applyRoleBasedAccess("STAFF") displays #staffAdvancedSearchSection');

// Test Guest role isolation (CRITICAL)
context.applyRoleBasedAccess('USER');
assert(adminSection.style.display === 'none', 'applyRoleBasedAccess("USER") strictly hides #adminAdvancedSearchSection');
assert(staffSection.style.display === 'none', 'applyRoleBasedAccess("USER") strictly hides #staffAdvancedSearchSection');

console.log('--------------------------------------------------');
console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed`);
console.log('--------------------------------------------------');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL ADVANCED SEARCH TESTS PASSED SUCCESSFULLY!');
}
