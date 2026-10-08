// Automated Test Suite for Country-Based Currency System (Admin, Staff, Guest)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--------------------------------------------------');
console.log('RUNNING COUNTRY-BASED CURRENCY TEST SUITE');
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

assert(htmlContent.includes('id="adminCurrencyPill"'), 'index.html contains #adminCurrencyPill in navbar');
assert(htmlContent.includes('id="adminCountryCurrencySelect"'), 'index.html contains #adminCountryCurrencySelect in navbar');
assert(htmlContent.includes('id="staffCurrencyPill"'), 'index.html contains #staffCurrencyPill in navbar');
assert(htmlContent.includes('id="staffCountryCurrencySelect"'), 'index.html contains #staffCountryCurrencySelect in navbar');
assert(htmlContent.includes('id="guestCurrencyPill"'), 'index.html contains #guestCurrencyPill in navbar');
assert(htmlContent.includes('id="guestCurrencySelect"'), 'index.html contains #guestCurrencySelect in navbar');
assert(htmlContent.includes('id="adminDashboardCurrencyPill"'), 'index.html contains #adminDashboardCurrencyPill in adminBookingsView');
assert(htmlContent.includes('id="adminDashboardCountryCurrencySelect"'), 'index.html contains #adminDashboardCountryCurrencySelect');
assert(htmlContent.includes('id="staffDashboardCurrencyPill"'), 'index.html contains #staffDashboardCurrencyPill in staffBookingsView');
assert(htmlContent.includes('id="staffDashboardCountryCurrencySelect"'), 'index.html contains #staffDashboardCountryCurrencySelect');
assert(htmlContent.includes('id="deptRevenueSuites"'), 'index.html contains #deptRevenueSuites');
assert(htmlContent.includes('id="deptRevenueDining"'), 'index.html contains #deptRevenueDining');
assert(htmlContent.includes('id="deptRevenueYachts"'), 'index.html contains #deptRevenueYachts');
assert(htmlContent.includes('id="deptRevenueSpa"'), 'index.html contains #deptRevenueSpa');
assert(htmlContent.includes('id="kpiAdrSubtext"'), 'index.html contains #kpiAdrSubtext');

// 2. Inspect styles.css
const cssPath = path.join(__dirname, 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert(cssContent.includes('.role-currency-pill'), 'styles.css contains .role-currency-pill');
assert(cssContent.includes('.admin-currency-pill'), 'styles.css contains .admin-currency-pill');
assert(cssContent.includes('.staff-currency-pill'), 'styles.css contains .staff-currency-pill');
assert(cssContent.includes('.role-currency-select'), 'styles.css contains .role-currency-select');

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
    dataset: {},
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
    getAttribute: () => 'default',
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
  dispatchEvent: () => {},
  CustomEvent: class { constructor(name, opts) { this.name = name; this.detail = opts ? opts.detail : null; } }
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
  CustomEvent: class { constructor(name, opts) { this.name = name; this.detail = opts ? opts.detail : null; } },
  Event: class { constructor(name) { this.name = name; } },
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
  Map
};

vm.createContext(context);
vm.runInContext(appJsContent, context);

// Test 1: Default Values
console.log('\n--- Checking Default Configurations ---');
mockLocalStorageObj.clear();
assert(context.getAdminCountry() === 'India', 'Default Admin country is India');
assert(context.getAdminCurrency() === 'INR', 'Default Admin currency is INR');
assert(context.getStaffCountry() === 'India', 'Default Staff country is India');
assert(context.getStaffCurrency() === 'INR', 'Default Staff currency is INR');
assert(context.getGuestCurrency() === 'INR', 'Default Guest currency is INR');

const adminDefCfg = context.getAdminCurrencyConfig();
assert(adminDefCfg.code === 'INR' && adminDefCfg.symbol === '₹' && adminDefCfg.rate === 1.0, 'Admin default config is INR (rate: 1.0)');
const staffDefCfg = context.getStaffCurrencyConfig();
assert(staffDefCfg.code === 'INR' && staffDefCfg.symbol === '₹' && staffDefCfg.rate === 1.0, 'Staff default config is INR (rate: 1.0)');
const guestDefCfg = context.getGuestCurrencyConfig();
assert(guestDefCfg.code === 'INR' && guestDefCfg.symbol === '₹' && guestDefCfg.rate === 1.0, 'Guest default config is INR (rate: 1.0)');

// Test 2: Country to Currency Automatic Mapping for Admin
console.log('\n--- Checking Admin Country-to-Currency Mapping ---');
context.setAdminCountryAndCurrency('United States');
assert(context.getAdminCountry() === 'United States', 'Admin country set to United States');
assert(context.getAdminCurrency() === 'USD', 'Admin country United States automatically maps to USD');
assert(mockLocalStorage['aurelia_admin_country'] === 'United States', 'aurelia_admin_country saved in localStorage');
assert(mockLocalStorage['aurelia_admin_currency'] === 'USD', 'aurelia_admin_currency saved in localStorage');

context.setAdminCountryAndCurrency('United Kingdom');
assert(context.getAdminCountry() === 'United Kingdom' && context.getAdminCurrency() === 'GBP', 'Admin United Kingdom maps to GBP');

context.setAdminCountryAndCurrency('European Union');
assert(context.getAdminCountry() === 'European Union' && context.getAdminCurrency() === 'EUR', 'Admin European Union maps to EUR');

context.setAdminCountryAndCurrency('United Arab Emirates');
assert(context.getAdminCountry() === 'United Arab Emirates' && context.getAdminCurrency() === 'AED', 'Admin UAE maps to AED');

context.setAdminCountryAndCurrency('Japan');
assert(context.getAdminCountry() === 'Japan' && context.getAdminCurrency() === 'JPY', 'Admin Japan maps to JPY');

context.setAdminCountryAndCurrency('Switzerland');
assert(context.getAdminCountry() === 'Switzerland' && context.getAdminCurrency() === 'CHF', 'Admin Switzerland maps to CHF');

context.setAdminCountryAndCurrency('South Korea');
assert(context.getAdminCountry() === 'South Korea' && context.getAdminCurrency() === 'KRW', 'Admin South Korea maps to KRW');

// Test 3: Country to Currency Automatic Mapping for Staff
console.log('\n--- Checking Staff Country-to-Currency Mapping ---');
context.setStaffCountryAndCurrency('Australia');
assert(context.getStaffCountry() === 'Australia', 'Staff country set to Australia');
assert(context.getStaffCurrency() === 'AUD', 'Staff country Australia automatically maps to AUD');
assert(mockLocalStorage['aurelia_staff_country'] === 'Australia', 'aurelia_staff_country saved in localStorage');
assert(mockLocalStorage['aurelia_staff_currency'] === 'AUD', 'aurelia_staff_currency saved in localStorage');

context.setStaffCountryAndCurrency('Canada');
assert(context.getStaffCountry() === 'Canada' && context.getStaffCurrency() === 'CAD', 'Staff Canada maps to CAD');

context.setStaffCountryAndCurrency('Singapore');
assert(context.getStaffCountry() === 'Singapore' && context.getStaffCurrency() === 'SGD', 'Staff Singapore maps to SGD');

context.setStaffCountryAndCurrency('China');
assert(context.getStaffCountry() === 'China' && context.getStaffCurrency() === 'CNY', 'Staff China maps to CNY');

// Test 4: Strict Role Isolation
console.log('\n--- Checking Strict Role Isolation ---');
mockLocalStorageObj.clear();

// Set Admin to USD, Staff to JPY, Guest to EUR
context.setAdminCountryAndCurrency('United States');
context.setStaffCountryAndCurrency('Japan');
context.setGuestCurrency('EUR');

assert(context.getAdminCurrency() === 'USD', 'Admin currency is USD');
assert(context.getStaffCurrency() === 'JPY', 'Staff currency is JPY');
assert(context.getGuestCurrency() === 'EUR', 'Guest currency is EUR');

// Changing Guest does not affect Admin or Staff
context.setGuestCurrency('GBP');
assert(context.getAdminCurrency() === 'USD', 'Admin currency remained USD after Guest changed to GBP');
assert(context.getStaffCurrency() === 'JPY', 'Staff currency remained JPY after Guest changed to GBP');
assert(context.getGuestCurrency() === 'GBP', 'Guest currency changed to GBP');

// Changing Admin does not affect Staff or Guest
context.setAdminCountryAndCurrency('United Arab Emirates');
assert(context.getAdminCurrency() === 'AED', 'Admin currency changed to AED');
assert(context.getStaffCurrency() === 'JPY', 'Staff currency remained JPY after Admin changed to AED');
assert(context.getGuestCurrency() === 'GBP', 'Guest currency remained GBP after Admin changed to AED');

// Changing Staff does not affect Admin or Guest
context.setStaffCountryAndCurrency('Canada');
assert(context.getStaffCurrency() === 'CAD', 'Staff currency changed to CAD');
assert(context.getAdminCurrency() === 'AED', 'Admin currency remained AED after Staff changed to CAD');
assert(context.getGuestCurrency() === 'GBP', 'Guest currency remained GBP after Staff changed to CAD');

// Test 5: Active Currency Resolver per Role
console.log('\n--- Checking Active Currency Resolver (getActiveCurrencyConfig) ---');
// When role is ADMIN
const auth = context.window.AuthManager;
auth.getCurrentUser = () => ({ id: 1, role: 'ADMIN', fullName: 'Julian Vance' });
const activeForAdmin = context.getActiveCurrencyConfig();
assert(activeForAdmin.code === 'AED' && activeForAdmin.symbol === 'د.إ', 'getActiveCurrencyConfig returns Admin config (AED) for ADMIN role');

// When role is STAFF
auth.getCurrentUser = () => ({ id: 2, role: 'STAFF', fullName: 'Julian Staff' });
const activeForStaff = context.getActiveCurrencyConfig();
assert(activeForStaff.code === 'CAD' && activeForStaff.symbol === 'C$', 'getActiveCurrencyConfig returns Staff config (CAD) for STAFF role');

// When role is USER
auth.getCurrentUser = () => ({ id: 3, role: 'USER', fullName: 'Guest User' });
const activeForGuest = context.getActiveCurrencyConfig();
assert(activeForGuest.code === 'GBP' && activeForGuest.symbol === '£', 'getActiveCurrencyConfig returns Guest config (GBP) for USER role');

// When no user logged in
auth.getCurrentUser = () => null;
const activeForNull = context.getActiveCurrencyConfig();
assert(activeForNull.code === 'GBP', 'getActiveCurrencyConfig defaults to Guest config when unauthenticated');

// Test 6: Currency Formatting & Zero Double Conversion
console.log('\n--- Checking Centralized Formatter & Zero Double-Conversion ---');
auth.getCurrentUser = () => ({ id: 1, role: 'ADMIN' });
context.setAdminCountryAndCurrency('United States'); // rate: 0.012

const formatCurrency = context.window.formatCurrency;
const updateDashboardKPIs = context.window.updateDashboardKPIs;

const baseAmount = 100000;
const formattedUsd = formatCurrency(baseAmount);
assert(formattedUsd.includes('$') && formattedUsd.includes('1,200'), `formatCurrency(100000) USD output: ${formattedUsd}`);

// Zero double conversion test
const formattedUsd2 = formatCurrency(baseAmount);
assert(formattedUsd === formattedUsd2, 'Repeated formatting produces consistent results without double conversion');

context.setAdminCountryAndCurrency('Japan'); // rate: 1.8
const formattedJpy = formatCurrency(baseAmount);
assert(formattedJpy.includes('¥') && formattedJpy.includes('180,000'), `formatCurrency(100000) JPY output: ${formattedJpy}`);

context.setAdminCountryAndCurrency('United Arab Emirates'); // rate: 0.044
const formattedAed = formatCurrency(baseAmount);
assert(formattedAed.includes('د.إ') && formattedAed.includes('4,400'), `formatCurrency(100000) AED output: ${formattedAed}`);

// Test 7: Dashboard Monetary KPIs
console.log('\n--- Checking Dashboard Monetary KPI Formatting ---');
context.setAdminCountryAndCurrency('United States');
updateDashboardKPIs();

const kpiRev = domElements['kpiTotalRevenue'].textContent;
assert(kpiRev.includes('$'), `kpiTotalRevenue updated to active currency: ${kpiRev}`);
const kpiRevpar = domElements['kpiRevpar'].textContent;
assert(kpiRevpar.includes('$'), `kpiRevpar updated to active currency: ${kpiRevpar}`);
const deptDining = domElements['deptRevenueDining'].textContent;
assert(deptDining.includes('$') && deptDining.includes('18%'), `deptRevenueDining updated to active currency: ${deptDining}`);

console.log('--------------------------------------------------');
console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed`);
console.log('--------------------------------------------------');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL CURRENCY SYSTEM TESTS PASSED SUCCESSFULLY! ✓');
}
