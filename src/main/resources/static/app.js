/**
 * AURELIA GRAND LUXURY RESORT & HOTEL MANAGEMENT SYSTEM
 * Core Application Logic, State Management & Interactive Controllers
 */

// --- SOUND SYNTHESIS ENGINE (Web Audio API - No external assets required) ---
class LuxuryAudioFeedback {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playChime(type = 'bell') {
    try {
      this.init();
      if (!this.ctx || !this.enabled) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'bell') {
        // High crystal luxury chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'success') {
        // Warm chord harmonic
        const freqs = [523.25, 659.25, 783.99]; // C Major chord
        freqs.forEach((freq, idx) => {
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          chordOsc.type = 'triangle';
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.05);
          chordGain.gain.setValueAtTime(0.05, now + idx * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.05);
          chordOsc.connect(chordGain);
          chordGain.connect(this.ctx.destination);
          chordOsc.start(now + idx * 0.05);
          chordOsc.stop(now + 0.9);
        });
      }
    } catch (e) {
      console.warn('Audio feedback:', e);
    }
  }
}

const soundEngine = new LuxuryAudioFeedback();

/// --- 12 SUPPORTED CURRENCIES & EXCHANGE RATES (BASE: INR) ---
const CURRENCY_CONFIG = {
  INR: { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹', rate: 1.0, locale: 'en-IN', currencyDisplay: '₹ INR', country: 'India' },
  USD: { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$', rate: 0.012, locale: 'en-US', currencyDisplay: '$ USD', country: 'United States' },
  GBP: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£', rate: 0.0093, locale: 'en-GB', currencyDisplay: '£ GBP', country: 'United Kingdom' },
  EUR: { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€', rate: 0.011, locale: 'de-DE', currencyDisplay: '€ EUR', country: 'European Union' },
  AED: { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbol: 'د.إ', rate: 0.044, locale: 'ar-AE', currencyDisplay: 'د.إ AED', country: 'United Arab Emirates' },
  JPY: { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥', rate: 1.8, locale: 'ja-JP', currencyDisplay: '¥ JPY', country: 'Japan' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥', rate: 0.085, locale: 'zh-CN', currencyDisplay: '¥ CNY', country: 'China' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$', rate: 0.016, locale: 'en-SG', currencyDisplay: 'S$ SGD', country: 'Singapore' },
  AUD: { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$', rate: 0.018, locale: 'en-AU', currencyDisplay: 'A$ AUD', country: 'Australia' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$', rate: 0.017, locale: 'en-CA', currencyDisplay: 'C$ CAD', country: 'Canada' },
  CHF: { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'CHF', rate: 0.0105, locale: 'de-CH', currencyDisplay: 'CHF CHF', country: 'Switzerland' },
  KRW: { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', symbol: '₩', rate: 16.5, locale: 'ko-KR', currencyDisplay: '₩ KRW', country: 'South Korea' }
};
window.CURRENCY_CONFIG = CURRENCY_CONFIG;

// --- COUNTRY TO CURRENCY BIDIRECTIONAL MAPPING ---
const COUNTRY_CURRENCY_MAP = {
  'India': 'INR',
  'United States': 'USD',
  'USA': 'USD',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'European Union': 'EUR',
  'Europe': 'EUR',
  'United Arab Emirates': 'AED',
  'UAE': 'AED',
  'Japan': 'JPY',
  'China': 'CNY',
  'Singapore': 'SGD',
  'Australia': 'AUD',
  'Canada': 'CAD',
  'Switzerland': 'CHF',
  'South Korea': 'KRW'
};

const CURRENCY_COUNTRY_MAP = {
  'INR': 'India',
  'USD': 'United States',
  'GBP': 'United Kingdom',
  'EUR': 'European Union',
  'AED': 'United Arab Emirates',
  'JPY': 'Japan',
  'CNY': 'China',
  'SGD': 'Singapore',
  'AUD': 'Australia',
  'CAD': 'Canada',
  'CHF': 'Switzerland',
  'KRW': 'South Korea'
};
window.COUNTRY_CURRENCY_MAP = COUNTRY_CURRENCY_MAP;
window.CURRENCY_COUNTRY_MAP = CURRENCY_COUNTRY_MAP;

// --- PERSISTENT STORAGE KEYS (STRICTLY ROLE-ISOLATED) ---
const GUEST_CURRENCY_STORAGE_KEY = 'aurelia_guest_currency';
const ADMIN_COUNTRY_STORAGE_KEY = 'aurelia_admin_country';
const ADMIN_CURRENCY_STORAGE_KEY = 'aurelia_admin_currency';
const STAFF_COUNTRY_STORAGE_KEY = 'aurelia_staff_country';
const STAFF_CURRENCY_STORAGE_KEY = 'aurelia_staff_currency';

// ==========================================================================
// 1. GUEST CURRENCY STATE MANAGER
// ==========================================================================
function getGuestCurrency() {
  try {
    const saved = localStorage.getItem(GUEST_CURRENCY_STORAGE_KEY);
    if (saved) {
      const clean = saved.toUpperCase().trim();
      if (CURRENCY_CONFIG[clean]) return clean;
      for (const code of Object.keys(CURRENCY_CONFIG)) {
        if (clean.includes(code)) return code;
      }
    }
    return 'INR';
  } catch (e) {
    return 'INR';
  }
}

function getGuestCurrencyConfig() {
  const code = getGuestCurrency();
  return CURRENCY_CONFIG[code] || CURRENCY_CONFIG.INR;
}

function setGuestCurrency(currencyCode) {
  const code = (currencyCode || 'INR').toUpperCase().trim();
  if (!CURRENCY_CONFIG[code]) return;

  try {
    localStorage.setItem(GUEST_CURRENCY_STORAGE_KEY, code);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // Synchronize both guest dropdowns: top navbar and profile modal
  const navSelect = document.getElementById('guestCurrencySelect');
  const profileSelect = document.getElementById('guestProfileCurrencySelect');

  if (navSelect && navSelect.value !== code) {
    navSelect.value = code;
  }
  if (profileSelect && profileSelect.value !== code) {
    profileSelect.value = code;
  }

  // Audio feedback
  if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
    soundEngine.playChime('bell');
  }

  // Trigger immediate reactive re-renders
  refreshAllCurrencyViews();

  window.dispatchEvent(new CustomEvent('guestCurrencyChange', {
    detail: { currency: code, config: CURRENCY_CONFIG[code] }
  }));

  // Synchronize with backend API if logged in
  try {
    const token = (typeof AuthManager !== 'undefined' && AuthManager.getToken) ? AuthManager.getToken() : null;
    const apiUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080';
    if (token) {
      fetch(`${apiUrl}/api/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currency: code })
      }).catch(err => console.warn('[Backend Currency Sync Error]', err));
    }
  } catch (err) {
    // Non-blocking fallback
  }
}
window.setGuestCurrency = setGuestCurrency;
window.getGuestCurrency = getGuestCurrency;
window.getGuestCurrencyConfig = getGuestCurrencyConfig;

// ==========================================================================
// 2. ADMIN COUNTRY & CURRENCY STATE MANAGER
// ==========================================================================
function getAdminCountry() {
  try {
    const saved = localStorage.getItem(ADMIN_COUNTRY_STORAGE_KEY);
    if (saved && COUNTRY_CURRENCY_MAP[saved]) return saved;
    const curr = localStorage.getItem(ADMIN_CURRENCY_STORAGE_KEY);
    if (curr && CURRENCY_COUNTRY_MAP[curr]) return CURRENCY_COUNTRY_MAP[curr];
    return 'India';
  } catch (e) {
    return 'India';
  }
}

function getAdminCurrency() {
  try {
    const saved = localStorage.getItem(ADMIN_CURRENCY_STORAGE_KEY);
    if (saved) {
      const clean = saved.toUpperCase().trim();
      if (CURRENCY_CONFIG[clean]) return clean;
    }
    const country = localStorage.getItem(ADMIN_COUNTRY_STORAGE_KEY);
    if (country && COUNTRY_CURRENCY_MAP[country]) return COUNTRY_CURRENCY_MAP[country];
    return 'INR';
  } catch (e) {
    return 'INR';
  }
}

function getAdminCurrencyConfig() {
  const code = getAdminCurrency();
  const cfg = CURRENCY_CONFIG[code] || CURRENCY_CONFIG.INR;
  return {
    ...cfg,
    country: getAdminCountry()
  };
}

function setAdminCountryAndCurrency(countryOrCurrency, optionalCurrency) {
  let country = countryOrCurrency;
  let currency = optionalCurrency;

  if (!currency && country) {
    const upper = country.toUpperCase().trim();
    if (CURRENCY_CONFIG[upper]) {
      currency = upper;
      country = CURRENCY_COUNTRY_MAP[currency] || 'India';
    } else if (COUNTRY_CURRENCY_MAP[country]) {
      currency = COUNTRY_CURRENCY_MAP[country];
    } else {
      country = 'India';
      currency = 'INR';
    }
  } else if (currency && !country) {
    const upper = currency.toUpperCase().trim();
    country = CURRENCY_COUNTRY_MAP[upper] || 'India';
    currency = upper;
  }

  if (!CURRENCY_CONFIG[currency]) {
    currency = 'INR';
  }
  if (!country) {
    country = CURRENCY_COUNTRY_MAP[currency] || 'India';
  }

  try {
    localStorage.setItem(ADMIN_COUNTRY_STORAGE_KEY, country);
    localStorage.setItem(ADMIN_CURRENCY_STORAGE_KEY, currency);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // Synchronize all Admin country/currency selects
  syncAdminCurrencyDropdowns(country);

  // Audio feedback
  if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
    soundEngine.playChime('bell');
  }

  // Trigger immediate reactive re-renders
  refreshAllCurrencyViews();

  window.dispatchEvent(new CustomEvent('adminCurrencyChange', {
    detail: { country, currency, config: getAdminCurrencyConfig() }
  }));

  // Synchronize with backend API if logged in
  try {
    const token = (typeof AuthManager !== 'undefined' && AuthManager.getToken) ? AuthManager.getToken() : null;
    const apiUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080';
    if (token) {
      fetch(`${apiUrl}/api/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ country, currency })
      }).catch(err => console.warn('[Backend Admin Preference Sync Error]', err));
    }
  } catch (err) {
    // Non-blocking fallback
  }
}

function syncAdminCurrencyDropdowns(countryName) {
  const selects = [
    document.getElementById('adminCountryCurrencySelect'),
    document.getElementById('adminDashboardCountryCurrencySelect')
  ];
  selects.forEach(select => {
    if (select && select.value !== countryName) {
      select.value = countryName;
    }
  });
}
window.getAdminCountry = getAdminCountry;
window.getAdminCurrency = getAdminCurrency;
window.getAdminCurrencyConfig = getAdminCurrencyConfig;
window.setAdminCountryAndCurrency = setAdminCountryAndCurrency;
window.setAdminCountry = (country) => setAdminCountryAndCurrency(country);
window.setAdminCurrency = (currency) => setAdminCountryAndCurrency(null, currency);

// ==========================================================================
// 3. STAFF COUNTRY & CURRENCY STATE MANAGER
// ==========================================================================
function getStaffCountry() {
  try {
    const saved = localStorage.getItem(STAFF_COUNTRY_STORAGE_KEY);
    if (saved && COUNTRY_CURRENCY_MAP[saved]) return saved;
    const curr = localStorage.getItem(STAFF_CURRENCY_STORAGE_KEY);
    if (curr && CURRENCY_COUNTRY_MAP[curr]) return CURRENCY_COUNTRY_MAP[curr];
    return 'India';
  } catch (e) {
    return 'India';
  }
}

function getStaffCurrency() {
  try {
    const saved = localStorage.getItem(STAFF_CURRENCY_STORAGE_KEY);
    if (saved) {
      const clean = saved.toUpperCase().trim();
      if (CURRENCY_CONFIG[clean]) return clean;
    }
    const country = localStorage.getItem(STAFF_COUNTRY_STORAGE_KEY);
    if (country && COUNTRY_CURRENCY_MAP[country]) return COUNTRY_CURRENCY_MAP[country];
    return 'INR';
  } catch (e) {
    return 'INR';
  }
}

function getStaffCurrencyConfig() {
  const code = getStaffCurrency();
  const cfg = CURRENCY_CONFIG[code] || CURRENCY_CONFIG.INR;
  return {
    ...cfg,
    country: getStaffCountry()
  };
}

function setStaffCountryAndCurrency(countryOrCurrency, optionalCurrency) {
  let country = countryOrCurrency;
  let currency = optionalCurrency;

  if (!currency && country) {
    const upper = country.toUpperCase().trim();
    if (CURRENCY_CONFIG[upper]) {
      currency = upper;
      country = CURRENCY_COUNTRY_MAP[currency] || 'India';
    } else if (COUNTRY_CURRENCY_MAP[country]) {
      currency = COUNTRY_CURRENCY_MAP[country];
    } else {
      country = 'India';
      currency = 'INR';
    }
  } else if (currency && !country) {
    const upper = currency.toUpperCase().trim();
    country = CURRENCY_COUNTRY_MAP[upper] || 'India';
    currency = upper;
  }

  if (!CURRENCY_CONFIG[currency]) {
    currency = 'INR';
  }
  if (!country) {
    country = CURRENCY_COUNTRY_MAP[currency] || 'India';
  }

  try {
    localStorage.setItem(STAFF_COUNTRY_STORAGE_KEY, country);
    localStorage.setItem(STAFF_CURRENCY_STORAGE_KEY, currency);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // Synchronize all Staff country/currency selects
  syncStaffCurrencyDropdowns(country);

  // Audio feedback
  if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
    soundEngine.playChime('bell');
  }

  // Trigger immediate reactive re-renders
  refreshAllCurrencyViews();

  window.dispatchEvent(new CustomEvent('staffCurrencyChange', {
    detail: { country, currency, config: getStaffCurrencyConfig() }
  }));
}

function syncStaffCurrencyDropdowns(countryName) {
  const selects = [
    document.getElementById('staffCountryCurrencySelect'),
    document.getElementById('staffDashboardCountryCurrencySelect')
  ];
  selects.forEach(select => {
    if (select && select.value !== countryName) {
      select.value = countryName;
    }
  });
}
window.getStaffCountry = getStaffCountry;
window.getStaffCurrency = getStaffCurrency;
window.getStaffCurrencyConfig = getStaffCurrencyConfig;
window.setStaffCountryAndCurrency = setStaffCountryAndCurrency;
window.setStaffCountry = (country) => setStaffCountryAndCurrency(country);
window.setStaffCurrency = (currency) => setStaffCountryAndCurrency(null, currency);

// ==========================================================================
// 4. ACTIVE CURRENCY RESOLVER & REACTIVE VIEW CONTROLLERS
// ==========================================================================
function getActiveCurrencyConfig() {
  const user = typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser 
    ? AuthManager.getCurrentUser() 
    : (typeof AuthManager !== 'undefined' && AuthManager.getUser ? AuthManager.getUser() : null);
  const role = user ? user.role : 'USER';

  if (role === 'ADMIN') {
    return getAdminCurrencyConfig();
  }
  if (role === 'STAFF') {
    return getStaffCurrencyConfig();
  }
  return getGuestCurrencyConfig();
}
window.getActiveCurrencyConfig = getActiveCurrencyConfig;

// Updates Overview & Analytics KPIs (Revenue, RevPAR, ADR, Department Distribution)
function updateDashboardKPIs() {
  const prop = HOTEL_PROPERTIES[currentPropertyKey] || HOTEL_PROPERTIES.maldives;

  const revEl = document.getElementById('kpiTotalRevenue');
  if (revEl) {
    const rawRev = prop.rawRevenue !== undefined ? prop.rawRevenue : (parseFloat(String(prop.revenue).replace(/[^0-9.-]+/g, '')) || 194850);
    revEl.textContent = formatCurrency(rawRev);
  }

  const revparEl = document.getElementById('kpiRevpar');
  if (revparEl) {
    const rawRevpar = prop.rawRevpar !== undefined ? prop.rawRevpar : (parseFloat(String(prop.revpar).replace(/[^0-9.-]+/g, '')) || 542);
    revparEl.textContent = formatCurrency(rawRevpar);
  }

  const adrSub = document.getElementById('kpiAdrSubtext');
  if (adrSub) {
    const rawAdr = prop.rawAdr !== undefined ? prop.rawAdr : (parseFloat(String(prop.adr).replace(/[^0-9.-]+/g, '')) || 580);
    adrSub.innerHTML = `ADR: ${formatCurrency(rawAdr)} / night`;
  }

  // Department Revenue Distribution cards
  const deptSuites = document.getElementById('deptRevenueSuites');
  if (deptSuites) deptSuites.textContent = `${formatCurrency(3840000)} (62%)`;
  const deptDining = document.getElementById('deptRevenueDining');
  if (deptDining) deptDining.textContent = `${formatCurrency(1120000)} (18%)`;
  const deptYachts = document.getElementById('deptRevenueYachts');
  if (deptYachts) deptYachts.textContent = `${formatCurrency(740000)} (12%)`;
  const deptSpa = document.getElementById('deptRevenueSpa');
  if (deptSpa) deptSpa.textContent = `${formatCurrency(495000)} (8%)`;
}
window.updateDashboardKPIs = updateDashboardKPIs;

// Updates Financial Analytics Revenue Chart y-axis labels, ticks & legend
function updateRevenueChartCurrency() {
  if (!revenueChart) return;
  const cfg = getActiveCurrencyConfig();
  const symbol = cfg.symbol || '₹';

  if (revenueChart.data && revenueChart.data.datasets && revenueChart.data.datasets[0]) {
    revenueChart.data.datasets[0].label = `Revenue (${symbol})`;
  }

  if (revenueChart.options && revenueChart.options.scales && revenueChart.options.scales.y) {
    revenueChart.options.scales.y.ticks.callback = function(val) {
      const converted = val * (cfg.rate !== undefined ? cfg.rate : 1.0);
      if (converted >= 100000) {
        return symbol + (converted / 100000).toFixed(1) + 'L';
      } else if (converted >= 1000) {
        return symbol + (converted / 1000).toFixed(1) + 'k';
      }
      return symbol + Math.round(converted);
    };
  }

  revenueChart.update();
}
window.updateRevenueChartCurrency = updateRevenueChartCurrency;

// Unified reactive refresh for currency change without full-page reloads
function refreshAllCurrencyViews() {
  // 1. Re-render core component grids (rooms, reservations, party halls)
  if (typeof renderAllComponents === 'function') {
    renderAllComponents();
  }

  // 2. Re-render role bookings
  if (typeof renderBookingsByActiveRole === 'function') {
    renderBookingsByActiveRole();
  }

  // 3. Update overview KPIs & analytics charts
  updateDashboardKPIs();
  updateRevenueChartCurrency();

  // 4. Update Party Hall stats
  if (typeof updatePartyHallStats === 'function') {
    updatePartyHallStats();
  }

  // 5. Re-run active search if search box has input
  const currentUser = typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser 
    ? AuthManager.getCurrentUser() 
    : (typeof AuthManager !== 'undefined' && AuthManager.getUser ? AuthManager.getUser() : null);
  const role = currentUser ? currentUser.role : 'USER';

  if (role === 'ADMIN' && typeof runAdminSearch === 'function') {
    const input = document.getElementById('adminAdvancedSearchInput');
    if (input && input.value.trim()) runAdminSearch();
  } else if (role === 'STAFF' && typeof runStaffSearch === 'function') {
    const input = document.getElementById('staffAdvancedSearchInput');
    if (input && input.value.trim()) runStaffSearch();
  }

  // 6. If Booking details modal or Invoice modal is open, re-render it
  if (typeof activeModalBookingId !== 'undefined' && activeModalBookingId) {
    const detailsModal = document.getElementById('bookingDetailsModal');
    if (detailsModal && detailsModal.classList.contains('open') && typeof openBookingDetailsModal === 'function') {
      openBookingDetailsModal(activeModalBookingId);
    }
  }
  if (typeof activeInvoiceBookingId !== 'undefined' && activeInvoiceBookingId) {
    const invModal = document.getElementById('bookingInvoiceModal');
    if (invModal && invModal.classList.contains('open') && typeof openBookingInvoiceModal === 'function') {
      openBookingInvoiceModal(activeInvoiceBookingId);
    }
  }
}
window.refreshAllCurrencyViews = refreshAllCurrencyViews;

// Legacy adapter for backward compatibility
const GuestPreferenceManager = {
  DEFAULT_COUNTRY: 'India',
  DEFAULT_LANGUAGE: 'English',
  DEFAULT_CURRENCY: 'INR',

  getPreferences() {
    const cfg = getGuestCurrencyConfig();
    return {
      country: 'India',
      flag: cfg.flag,
      code: cfg.code,
      language: 'English',
      currency: cfg.code,
      currencyDisplay: cfg.currencyDisplay,
      symbol: cfg.symbol,
      locale: cfg.locale,
      rate: cfg.rate
    };
  },

  savePreferences(countryName, language) {
    // Legacy stub
  }
};
window.GuestPreferenceManager = GuestPreferenceManager;

// --- CENTRALIZED CURRENCY FORMATTER ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0;
  }
  const currCfg = getActiveCurrencyConfig();
  const rate = currCfg.rate !== undefined ? currCfg.rate : 1.0;
  const converted = amount * rate;
  const symbol = currCfg.symbol || '₹';
  const locale = currCfg.locale || (currCfg.code === 'INR' ? 'en-IN' : 'en-US');

  try {
    const numStr = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(converted));
    const needsSpace = symbol.length > 1 && !symbol.endsWith('$');
    return needsSpace ? `${symbol} ${numStr}` : `${symbol}${numStr}`;
  } catch (e) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
};
window.formatCurrency = formatCurrency;


// --- DATA STORES & MULTI-PROPERTY PORTFOLIO ---
const HOTEL_PROPERTIES = {
  maldives: {
    name: 'Aurelia Grand - Maldives Atoll',
    tagline: 'Private Lagoon & Coral Sanctuary',
    currency: '₹',
    heroImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80',
    totalRooms: 48,
    occupiedRooms: 44,
    rawRevenue: 194850,
    rawRevpar: 542,
    rawAdr: 580,
    revenue: '₹1,94,850',
    revpar: '₹542',
    adr: '₹580',
    rating: '4.98'
  },
  stmoritz: {
    name: 'Aurelia Alpine Palace - St. Moritz',
    tagline: 'Engadin Mountain Grandeur & Thermal Spa',
    currency: '₹',
    heroImage: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1600&q=80',
    totalRooms: 60,
    occupiedRooms: 55,
    rawRevenue: 228400,
    rawRevpar: 610,
    rawAdr: 665,
    revenue: '₹2,28,400',
    revpar: '₹610',
    adr: '₹665',
    rating: '4.96'
  },
  kyoto: {
    name: 'Aurelia Sanctuary - Kyoto Higashiyama',
    tagline: 'Zen Heritage Gardens & Onsen Suites',
    currency: '₹',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    totalRooms: 36,
    occupiedRooms: 33,
    rawRevenue: 18920000,
    rawRevpar: 52500,
    rawAdr: 57300,
    revenue: '₹1,89,20,000',
    revpar: '₹52,500',
    adr: '₹57,300',
    rating: '4.99'
  }
};

let currentPropertyKey = 'maldives';

// Curated Luxury Rooms Data
let ROOMS_DATA = [
  {
    id: 'R-701',
    number: '701',
    name: 'The Imperial Ocean Penthouse',
    type: 'Penthouse',
    category: 'penthouse',
    price: 3450,
    rating: 5.0,
    status: 'occupied',
    guest: 'Lord & Lady Wellington',
    guestVip: 'diamond',
    floor: '7th Floor',
    size: '340 m²',
    capacity: '4 Guests',
    features: ['Private Infinity Pool', '24/7 Royal Butler', 'Helipad Access', 'Wine Cellar'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'The pinnacle of barefoot luxury. Suspended above the azure lagoon with 360-degree ocean views, glass floor observatory, bespoke Italian marble, and private steam room.'
  },
  {
    id: 'R-702',
    number: '702',
    name: 'The Royal Horizon Penthouse',
    type: 'Penthouse',
    category: 'penthouse',
    price: 3200,
    rating: 4.98,
    status: 'available',
    guest: null,
    guestVip: null,
    floor: '7th Floor',
    size: '310 m²',
    capacity: '4 Guests',
    features: ['Sunset Observation Deck', 'Dornbracht Spa Baths', 'Private Teppanyaki Kitchen'],
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Elevated duplex penthouse offering celestial panoramic skylights, custom bronze finishes, and dedicated sommelier service on demand.'
  },
  {
    id: 'R-602',
    number: '602',
    name: 'Royal Lagoon Overwater Villa',
    type: 'Villa',
    category: 'villa',
    price: 2150,
    rating: 4.95,
    status: 'occupied',
    guest: 'Sophia Lorenze (CEO, Veloce)',
    guestVip: 'gold',
    floor: 'Overwater Pier',
    size: '220 m²',
    capacity: '2 Guests',
    features: ['Direct Coral Reef Drop', 'Sunset Jacuzzi', 'Private Chef Dining', 'B&O Sound'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A secluded overwater haven featuring direct glass-stair access to the coral reef, an infinity plunge pool, and starlight outdoor rain showers.'
  },
  {
    id: 'R-605',
    number: '605',
    name: 'Coral Reef Sunset Villa',
    type: 'Villa',
    category: 'villa',
    price: 1980,
    rating: 4.92,
    status: 'available',
    guest: null,
    guestVip: null,
    floor: 'Overwater Pier',
    size: '205 m²',
    capacity: '2 Guests',
    features: ['Hammock Over Lagoon', 'Retractable Star Roof', 'Private Jet Ski Dock'],
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Positioned west to witness the world-famous golden sunsets, accompanied by private butler champagne sabering ceremonies.'
  },
  {
    id: 'R-504',
    number: '504',
    name: 'Presidential Sky Suite',
    type: 'Suite',
    category: 'suite',
    price: 1850,
    rating: 4.95,
    status: 'available',
    guest: null,
    guestVip: null,
    floor: '5th Floor',
    size: '180 m²',
    capacity: '3 Guests',
    features: ['Panoramic Balcony', 'Bulgari Amenities', 'Cocktail Bar', 'Dual Rainforest Shower'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Sophisticated modern sanctuary with bespoke walnut millwork, tailored silk drapes, deep-soaking bathtub overlooking the ocean skyline.'
  },
  {
    id: 'R-408',
    number: '408',
    name: 'Azure Grand Pavilion Suite',
    type: 'Suite',
    category: 'suite',
    price: 1420,
    rating: 4.88,
    status: 'maintenance',
    guest: 'Housekeeping / Deep Sanitization',
    guestVip: null,
    floor: '4th Floor',
    size: '140 m²',
    capacity: '2 Guests',
    features: ['Tropical Garden View', 'King Featherbed', 'Espresso Lab', 'Private Terrace'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Surrounded by lush orchids and gentle ocean breezes, designed for tranquil restorative stays with organic linen and aromatherapy diffusers.'
  },
  {
    id: 'R-305',
    number: '305',
    name: 'Deluxe Coral Oceanfront',
    type: 'Deluxe',
    category: 'deluxe',
    price: 980,
    rating: 4.85,
    status: 'available',
    guest: null,
    guestVip: null,
    floor: '3rd Floor',
    size: '95 m²',
    capacity: '2 Guests',
    features: ['Lagoon View Deck', 'King Bed', 'Artisan Mini Bar', 'Smart Room Controls'],
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Refined comfort with an unobstructed vantage of the crystal shallows, curated art pieces, and custom organic botanical bath salts.'
  },
  {
    id: 'R-202',
    number: '202',
    name: 'Bespoke Executive Terrace',
    type: 'Deluxe',
    category: 'deluxe',
    price: 890,
    rating: 4.9,
    status: 'occupied',
    guest: 'Ambassador Jean Dupont',
    guestVip: 'diamond',
    floor: '2nd Floor',
    size: '88 m²',
    capacity: '2 Guests',
    features: ['Private Cabana', 'Hermès Toiletries', 'Executive Desk', 'High-Speed Satellite'],
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Engineered for discerning global leaders who require seamless tranquility, confidential workspaces, and exceptional concierge services.'
  },
  {
    id: 'SUITE-205',
    number: '205',
    name: 'Royal Grand Suite',
    type: 'Suite',
    category: 'suite',
    price: 30000,
    rating: 4.96,
    status: 'occupied',
    guest: 'John Doe',
    guestVip: 'gold',
    floor: '2nd Floor',
    size: '165 m²',
    capacity: '3 Guests',
    features: ['Private Butler', 'Panoramic Lagoon Terrace', 'Jacuzzi Spa', 'Walk-in Wardrobe'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An opulent royal suite featuring panoramic terrace vistas, tailored luxury furnishings, deep soaking marble tub, and bespoke concierge privileges.'
  },
  {
    id: 'ROOM-101',
    number: '101',
    name: 'Deluxe Oceanfront Suite',
    type: 'Deluxe',
    category: 'deluxe',
    price: 18000,
    rating: 4.88,
    status: 'available',
    guest: null,
    guestVip: null,
    floor: '1st Floor',
    size: '95 m²',
    capacity: '2 Guests',
    features: ['Direct Beach Walkout', 'Artisan Mini Bar', 'Rain Shower', 'King Featherbed'],
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Ground level ocean sanctuary with immediate access to powdery sands, artisan espresso bar, and private garden patio.'
  }
];

// Initial Reservations Data
let RESERVATIONS_DATA = [
  {
    id: 'AG-2026-00124',
    guestId: 'GST-1024',
    guestName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    vipTier: 'gold',
    roomNumber: '205',
    roomId: 'SUITE-205',
    roomType: 'Royal Grand Suite',
    dates: '12 Oct - 16 Oct 2026',
    nights: 4,
    rawTotal: 120000,
    total: '₹1,20,000',
    status: 'Confirmed',
    payment: 'Paid (Visa Infinite)'
  },
  {
    id: 'RES-8821',
    guestName: 'Lord Arthur Wellington',
    email: 'a.wellington@duchy.co.uk',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    vipTier: 'diamond',
    roomNumber: '701',
    roomType: 'The Imperial Ocean Penthouse',
    dates: 'Sep 02 - Sep 09, 2026',
    nights: 7,
    rawTotal: 24150,
    total: '₹24,150',
    status: 'Checked In',
    payment: 'Paid (Amex Centurion)'
  },
  {
    id: 'RES-8822',
    guestName: 'Sophia Lorenze',
    email: 'sophia@veloce-holding.ch',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    vipTier: 'gold',
    roomNumber: '602',
    roomType: 'Royal Lagoon Villa',
    dates: 'Sep 03 - Sep 07, 2026',
    nights: 4,
    rawTotal: 8600,
    total: '₹8,600',
    status: 'Checked In',
    payment: 'Pre-Authorized'
  },
  {
    id: 'RES-8823',
    guestName: 'Ambassador Jean Dupont',
    email: 'j.dupont@diplomatie.fr',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    vipTier: 'diamond',
    roomNumber: '202',
    roomType: 'Bespoke Exec Terrace',
    dates: 'Sep 04 - Sep 11, 2026',
    nights: 7,
    rawTotal: 6230,
    total: '₹6,230',
    status: 'Checked In',
    payment: 'Direct Billing'
  },
  {
    id: 'RES-8824',
    guestName: 'Elena Rostova',
    email: 'elena.rostova@monaco-yachts.mc',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    vipTier: 'silver',
    roomNumber: '504',
    roomType: 'Presidential Sky Suite',
    dates: 'Sep 05 - Sep 10, 2026',
    nights: 5,
    rawTotal: 9250,
    total: '₹9,250',
    status: 'Confirmed',
    payment: 'Deposit Received'
  },
  {
    id: 'RES-8825',
    guestName: 'Dr. Hiroshi Tanaka',
    email: 'tanaka@tokyo-biotech.jp',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    vipTier: 'gold',
    roomNumber: '305',
    roomType: 'Deluxe Coral Oceanfront',
    dates: 'Sep 06 - Sep 12, 2026',
    nights: 6,
    rawTotal: 5880,
    total: '₹5,880',
    status: 'Confirmed',
    payment: 'Paid (Visa Infinite)'
  }
];

// Initial Concierge Requests
let CONCIERGE_REQUESTS = [
  {
    id: 'REQ-101',
    suite: 'Suite 701 (Wellington)',
    title: 'Vintage Dom Pérignon P2 (2004) & Beluga Caviar',
    time: '8 mins ago',
    priority: 'urgent',
    assignedTo: 'Executive Sommelier',
    status: 'Pending'
  },
  {
    id: 'REQ-102',
    suite: 'Villa 602 (Lorenze)',
    title: 'Private Sunset Catamaran Charter to Baa Atoll',
    time: '24 mins ago',
    priority: 'normal',
    assignedTo: 'Marine Concierge',
    status: 'Pending'
  },
  {
    id: 'REQ-103',
    suite: 'Suite 202 (Amb. Dupont)',
    title: 'Rolls Royce Phantom Transfer - Velana Int Airport',
    time: '42 mins ago',
    priority: 'urgent',
    assignedTo: 'VIP Chauffeur Desk',
    status: 'Pending'
  },
  {
    id: 'REQ-104',
    suite: 'Spa Sanctuary',
    title: 'Couples 90-min Gold Leaf Ritual & Herbal Steam',
    time: '1 hr ago',
    priority: 'normal',
    assignedTo: 'Azure Wellness Spa',
    status: 'In Progress'
  }
];

// --- CHARTS INSTANCES ---
let revenueChart = null;
let categoryChart = null;

// ==========================================================================
// AUTHENTICATION & SECURITY CONTROLLER (JWT & RBAC)
// ==========================================================================

const API_BASE_URL = (typeof window !== 'undefined' && window.__API_BASE_URL__)
  ? window.__API_BASE_URL__
  : ((typeof window !== 'undefined' && window.location && window.location.port === '8080')
      ? window.location.origin
      : 'http://localhost:8080');

const AUTH_STORAGE_KEY_TOKEN = 'aurelia_auth_token';
const AUTH_STORAGE_KEY_USER = 'aurelia_auth_user';

const AuthManager = {
  getToken() {
    return localStorage.getItem(AUTH_STORAGE_KEY_TOKEN) || sessionStorage.getItem(AUTH_STORAGE_KEY_TOKEN);
  },

  getUser() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY_USER) || sessionStorage.getItem(AUTH_STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (u && (u.role === 'GUEST' || u.role === 'USER')) u.role = 'GUEST';
      return u;
    } catch (e) {
      return null;
    }
  },

  getCurrentUser() {
    return this.getUser();
  },

  saveSession(token, user, rememberMe) {
    if (user && (user.role === 'GUEST' || user.role === 'USER')) {
      user.role = 'GUEST';
    }
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY_TOKEN, token);
      localStorage.setItem(AUTH_STORAGE_KEY_USER, JSON.stringify(user));
      sessionStorage.removeItem(AUTH_STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(AUTH_STORAGE_KEY_USER);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY_TOKEN, token);
      sessionStorage.setItem(AUTH_STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.removeItem(AUTH_STORAGE_KEY_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEY_USER);
    }
  },

  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEY_USER);
    sessionStorage.removeItem(AUTH_STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(AUTH_STORAGE_KEY_USER);
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },

  async verifyTokenWithBackend() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const data = await response.json();
      if (data.success && data.user) {
        // Refresh local user profile
        const rememberMe = Boolean(localStorage.getItem(AUTH_STORAGE_KEY_TOKEN));
        this.saveSession(token, data.user, rememberMe);
        return data.user;
      }

      this.clearSession();
      return null;
    } catch (err) {
      console.warn('[Auth] Server check failed:', err);
      // If offline or network error, fallback to stored user if available
      return this.getUser();
    }
  }
};
window.AuthManager = AuthManager;

// --- LOGIN MODE CONTROLLER ---
let currentLoginMode = 'guest';

function setLoginMode(mode) {
  currentLoginMode = mode;
  const authContainer = document.getElementById('authViewContainer');
  const adminStaffBar = document.getElementById('adminStaffModeBar');
  const guestBrandBlock = document.getElementById('guestBrandBlock');
  const guestWelcomeBlock = document.getElementById('guestWelcomeBlock');
  const guestStaffLink = document.getElementById('guestStaffAccessLink');
  const adminReturnLink = document.getElementById('adminReturnGuestLink');
  const authTitle = document.getElementById('authModeTitle');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const chipAdmin = document.getElementById('chipAdmin');
  const chipStaff = document.getElementById('chipStaff');
  const chipUser = document.getElementById('chipUser');
  const btnText = document.getElementById('loginBtnText');

  // Remove active state from all chips
  [chipAdmin, chipStaff, chipUser].forEach(chip => {
    if (chip) chip.classList.remove('active');
  });

  if (mode === 'guest' || mode === 'user') {
    currentLoginMode = 'guest';
    if (authContainer) authContainer.classList.remove('mode-admin-staff');
    if (adminStaffBar) adminStaffBar.style.display = 'none';
    if (guestBrandBlock) guestBrandBlock.style.display = 'block';
    if (guestWelcomeBlock) guestWelcomeBlock.style.display = 'block';
    if (guestStaffLink) guestStaffLink.style.display = 'block';
    if (adminReturnLink) adminReturnLink.style.display = 'none';
    if (chipUser) chipUser.classList.add('active');
    if (authTitle) authTitle.textContent = 'GUEST LOGIN';
    if (emailInput) emailInput.placeholder = 'Enter your email';
    if (passInput) passInput.placeholder = 'Enter your password';
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
  } else if (mode === 'admin') {
    currentLoginMode = 'admin';
    if (authContainer) authContainer.classList.add('mode-admin-staff');
    if (adminStaffBar) adminStaffBar.style.display = 'block';
    if (guestBrandBlock) guestBrandBlock.style.display = 'none';
    if (guestWelcomeBlock) guestWelcomeBlock.style.display = 'none';
    if (guestStaffLink) guestStaffLink.style.display = 'none';
    if (adminReturnLink) adminReturnLink.style.display = 'block';
    if (chipAdmin) chipAdmin.classList.add('active');
    if (authTitle) authTitle.textContent = 'ADMIN LOGIN';
    if (emailInput) emailInput.placeholder = 'e.g. admin@aureliagrand.com';
    if (passInput) passInput.placeholder = 'Enter your security access key...';
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-door-open"></i> Sign In to Hotel Portal';
  } else if (mode === 'staff') {
    currentLoginMode = 'staff';
    if (authContainer) authContainer.classList.add('mode-admin-staff');
    if (adminStaffBar) adminStaffBar.style.display = 'block';
    if (guestBrandBlock) guestBrandBlock.style.display = 'none';
    if (guestWelcomeBlock) guestWelcomeBlock.style.display = 'none';
    if (guestStaffLink) guestStaffLink.style.display = 'none';
    if (adminReturnLink) adminReturnLink.style.display = 'block';
    if (chipStaff) chipStaff.classList.add('active');
    if (authTitle) authTitle.textContent = 'STAFF LOGIN';
    if (emailInput) emailInput.placeholder = 'e.g. staff@aureliagrand.com';
    if (passInput) passInput.placeholder = 'Enter your security access key...';
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-door-open"></i> Sign In to Hotel Portal';
  }
}
window.setLoginMode = setLoginMode;

// Global helper for quick test credentials
window.fillCredentials = function(role) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  clearAuthErrors();

  if (role === 'admin') {
    setLoginMode('admin');
    if (emailInput) emailInput.value = 'admin@aureliagrand.com';
    if (passwordInput) passwordInput.value = 'AdminPassword123!';
  } else if (role === 'staff') {
    setLoginMode('staff');
    if (emailInput) emailInput.value = 'staff@aureliagrand.com';
    if (passwordInput) passwordInput.value = 'StaffPassword123!';
  } else if (role === 'user' || role === 'guest') {
    setLoginMode('guest');
    if (emailInput) emailInput.value = 'user@aureliagrand.com';
    if (passwordInput) passwordInput.value = 'UserPassword123!';
  }

  soundEngine.playChime('bell');
};

// --- ADMIN & STAFF COUNTRY/CURRENCY CONTROLLERS ---
function initAdminCurrencyUI() {
  const currentCountry = getAdminCountry();
  const selects = [
    document.getElementById('adminCountryCurrencySelect'),
    document.getElementById('adminDashboardCountryCurrencySelect')
  ];

  selects.forEach(select => {
    if (select) {
      select.value = currentCountry;
      if (!select.dataset.currencyBound) {
        select.dataset.currencyBound = 'true';
        select.addEventListener('change', (e) => {
          setAdminCountryAndCurrency(e.target.value);
        });
      }
    }
  });
}
window.initAdminCurrencyUI = initAdminCurrencyUI;

function initStaffCurrencyUI() {
  const currentCountry = getStaffCountry();
  const selects = [
    document.getElementById('staffCountryCurrencySelect'),
    document.getElementById('staffDashboardCountryCurrencySelect')
  ];

  selects.forEach(select => {
    if (select) {
      select.value = currentCountry;
      if (!select.dataset.currencyBound) {
        select.dataset.currencyBound = 'true';
        select.addEventListener('change', (e) => {
          setStaffCountryAndCurrency(e.target.value);
        });
      }
    }
  });
}
window.initStaffCurrencyUI = initStaffCurrencyUI;

// --- POST-LOGIN GUEST CURRENCY SELECTOR & PROFILE MODAL CONTROLLERS ---
function initGuestCurrencyUI() {
  const navCurrencySelect = document.getElementById('guestCurrencySelect');
  const profileCurrencySelect = document.getElementById('guestProfileCurrencySelect');
  const currentCurr = getGuestCurrency();

  if (navCurrencySelect) {
    navCurrencySelect.value = currentCurr;
    navCurrencySelect.addEventListener('change', (e) => {
      setGuestCurrency(e.target.value);
    });
  }

  if (profileCurrencySelect) {
    profileCurrencySelect.value = currentCurr;
    profileCurrencySelect.addEventListener('change', (e) => {
      setGuestCurrency(e.target.value);
    });
  }

  // Profile Pill click triggers Guest Profile Modal for guest users
  const userProfilePill = document.getElementById('userProfilePill');
  if (userProfilePill) {
    userProfilePill.addEventListener('click', (e) => {
      if (e.target.closest('#navLogoutBtn')) return;
      const user = AuthManager.getUser();
      if (user && (user.role === 'GUEST' || user.role === 'USER')) {
        openGuestProfileModal();
      }
    });
  }
}

function openGuestProfileModal() {
  const modal = document.getElementById('guestProfileModal');
  const user = AuthManager.getUser();
  if (user) {
    const nameEl = document.getElementById('profileModalName');
    const emailEl = document.getElementById('profileModalEmail');
    const avatarEl = document.getElementById('profileModalAvatar');
    if (nameEl) nameEl.textContent = user.fullName || 'VIP Guest';
    if (emailEl) emailEl.textContent = user.email || 'user@aureliagrand.com';
    if (avatarEl && document.getElementById('currentUserAvatar')) {
      avatarEl.src = document.getElementById('currentUserAvatar').src;
    }
  }
  const currSelect = document.getElementById('guestProfileCurrencySelect');
  if (currSelect) currSelect.value = getGuestCurrency();

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}
window.openGuestProfileModal = openGuestProfileModal;

function closeGuestProfileModal() {
  const modal = document.getElementById('guestProfileModal');
  if (modal) modal.classList.remove('open');
}
window.closeGuestProfileModal = closeGuestProfileModal;


// Global helper for forgot password modal
window.closeForgotPasswordModal = function() {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) modal.classList.remove('open');
};

function clearAuthErrors() {
  const emailErr = document.getElementById('emailErrorMsg');
  const passErr = document.getElementById('passwordErrorMsg');
  const alertBanner = document.getElementById('authAlertBanner');
  const emailWrapper = document.getElementById('emailInputWrapper');
  const passWrapper = document.getElementById('passwordInputWrapper');

  if (emailErr) emailErr.classList.remove('visible');
  if (passErr) passErr.classList.remove('visible');
  if (alertBanner) alertBanner.style.display = 'none';
  if (emailWrapper) emailWrapper.classList.remove('input-error');
  if (passWrapper) passWrapper.classList.remove('input-error');
}

function showAuthAlert(message) {
  const banner = document.getElementById('authAlertBanner');
  const text = document.getElementById('authAlertText');
  if (banner && text) {
    text.textContent = message;
    banner.style.display = 'flex';
  }
}

function updateProfileDisplay(user) {
  if (!user) return;
  const nameEl = document.getElementById('currentUserName');
  const roleEl = document.getElementById('currentUserRole');
  const avatarEl = document.getElementById('currentUserAvatar');

  if (nameEl) nameEl.textContent = user.fullName || 'Authorized User';

  let roleBadgeClass = 'badge-user';
  let roleTitle = 'VIP Guest';
  let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

  const role = (user.role === 'USER' || user.role === 'GUEST') ? 'GUEST' : (user.role || '').toUpperCase();

  if (role === 'ADMIN') {
    roleBadgeClass = 'badge-admin';
    roleTitle = 'Managing Director';
    avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80';
  } else if (role === 'STAFF') {
    roleBadgeClass = 'badge-staff';
    roleTitle = 'Concierge Supervisor';
    avatarUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80';
  } else {
    roleBadgeClass = 'badge-user';
    roleTitle = 'VIP Guest';
    avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
  }

  if (roleEl) {
    roleEl.innerHTML = `<span class="badge-role ${roleBadgeClass}">${role}</span> ${roleTitle}`;
  }

  if (avatarEl) {
    avatarEl.src = avatarUrl;
    avatarEl.alt = user.fullName;
  }
}

function updateGuestDashboardUI() {
  const allBookings = typeof loadBookings === 'function' ? loadBookings() : [];
  const currentUser = typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser ? AuthManager.getCurrentUser() : null;
  const userEmail = currentUser ? currentUser.email : 'user@aureliagrand.com';

  const userBookings = allBookings.filter(b => 
    b.guestEmail === userEmail || b.userEmail === userEmail || (b.guestEmail === 'user@aureliagrand.com' || !b.guestEmail)
  );

  // 1. Guest KPI Cards
  const bookingsCountEl = document.getElementById('guestKpiBookingsCount');
  if (bookingsCountEl) bookingsCountEl.textContent = userBookings.length;

  const favCountEl = document.getElementById('guestKpiFavoritesCount');
  if (favCountEl && typeof getFavoriteRoomIds === 'function') {
    favCountEl.textContent = getFavoriteRoomIds().length;
  }

  const roomsCountEl = document.getElementById('guestKpiRoomsCount');
  if (roomsCountEl && typeof ROOMS_DATA !== 'undefined') {
    roomsCountEl.textContent = ROOMS_DATA.length;
  }

  const hallsCountEl = document.getElementById('guestKpiHallsCount');
  if (hallsCountEl && typeof PARTY_HALLS_DATA !== 'undefined') {
    hallsCountEl.textContent = PARTY_HALLS_DATA.length;
  }

  // 2. Guest Welcome Banner Name
  const welcomeNameEl = document.getElementById('guestWelcomeName');
  if (welcomeNameEl && currentUser) {
    welcomeNameEl.textContent = currentUser.fullName || 'Valued Guest';
  }

  // 3. Guest Overview Recent Stays Card
  const recentStaysEl = document.getElementById('guestOverviewRecentStays');
  if (recentStaysEl) {
    if (userBookings.length > 0) {
      const latest = userBookings[0];
      recentStaysEl.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(212, 175, 55, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent-gold); font-size: 1.2rem;">
              <i class="fa-solid fa-hotel"></i>
            </div>
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 600;">${latest.title || 'Sanctuary Suite'}</h4>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Check-in: ${latest.checkIn || 'Upcoming'} &bull; Folio #${latest.id}</span>
            </div>
          </div>
          <span class="trend-badge positive">${latest.status || 'Confirmed'}</span>
        </div>
      `;
    } else {
      recentStaysEl.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(212, 175, 55, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent-gold); font-size: 1.2rem;">
              <i class="fa-solid fa-calendar-plus"></i>
            </div>
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 600;">No Active Reservations</h4>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Reserve a villa or sky suite with bespoke butler service</span>
            </div>
          </div>
          <button class="btn-primary-luxury" style="padding: 6px 14px; font-size: 0.8rem;" onclick="openRoomBookingWizard()">Reserve Suite</button>
        </div>
      `;
    }
  }

  // 4. Featured Luxury Suites Grid in Guest Overview
  const featuredRoomsEl = document.getElementById('guestOverviewFeaturedRooms');
  if (featuredRoomsEl && typeof ROOMS_DATA !== 'undefined') {
    const favIds = typeof getFavoriteRoomIds === 'function' ? getFavoriteRoomIds() : [];
    const featured = ROOMS_DATA.slice(0, 4);
    featuredRoomsEl.innerHTML = featured.map(room => {
      const isFav = favIds.includes(room.id);
      return `
        <div class="room-card" data-id="${room.id}">
          <div class="room-image-wrapper">
            <img src="${room.image}" alt="${room.name}" loading="lazy" />
            <div class="room-badge-overlay">
              <span class="room-number-tag">Suite ${room.number}</span>
              <span class="room-status-badge status-available">Available</span>
            </div>
            <button type="button" 
                    class="room-favorite-btn ${isFav ? 'is-favorite' : ''}" 
                    data-room-id="${room.id}"
                    title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" 
                    aria-label="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}"
                    onclick="event.stopPropagation(); toggleFavorite('${room.id}', this)">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="room-rating-overlay">
              <i class="fa-solid fa-star"></i>
              <span>${room.rating.toFixed(1)}</span>
            </div>
          </div>
          <div class="room-body">
            <span class="room-type-tier">${room.type} • ${room.floor}</span>
            <h3 class="room-title">${room.name}</h3>
            <div class="room-current-guest">
              <span><i class="fa-solid fa-gem" style="color: var(--accent-gold); margin-right: 6px;"></i> Sanctuary Status:</span>
              <span class="guest-name" style="color: #10b981; font-weight: 600;">Available for Reservation</span>
            </div>
            <div class="room-footer">
              <div class="room-price">
                <span class="amount">${formatCurrency(room.price)}</span>
                <span class="period">per night</span>
              </div>
              <div class="room-card-actions">
                <button class="btn-icon-square view-details-btn" title="View Details & Gallery" onclick="openRoomDetailsModal('${room.id}')">
                  <i class="fa-regular fa-eye"></i>
                </button>
                <button class="btn-icon-square" title="Book this suite" style="background: var(--accent-gold); color: #0b0f17;" onclick="openReservationModalWithRoom('${room.id}')">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}
window.updateGuestDashboardUI = updateGuestDashboardUI;

function applyRoleBasedAccess(role) {
  const normRole = (role === 'USER' || role === 'GUEST') ? 'GUEST' : (role || '').toUpperCase();

  const analyticsNav = document.querySelector('.sidebar-nav .nav-item[data-target="tabAnalytics"]');
  const analyticsTabBtn = document.querySelector('.tab-btn[data-target="tabAnalytics"]');
  const roomsNav = document.querySelector('.sidebar-nav .nav-item[data-target="tabRooms"]');
  const conciergeNav = document.querySelector('.sidebar-nav .nav-item[data-target="tabConcierge"]');
  const conciergeTabBtn = document.querySelector('.tab-btn[data-target="tabConcierge"]');

  // Party Hall Nav items (available for ALL 3 roles: ADMIN, STAFF, GUEST)
  const partyHallsNav = document.getElementById('navPartyHalls');
  const partyHallsTabBtn = document.getElementById('tabBtnPartyHalls');
  if (partyHallsNav) partyHallsNav.style.display = 'flex';
  if (partyHallsTabBtn) partyHallsTabBtn.style.display = 'inline-flex';

  // Role-specific Party Hall Controls
  const adminHallControls = document.getElementById('adminHallControls');
  const staffHallControls = document.getElementById('staffHallControls');
  const userHallControls = document.getElementById('userHallControls');
  const adminRevenueStatCard = document.getElementById('adminRevenueStatCard');

  // Currency Selectors per role (inspected and strictly role-isolated)
  const guestCurrencyPill = document.getElementById('guestCurrencyPill');
  const adminCurrencyPill = document.getElementById('adminCurrencyPill');
  const staffCurrencyPill = document.getElementById('staffCurrencyPill');

  if (guestCurrencyPill) {
    guestCurrencyPill.style.display = (normRole === 'GUEST') ? 'flex' : 'none';
  }
  if (adminCurrencyPill) {
    adminCurrencyPill.style.display = (normRole === 'ADMIN') ? 'flex' : 'none';
  }
  if (staffCurrencyPill) {
    staffCurrencyPill.style.display = (normRole === 'STAFF') ? 'flex' : 'none';
  }

  // Favorites Navigation Items (EXCLUSIVELY for GUEST role; hidden for Admin & Staff)
  const navFavorites = document.getElementById('navFavorites');
  const tabBtnFavorites = document.getElementById('tabBtnFavorites');
  const tabFavorites = document.getElementById('tabFavorites');

  // Bookings Role Views & Navigation Text
  const guestBookingsView = document.getElementById('guestBookingsView');
  const adminBookingsView = document.getElementById('adminBookingsView');
  const staffBookingsView = document.getElementById('staffBookingsView');
  const navReservationsText = document.getElementById('navReservationsText');
  const tabBtnReservationsText = document.getElementById('tabBtnReservationsText');

  // Advanced Search Sections (EXCLUSIVELY for Admin & Staff; strictly hidden for Guest)
  const adminAdvancedSearchSec = document.getElementById('adminAdvancedSearchSection');
  const staffAdvancedSearchSec = document.getElementById('staffAdvancedSearchSection');

  // Sidebar & Top Tab Text Elements
  const navSectionTitleCore = document.getElementById('navSectionTitleCore');
  const navOverview = document.getElementById('navOverview');
  const navOverviewText = document.getElementById('navOverviewText');
  const tabBtnOverview = document.getElementById('tabBtnOverview');
  const tabBtnOverviewText = document.getElementById('tabBtnOverviewText');
  const navRooms = document.getElementById('navRooms');
  const navRoomsText = document.getElementById('navRoomsText');
  const tabBtnRooms = document.getElementById('tabBtnRooms');
  const tabBtnRoomsText = document.getElementById('tabBtnRoomsText');

  // Header & KPI elements
  const exportReportBtn = document.getElementById('exportReportBtn');
  const heroOccupancyBadge = document.getElementById('heroOccupancyBadge');
  const managementKpiGrid = document.getElementById('managementKpiGrid');
  const guestKpiGrid = document.getElementById('guestKpiGrid');
  const managementOverviewView = document.getElementById('managementOverviewView');
  const guestOverviewView = document.getElementById('guestOverviewView');
  const roomInventoryActions = document.getElementById('roomInventoryActions');
  const universalSearchInput = document.getElementById('universalSearchInput');

  if (normRole === 'ADMIN') {
    // Admin has full access to everything
    if (analyticsNav) analyticsNav.style.display = 'flex';
    if (analyticsTabBtn) analyticsTabBtn.style.display = 'inline-flex';
    if (roomsNav) roomsNav.style.display = 'flex';
    if (conciergeNav) conciergeNav.style.display = 'flex';
    if (conciergeTabBtn) conciergeTabBtn.style.display = 'inline-flex';

    if (navFavorites) navFavorites.style.display = 'none';
    if (tabBtnFavorites) tabBtnFavorites.style.display = 'none';
    if (tabFavorites) tabFavorites.style.display = 'none';
    if (document.querySelector('.tab-pane#tabFavorites.active')) {
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const ovPane = document.getElementById('tabOverview');
      if (ovPane) ovPane.classList.add('active');
    }

    if (adminHallControls) adminHallControls.style.display = 'flex';
    if (staffHallControls) staffHallControls.style.display = 'none';
    if (userHallControls) userHallControls.style.display = 'none';
    if (adminRevenueStatCard) adminRevenueStatCard.style.display = 'flex';

    if (guestBookingsView) guestBookingsView.style.display = 'none';
    if (adminBookingsView) adminBookingsView.style.display = 'block';
    if (staffBookingsView) staffBookingsView.style.display = 'none';

    // Advanced Search Section: Visible only in Admin
    if (adminAdvancedSearchSec) adminAdvancedSearchSec.style.display = 'block';
    if (staffAdvancedSearchSec) staffAdvancedSearchSec.style.display = 'none';

    // Header & KPI elements for Admin
    if (exportReportBtn) exportReportBtn.style.display = '';
    if (heroOccupancyBadge) heroOccupancyBadge.style.display = '';
    if (managementKpiGrid) managementKpiGrid.style.display = '';
    if (guestKpiGrid) guestKpiGrid.style.display = 'none';
    if (managementOverviewView) managementOverviewView.style.display = 'block';
    if (guestOverviewView) guestOverviewView.style.display = 'none';
    if (roomInventoryActions) roomInventoryActions.style.display = 'flex';
    if (universalSearchInput) universalSearchInput.placeholder = 'Search suite, guest name, or ID...';

    if (navSectionTitleCore) navSectionTitleCore.textContent = 'Core Management';
    if (navOverviewText) navOverviewText.textContent = 'Dashboard Overview';
    if (tabBtnOverviewText) tabBtnOverviewText.textContent = 'Overview & Analytics';
    if (navRoomsText) navRoomsText.textContent = 'Suites & Inventory';
    if (tabBtnRoomsText) tabBtnRoomsText.textContent = 'Suites & Room Inventory';
    if (navReservationsText) navReservationsText.textContent = 'Bookings & Guests';
    if (tabBtnReservationsText) tabBtnReservationsText.textContent = 'Bookings & Directory';

    if (typeof renderAdminBookings === 'function') renderAdminBookings();
    if (typeof runAdminSearch === 'function') runAdminSearch();
    if (typeof updateDashboardKPIs === 'function') updateDashboardKPIs();

  } else if (normRole === 'STAFF') {
    // Staff has hotel operations access; Financial analytics tab is restricted
    if (analyticsNav) analyticsNav.style.display = 'none';
    if (analyticsTabBtn) analyticsTabBtn.style.display = 'none';
    if (roomsNav) roomsNav.style.display = 'flex';
    if (conciergeNav) conciergeNav.style.display = 'flex';
    if (conciergeTabBtn) conciergeTabBtn.style.display = 'inline-flex';

    if (navFavorites) navFavorites.style.display = 'none';
    if (tabBtnFavorites) tabBtnFavorites.style.display = 'none';
    if (tabFavorites) tabFavorites.style.display = 'none';
    if (document.querySelector('.tab-pane#tabFavorites.active')) {
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const rmPane = document.getElementById('tabRooms');
      if (rmPane) rmPane.classList.add('active');
    }

    if (adminHallControls) adminHallControls.style.display = 'none';
    if (staffHallControls) staffHallControls.style.display = 'flex';
    if (userHallControls) userHallControls.style.display = 'none';
    if (adminRevenueStatCard) adminRevenueStatCard.style.display = 'none';

    if (guestBookingsView) guestBookingsView.style.display = 'none';
    if (adminBookingsView) adminBookingsView.style.display = 'none';
    if (staffBookingsView) staffBookingsView.style.display = 'block';

    // Advanced Search Section: Visible only in Staff
    if (adminAdvancedSearchSec) adminAdvancedSearchSec.style.display = 'none';
    if (staffAdvancedSearchSec) staffAdvancedSearchSec.style.display = 'block';

    // Header & KPI elements for Staff
    if (exportReportBtn) exportReportBtn.style.display = '';
    if (heroOccupancyBadge) heroOccupancyBadge.style.display = '';
    if (managementKpiGrid) managementKpiGrid.style.display = '';
    if (guestKpiGrid) guestKpiGrid.style.display = 'none';
    if (managementOverviewView) managementOverviewView.style.display = 'block';
    if (guestOverviewView) guestOverviewView.style.display = 'none';
    if (roomInventoryActions) roomInventoryActions.style.display = 'flex';
    if (universalSearchInput) universalSearchInput.placeholder = 'Search suite, guest name, or ID...';

    if (navSectionTitleCore) navSectionTitleCore.textContent = 'Core Management';
    if (navOverviewText) navOverviewText.textContent = 'Staff Dashboard';
    if (tabBtnOverviewText) tabBtnOverviewText.textContent = 'Staff Operations Dashboard';
    if (navRoomsText) navRoomsText.textContent = 'Suites & Inventory';
    if (tabBtnRoomsText) tabBtnRoomsText.textContent = 'Suites & Room Inventory';
    if (navReservationsText) navReservationsText.textContent = 'Bookings & Check-in';
    if (tabBtnReservationsText) tabBtnReservationsText.textContent = 'Bookings & Check-in';

    if (typeof renderStaffBookings === 'function') renderStaffBookings();
    if (typeof runStaffSearch === 'function') runStaffSearch();
    if (typeof updateDashboardKPIs === 'function') updateDashboardKPIs();

  } else {
    // GUEST (User/Guest) has access to Portfolio Showcase, Suites, Party Halls, Bookings, Favorites, Concierge
    if (analyticsNav) analyticsNav.style.display = 'none';
    if (analyticsTabBtn) analyticsTabBtn.style.display = 'none';
    if (roomsNav) roomsNav.style.display = 'flex';
    if (conciergeNav) conciergeNav.style.display = 'flex';
    if (conciergeTabBtn) conciergeTabBtn.style.display = 'inline-flex';

    if (navFavorites) navFavorites.style.display = 'flex';
    if (tabBtnFavorites) tabBtnFavorites.style.display = 'inline-flex';
    if (tabFavorites) tabFavorites.style.display = '';

    if (adminHallControls) adminHallControls.style.display = 'none';
    if (staffHallControls) staffHallControls.style.display = 'none';
    if (userHallControls) userHallControls.style.display = 'flex';
    if (adminRevenueStatCard) adminRevenueStatCard.style.display = 'none';

    if (guestBookingsView) guestBookingsView.style.display = 'block';
    if (adminBookingsView) adminBookingsView.style.display = 'none';
    if (staffBookingsView) staffBookingsView.style.display = 'none';

    // Advanced Search Sections: STRICTLY HIDDEN FOR GUEST
    if (adminAdvancedSearchSec) adminAdvancedSearchSec.style.display = 'none';
    if (staffAdvancedSearchSec) staffAdvancedSearchSec.style.display = 'none';

    // Header & Management elements STRICTLY HIDDEN FOR GUEST
    if (exportReportBtn) exportReportBtn.style.display = 'none';
    if (heroOccupancyBadge) heroOccupancyBadge.style.display = 'none';
    if (managementKpiGrid) managementKpiGrid.style.display = 'none';
    if (managementOverviewView) managementOverviewView.style.display = 'none';
    if (roomInventoryActions) roomInventoryActions.style.display = 'none'; // Strictly hide "Allocate Suite"

    // Guest elements STRICTLY SHOWN FOR GUEST
    if (guestKpiGrid) guestKpiGrid.style.display = '';
    if (guestOverviewView) guestOverviewView.style.display = 'block';
    if (universalSearchInput) universalSearchInput.placeholder = 'Search suites, villas, or amenities...';

    if (navSectionTitleCore) navSectionTitleCore.textContent = 'Sanctuary Experience';
    if (navOverviewText) navOverviewText.textContent = 'Guest Dashboard';
    if (tabBtnOverviewText) tabBtnOverviewText.textContent = 'Guest Dashboard';
    if (navRoomsText) navRoomsText.textContent = 'Browse Suites & Rooms';
    if (tabBtnRoomsText) tabBtnRoomsText.textContent = 'Browse Suites & Rooms';
    if (navReservationsText) navReservationsText.textContent = 'My Bookings';
    if (tabBtnReservationsText) tabBtnReservationsText.textContent = 'My Bookings';

    if (typeof renderGuestBookings === 'function') renderGuestBookings();
    if (typeof updateFavoritesBadges === 'function') updateFavoritesBadges();
    if (typeof renderFavoritesGrid === 'function') renderFavoritesGrid();
    if (typeof updateGuestDashboardUI === 'function') updateGuestDashboardUI();
  }

  // Update navigation count badge
  if (typeof updateBookingsNavBadge === 'function') updateBookingsNavBadge();

  // Refresh Party Hall state
  if (typeof updatePartyHallStats === 'function') updatePartyHallStats();
  if (typeof renderPartyHallsGrid === 'function') renderPartyHallsGrid();

  // Re-render rooms grid to apply role-specific card contents (hide occupant & housekeeping for guest)
  if (typeof renderRoomsGrid === 'function') renderRoomsGrid();
}

function showDashboardView(user) {
  const authContainer = document.getElementById('authViewContainer');
  const appContainer = document.getElementById('appContainer');

  if (authContainer) authContainer.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';

  const role = (user.role === 'USER' || user.role === 'GUEST') ? 'GUEST' : (user.role || '').toUpperCase();
  user.role = role;

  updateProfileDisplay(user);
  applyRoleBasedAccess(user.role);

  // Initialize and synchronize role-specific currency UI
  if (user.role === 'ADMIN') {
    if (user.preferredCountry || user.preferredCurrency) {
      setAdminCountryAndCurrency(user.preferredCountry, user.preferredCurrency);
    }
    initAdminCurrencyUI();
  } else if (user.role === 'STAFF') {
    initStaffCurrencyUI();
  } else {
    if (user.preferredCurrency) {
      setGuestCurrency(user.preferredCurrency);
    }
    initGuestCurrencyUI();
  }

  // Default to overview tab (All 3 roles now have custom Overview: Admin Overview, Staff Dashboard, Guest Dashboard)
  const overviewBtn = document.querySelector('.tab-btn[data-target="tabOverview"]');
  if (overviewBtn) overviewBtn.click();

  // Ensure charts and data grids are rendered
  renderAllComponents();
  if (user.role !== 'GUEST' && !revenueChart) {
    initCharts();
  }

  // Synchronize live bookings and favorites with Spring Boot REST backend
  syncBookingsFromBackend();
  if (user.role === 'GUEST') {
    syncFavoritesFromBackend();
    updateGuestDashboardUI();
  }
}

async function syncBookingsFromBackend() {
  try {
    const token = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const backendBookings = await res.json();
      if (Array.isArray(backendBookings)) {
        const local = loadBookings();
        const merged = [...local];
        backendBookings.forEach(bb => {
          const idx = merged.findIndex(m => m.id === bb.id);
          const mapped = {
            id: bb.id,
            guestId: bb.guestId,
            type: bb.type || 'room',
            roomId: bb.roomId,
            hallId: bb.hallId,
            title: bb.title || (bb.roomNumber ? `Suite ${bb.roomNumber}` : 'Luxury Accommodation'),
            roomNumber: bb.roomNumber,
            guestName: bb.guestName,
            guestEmail: bb.guestEmail,
            guestPhone: bb.guestPhone,
            vipTier: bb.vipTier || 'gold',
            checkIn: bb.checkIn,
            checkOut: bb.checkOut,
            nights: bb.nights,
            adults: bb.adults,
            children: bb.children,
            basePrice: bb.basePrice,
            subtotal: bb.subtotal,
            addonsTotal: bb.addonsTotal,
            tax: bb.tax,
            serviceCharge: bb.serviceCharge,
            totalAmount: bb.totalAmount,
            status: bb.status ? (bb.status.charAt(0).toUpperCase() + bb.status.slice(1).toLowerCase()) : 'Confirmed',
            paymentStatus: bb.paymentStatus ? (bb.paymentStatus.charAt(0).toUpperCase() + bb.paymentStatus.slice(1).toLowerCase()) : 'Paid',
            paymentMethod: bb.paymentMethod,
            specialRequests: bb.specialRequests,
            image: bb.image,
            createdAt: bb.createdAt
          };
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...mapped };
          } else {
            merged.unshift(mapped);
          }
        });
        persistBookings(merged);
        if (typeof renderBookingsByActiveRole === 'function') {
          renderBookingsByActiveRole();
        }
        if (typeof updateBookingsNavBadge === 'function') {
          updateBookingsNavBadge();
        }
      }
    }
  } catch (e) {
    console.warn('[Sync Bookings Fallback]', e);
  }
}

async function syncFavoritesFromBackend() {
  try {
    if (!isGuestUser()) return;
    const token = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/favorites/ids`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const ids = await res.json();
      if (Array.isArray(ids)) {
        saveFavoriteRoomIds(ids);
        if (typeof renderFavoritesGrid === 'function') {
          renderFavoritesGrid();
        }
        if (typeof updateFavoritesBadges === 'function') {
          updateFavoritesBadges();
        }
      }
    }
  } catch (e) {
    console.warn('[Sync Favorites Fallback]', e);
  }
}

function showAuthView() {
  const authContainer = document.getElementById('authViewContainer');
  const appContainer = document.getElementById('appContainer');

  if (appContainer) appContainer.style.display = 'none';
  if (authContainer) authContainer.style.display = 'flex';

  clearAuthErrors();
}

function handleLogout() {
  AuthManager.clearSession();

  // Reset universal and advanced search inputs
  const universalSearch = document.getElementById('universalSearchInput');
  if (universalSearch) universalSearch.value = '';
  const adminSearchInput = document.getElementById('adminAdvancedSearchInput');
  if (adminSearchInput) adminSearchInput.value = '';
  const staffSearchInput = document.getElementById('staffAdvancedSearchInput');
  if (staffSearchInput) staffSearchInput.value = '';

  // Reset tab active states to default
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const defaultTabBtn = document.querySelector('.tab-btn[data-target="tabOverview"]');
  if (defaultTabBtn) defaultTabBtn.classList.add('active');
  const defaultNavItem = document.querySelector('.sidebar-nav .nav-item[data-target="tabOverview"]');
  if (defaultNavItem) defaultNavItem.classList.add('active');
  const defaultPane = document.getElementById('tabOverview');
  if (defaultPane) defaultPane.classList.add('active');

  soundEngine.playChime('bell');
  showAuthView();
  showToast('Logged Out', 'Your security session has been closed', 'info');
}

function initAuthUI() {
  // 1. Password Visibility Toggle
  const toggleBtn = document.getElementById('passwordToggleBtn');
  const passInput = document.getElementById('loginPassword');
  const toggleIcon = document.getElementById('passwordToggleIcon');

  if (toggleBtn && passInput && toggleIcon) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      toggleIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // 2. Demo Account & Mode Selection Chips
  const chipAdmin = document.getElementById('chipAdmin');
  const chipStaff = document.getElementById('chipStaff');
  const chipUser = document.getElementById('chipUser');

  if (chipAdmin) chipAdmin.addEventListener('click', () => fillCredentials('admin'));
  if (chipStaff) chipStaff.addEventListener('click', () => fillCredentials('staff'));
  if (chipUser) chipUser.addEventListener('click', () => fillCredentials('guest'));

  // Default login mode: Guest
  setLoginMode('guest');

  // 3. Forgot Password Link
  const forgotLink = document.getElementById('forgotPasswordLink');
  const forgotModal = document.getElementById('forgotPasswordModal');
  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.classList.add('open');
      soundEngine.playChime('bell');
    });
  }

  // 4. Logout Buttons (Navbar & Sidebar)
  const navLogout = document.getElementById('navLogoutBtn');
  const sideLogout = document.getElementById('sidebarLogoutBtn');
  if (navLogout) navLogout.addEventListener('click', handleLogout);
  if (sideLogout) sideLogout.addEventListener('click', handleLogout);

  // 5. Input change listeners to clear field errors
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      document.getElementById('emailErrorMsg')?.classList.remove('visible');
      document.getElementById('emailInputWrapper')?.classList.remove('input-error');
      document.getElementById('authAlertBanner').style.display = 'none';
    });
  }
  if (passInput) {
    passInput.addEventListener('input', () => {
      document.getElementById('passwordErrorMsg')?.classList.remove('visible');
      document.getElementById('passwordInputWrapper')?.classList.remove('input-error');
      document.getElementById('authAlertBanner').style.display = 'none';
    });
  }

  // 6. Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthErrors();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';
      const rememberMe = document.getElementById('rememberMeCheckbox')?.checked ?? true;

      // Validation Step
      let hasError = false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        const err = document.getElementById('emailErrorMsg');
        if (err) {
          err.textContent = currentLoginMode === 'guest' ? 'Please enter a valid email address' : 'Corporate email address is required';
          err.classList.add('visible');
        }
        document.getElementById('emailInputWrapper')?.classList.add('input-error');
        hasError = true;
      } else if (!emailRegex.test(email)) {
        const err = document.getElementById('emailErrorMsg');
        if (err) {
          err.textContent = 'Please enter a valid email address';
          err.classList.add('visible');
        }
        document.getElementById('emailInputWrapper')?.classList.add('input-error');
        hasError = true;
      }

      if (!password) {
        const err = document.getElementById('passwordErrorMsg');
        if (err) {
          err.textContent = 'Please enter your password';
          err.classList.add('visible');
        }
        document.getElementById('passwordInputWrapper')?.classList.add('input-error');
        hasError = true;
      }

      if (hasError) {
        soundEngine.playChime('bell');
        return;
      }

      // In-flight loading state (prevent duplicate submissions)
      const submitBtn = document.getElementById('loginSubmitBtn');
      const btnText = document.getElementById('loginBtnText');
      const spinner = document.getElementById('loginSpinner');

      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (spinner) {
        spinner.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ' + (currentLoginMode === 'guest' ? 'Signing In...' : 'Authenticating Security Clearance...');
        spinner.style.display = 'inline-flex';
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success && data.token && data.user) {
          if (data.user.role === 'USER' || data.user.role === 'GUEST') {
            data.user.role = 'GUEST';
          }
          AuthManager.saveSession(data.token, data.user, rememberMe);
          soundEngine.playChime('success');
          showToast('Security Clearance Verified', `Welcome to Aurelia Grand, ${data.user.fullName}`, 'success');
          showDashboardView(data.user);
        } else {
          showAuthAlert(data.message || 'Invalid email or password');
          soundEngine.playChime('bell');
        }
      } catch (err) {
        console.warn('[Login API Error / Offline Demo Fallback]', err);
        // Client-side authentication fallback for demo accounts when server is offline
        let demoUser = null;
        const normEmail = email.toLowerCase();

        if (normEmail === 'admin@aureliagrand.com' && password === 'AdminPassword123!') {
          demoUser = { id: 1, fullName: 'Julian Vance', email, role: 'ADMIN' };
        } else if (normEmail === 'staff@aureliagrand.com' && password === 'StaffPassword123!') {
          demoUser = { id: 2, fullName: 'Elena Rostova', email, role: 'STAFF' };
        } else if ((normEmail === 'user@aureliagrand.com' || normEmail === 'guest@aureliagrand.com') && (password === 'UserPassword123!' || password === 'GuestPassword123!')) {
          demoUser = { id: 3, fullName: 'Lady Genevieve & Lord Sterling', email, role: 'GUEST' };
        }

        if (demoUser) {
          AuthManager.saveSession('demo-token-' + demoUser.role.toLowerCase(), demoUser, rememberMe);
          soundEngine.playChime('success');
          showToast('Security Clearance Verified', `Welcome to Aurelia Grand, ${demoUser.fullName}`, 'success');
          showDashboardView(demoUser);
        } else {
          showAuthAlert('Unable to connect to Authentication Service and credentials not recognized.');
          soundEngine.playChime('bell');
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline-flex';
        if (spinner) spinner.style.display = 'none';
      }
    });
  }
}

// --- APP INITIALIZER ---
async function initApp() {
  initTheme();
  initClock();
  initEventListeners();
  initAuthUI();

  // Route Protection & Session Validation
  if (AuthManager.isAuthenticated()) {
    const verifiedUser = await AuthManager.verifyTokenWithBackend();
    if (verifiedUser) {
      if (verifiedUser.role === 'USER' || verifiedUser.role === 'GUEST') {
        verifiedUser.role = 'GUEST';
      }
      showDashboardView(verifiedUser);
    } else {
      showAuthView();
    }
  } else {
    showAuthView();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// --- THEME ENGINE ---
function initTheme() {
  const savedTheme = localStorage.getItem('aurelia_theme') || 'default';
  applyTheme(savedTheme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.dataset.theme;
      applyTheme(selectedTheme);
      soundEngine.playChime('bell');
      showToast('Theme Changed', `Switched to ${btn.title} aesthetic`, 'info');
    });
  });
}

function applyTheme(themeName) {
  if (themeName === 'default') {
    document.body.removeAttribute('data-theme');
  } else {
    document.body.setAttribute('data-theme', themeName);
  }
  localStorage.setItem('aurelia_theme', themeName);

  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === themeName);
  });

  if (revenueChart && categoryChart) {
    updateChartsTheme();
  }
}

// --- LIVE CLOCK ---
function initClock() {
  const timeEl = document.getElementById('liveClockTime');
  const dateEl = document.getElementById('liveClockDate');

  function update() {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  update();
  setInterval(update, 1000);
}

// ==================== FAVORITES STATE MANAGEMENT (GUEST ONLY) ====================
const FAVORITES_STORAGE_KEY = 'aurelia_guest_favorites';

function isGuestUser() {
  const user = typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser ? AuthManager.getCurrentUser() : null;
  return !!(user && (user.role === 'GUEST' || user.role === 'USER'));
}

function getFavoriteRoomIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only return IDs that exist in ROOMS_DATA (gracefully omit stale/missing rooms)
    return parsed.filter(id => ROOMS_DATA.some(r => r.id === id));
  } catch (e) {
    console.warn('Error reading favorites from localStorage:', e);
    return [];
  }
}

function saveFavoriteRoomIds(ids) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Error saving favorites to localStorage:', e);
  }
}

function isRoomFavorite(roomId) {
  return getFavoriteRoomIds().includes(roomId);
}

function updateFavoritesBadges() {
  const isGuest = isGuestUser();
  const navBadge = document.getElementById('navFavoritesBadge');
  const tabBadge = document.getElementById('tabBtnFavoritesBadge');

  if (!isGuest) {
    if (navBadge) navBadge.style.display = 'none';
    if (tabBadge) tabBadge.style.display = 'none';
    return;
  }

  const count = getFavoriteRoomIds().length;
  if (navBadge) {
    navBadge.textContent = count;
    navBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (tabBadge) {
    tabBadge.textContent = count;
    tabBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

function toggleFavorite(roomId, buttonEl) {
  if (!isGuestUser()) return;

  const room = ROOMS_DATA.find(r => r.id === roomId);
  if (!room) return;

  const favIds = getFavoriteRoomIds();
  const index = favIds.indexOf(roomId);
  let isNowFav = false;

  if (index > -1) {
    favIds.splice(index, 1);
    saveFavoriteRoomIds(favIds);
    showToast('Favorites', 'Removed from Favorites', 'info');
    isNowFav = false;
  } else {
    favIds.push(roomId);
    saveFavoriteRoomIds(favIds);
    showToast('Favorites', 'Added to Favorites', 'success');
    isNowFav = true;
  }

  // Audio chime feedback
  if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
    soundEngine.playChime('bell');
  }

  // Backend persistence for authenticated guests
  const favToken = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
  if (favToken) {
    fetch(`${API_BASE_URL}/api/favorites/toggle/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${favToken}`,
        'Content-Type': 'application/json'
      }
    }).catch(e => console.warn('[Favorite Backend Sync]', e));
  }

  // 1. Update all heart buttons on room cards matching this roomId
  document.querySelectorAll(`.room-favorite-btn[data-room-id="${roomId}"]`).forEach(btn => {
    btn.classList.toggle('is-favorite', isNowFav);
    btn.title = isNowFav ? 'Remove from Favorites' : 'Add to Favorites';
    btn.setAttribute('aria-label', btn.title);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = `${isNowFav ? 'fa-solid' : 'fa-regular'} fa-heart`;
    }
  });

  // 2. Update modal favorite button if open
  const modalFavBtn = document.getElementById('modalFavoriteBtn');
  if (modalFavBtn && modalFavBtn.dataset.roomId === roomId) {
    modalFavBtn.classList.toggle('is-fav', isNowFav);
    const modalIcon = modalFavBtn.querySelector('i');
    const modalText = modalFavBtn.querySelector('.btn-fav-text');
    if (modalIcon) {
      modalIcon.className = `${isNowFav ? 'fa-solid' : 'fa-regular'} fa-heart`;
      modalIcon.style.color = isNowFav ? '#ef4444' : '';
    }
    if (modalText) {
      modalText.textContent = isNowFav ? 'Favorited' : 'Add to Favorites';
    }
  }

  // 3. Update navigation badges
  updateFavoritesBadges();

  // 4. Update Favorites grid view
  renderFavoritesGrid();
}

function navigateToRoomsInventory() {
  const roomsTabBtn = document.querySelector('.tab-btn[data-target="tabRooms"]') ||
                       document.querySelector('.sidebar-nav .nav-item[data-target="tabRooms"]');
  if (roomsTabBtn) {
    roomsTabBtn.click();
  }
}

function renderFavoritesGrid(filteredFavRooms = null) {
  const grid = document.getElementById('favoritesRoomsGrid');
  if (!grid) return;

  if (!isGuestUser()) {
    grid.innerHTML = '';
    return;
  }

  const favIds = getFavoriteRoomIds();
  if (favIds.length === 0) {
    grid.innerHTML = `
      <div class="empty-favorites-state">
        <div class="empty-favorites-icon-wrap">
          <i class="fa-regular fa-heart"></i>
        </div>
        <h4 class="font-serif empty-favorites-title">No Favorite Rooms Yet</h4>
        <p class="empty-favorites-subtitle">
          Save your favorite rooms and suites here for easy access later.
        </p>
        <button class="btn-primary-luxury" onclick="navigateToRoomsInventory()">
          <i class="fa-solid fa-compass"></i> Explore Rooms
        </button>
      </div>
    `;
    return;
  }

  let roomsToDisplay;
  if (filteredFavRooms !== null) {
    roomsToDisplay = filteredFavRooms;
  } else {
    roomsToDisplay = ROOMS_DATA.filter(r => favIds.includes(r.id));
  }

  if (roomsToDisplay.length === 0) {
    grid.innerHTML = `
      <div class="empty-favorites-state">
        <div class="empty-favorites-icon-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h4 class="font-serif empty-favorites-title">No Favorite Suites Match Filter</h4>
        <p class="empty-favorites-subtitle">
          Try selecting a different category or clearing your search keywords.
        </p>
        <button class="btn-secondary-luxury" onclick="resetFavoritesFilters()">
          <i class="fa-solid fa-rotate-left"></i> Reset Filter
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = roomsToDisplay.map(room => {
    let statusClass = 'status-available';
    let statusLabel = 'Available';
    if (room.status === 'occupied') {
      statusClass = 'status-occupied';
      statusLabel = 'Occupied';
    } else if (room.status === 'maintenance') {
      statusClass = 'status-maintenance';
      statusLabel = 'Maintenance';
    }

    return `
      <div class="room-card" data-id="${room.id}">
        <div class="room-image-wrapper">
          <img src="${room.image}" alt="${room.name}" loading="lazy" />
          <div class="room-badge-overlay">
            <span class="room-number-tag">Suite ${room.number}</span>
            <span class="room-status-badge ${statusClass}">${statusLabel}</span>
          </div>
          <button type="button" 
                  class="room-favorite-btn is-favorite" 
                  data-room-id="${room.id}"
                  title="Remove from Favorites" 
                  aria-label="Remove from Favorites"
                  onclick="event.stopPropagation(); toggleFavorite('${room.id}', this)">
            <i class="fa-solid fa-heart"></i>
          </button>
          <div class="room-rating-overlay">
            <i class="fa-solid fa-star"></i>
            <span>${room.rating.toFixed(1)}</span>
          </div>
        </div>
        <div class="room-body">
          <span class="room-type-tier">${room.type} • ${room.floor} • ${room.size} • <i class="fa-solid fa-users" style="margin-left: 2px;"></i> ${room.capacity}</span>
          <h3 class="room-title">${room.name}</h3>
          
          <p class="room-short-desc" style="color: var(--text-secondary); font-size: 0.84rem; line-height: 1.45; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${room.description}
          </p>

          <div class="room-features">
            ${room.features.slice(0, 3).map(f => `
              <span class="feature-tag"><i class="fa-solid fa-check"></i> ${f}</span>
            `).join('')}
          </div>

          <div class="room-footer">
            <div class="room-price">
              <span class="amount">${formatCurrency(room.price)}</span>
              <span class="period">per night + luxury taxes</span>
            </div>
            <div class="room-card-actions" style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-secondary-luxury" style="padding: 7px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px;" title="View Details & Gallery" onclick="openRoomDetailsModal('${room.id}')">
                <i class="fa-regular fa-eye"></i> Details
              </button>
              <button class="btn-primary-luxury" style="padding: 7px 14px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px;" title="Book this suite" onclick="openReservationModalWithRoom('${room.id}')">
                <i class="fa-solid fa-calendar-check"></i> Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetFavoritesFilters() {
  const searchInput = document.getElementById('favoritesSearchInput');
  if (searchInput) searchInput.value = '';
  const pills = document.querySelectorAll('#favoritesFilterPills .filter-pill');
  pills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
  renderFavoritesGrid();
}

// Global window exposure for event handlers
window.toggleFavorite = toggleFavorite;
window.navigateToRoomsInventory = navigateToRoomsInventory;
window.resetFavoritesFilters = resetFavoritesFilters;
window.renderFavoritesGrid = renderFavoritesGrid;
window.updateFavoritesBadges = updateFavoritesBadges;
window.getFavoriteRoomIds = getFavoriteRoomIds;
window.isRoomFavorite = isRoomFavorite;

// --- COMPONENT RENDERERS ---
function renderAllComponents() {
  renderRoomsGrid();
  renderReservationsTable();
  renderConciergeRequests();
  updateKPIs();
  if (typeof renderPartyHallsGrid === 'function') renderPartyHallsGrid();
  if (typeof updatePartyHallStats === 'function') updatePartyHallStats();
  if (typeof renderBookingsByActiveRole === 'function') renderBookingsByActiveRole();
  if (typeof updateBookingsNavBadge === 'function') updateBookingsNavBadge();
  if (typeof renderFavoritesGrid === 'function') renderFavoritesGrid();
  if (typeof updateFavoritesBadges === 'function') updateFavoritesBadges();
}

// Render Rooms Grid
function renderRoomsGrid(filteredRooms = null) {
  const grid = document.getElementById('roomsGrid');
  if (!grid) return;

  const roomsToDisplay = filteredRooms || ROOMS_DATA;

  if (roomsToDisplay.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fa-solid fa-hotel" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
        <h4 style="font-size: 1.2rem; font-weight: 600;">No Suites Match Filter</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Try selecting a different category or clearing search query.</p>
      </div>
    `;
    return;
  }

  const isGuest = isGuestUser();
  const favIds = isGuest ? getFavoriteRoomIds() : [];

  grid.innerHTML = roomsToDisplay.map(room => {
    let statusClass = 'status-available';
    let statusLabel = 'Available';
    if (room.status === 'occupied') {
      statusClass = 'status-occupied';
      statusLabel = 'Occupied';
    } else if (room.status === 'maintenance') {
      statusClass = 'status-maintenance';
      statusLabel = 'Maintenance';
    }

    const isFav = isGuest && favIds.includes(room.id);
    const favoriteBtnHtml = isGuest ? `
      <button type="button" 
              class="room-favorite-btn ${isFav ? 'is-favorite' : ''}" 
              data-room-id="${room.id}"
              title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}" 
              aria-label="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}"
              onclick="event.stopPropagation(); toggleFavorite('${room.id}', this)">
        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
    ` : '';

    return `
      <div class="room-card" data-id="${room.id}">
        <div class="room-image-wrapper">
          <img src="${room.image}" alt="${room.name}" loading="lazy" />
          <div class="room-badge-overlay">
            <span class="room-number-tag">Suite ${room.number}</span>
            <span class="room-status-badge ${statusClass}">${statusLabel}</span>
          </div>
          ${favoriteBtnHtml}
          <div class="room-rating-overlay">
            <i class="fa-solid fa-star"></i>
            <span>${room.rating.toFixed(1)}</span>
          </div>
        </div>
        <div class="room-body">
          <span class="room-type-tier">${room.type} • ${room.floor} • ${room.size}</span>
          <h3 class="room-title">${room.name}</h3>
          
          <div class="room-features">
            ${room.features.slice(0, 3).map(f => `
              <span class="feature-tag"><i class="fa-solid fa-check"></i> ${f}</span>
            `).join('')}
          </div>

          ${isGuest ? `
            <div class="room-current-guest">
              <span><i class="fa-solid fa-gem" style="color: var(--accent-gold); margin-right: 6px;"></i> Sanctuary Status:</span>
              <span class="guest-name" style="color: ${room.status === 'available' ? '#10b981' : '#f59e0b'}; font-weight: 600;">${room.status === 'available' ? 'Available for Reservation' : 'Reserved'}</span>
            </div>
          ` : `
            <div class="room-current-guest">
              <span><i class="fa-regular fa-user" style="color: var(--accent-gold); margin-right: 6px;"></i> Occupant:</span>
              <span class="guest-name">${room.guest ? room.guest : 'Vacant (Inspection Passed)'}</span>
            </div>
          `}

          <div class="room-footer">
            <div class="room-price">
              <span class="amount">${formatCurrency(room.price)}</span>
              <span class="period">per night + luxury taxes</span>
            </div>
            <div class="room-card-actions">
              <button class="btn-icon-square view-details-btn" title="View Details & Gallery" onclick="openRoomDetailsModal('${room.id}')">
                <i class="fa-regular fa-eye"></i>
              </button>
              ${room.status === 'available' ? `
                <button class="btn-icon-square" title="Book this suite" style="background: var(--accent-gold); color: #0b0f17;" onclick="openReservationModalWithRoom('${room.id}')">
                  <i class="fa-solid fa-plus"></i>
                </button>
              ` : (isGuest ? '' : `
                <button class="btn-icon-square" title="Toggle Clean / Housekeeping Status" onclick="toggleRoomStatus('${room.id}')">
                  <i class="fa-solid fa-broom"></i>
                </button>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Reservations Table
function renderReservationsTable(filteredData = null) {
  const tbody = document.getElementById('reservationsTableBody');
  if (!tbody) return;

  const data = filteredData || RESERVATIONS_DATA;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          No reservations found matching current criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(res => {
    let vipClass = 'gold';
    if (res.vipTier === 'diamond') vipClass = 'diamond';
    if (res.vipTier === 'silver') vipClass = 'silver';

    return `
      <tr>
        <td>
          <span style="font-weight: 600; font-size: 0.82rem; color: var(--accent-gold);">${res.id}</span>
        </td>
        <td>
          <div class="guest-cell">
            <img src="${res.avatar}" alt="${res.guestName}" class="guest-avatar-table" />
            <div class="guest-info-table">
              <span class="name">${res.guestName}</span>
              <span class="email">${res.email}</span>
            </div>
            <span class="vip-badge-tag ${vipClass}">
              <i class="fa-solid fa-crown"></i> ${res.vipTier}
            </span>
          </div>
        </td>
        <td>
          <strong style="color: var(--text-primary);">Suite ${res.roomNumber}</strong>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${res.roomType}</div>
        </td>
        <td>
          <div>${res.dates}</div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${res.nights} Nights</span>
        </td>
        <td>
          <strong style="color: var(--text-gold);">${formatCurrency(res.rawTotal !== undefined ? res.rawTotal : res.total)}</strong>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">${res.payment}</div>
        </td>
        <td>
          <span class="room-status-badge ${res.status === 'Checked In' ? 'status-occupied' : 'status-available'}">
            ${res.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn-icon-square" title="View Guest Folio" onclick="showToast('Folio Opened', 'Folio loaded for ${res.guestName}', 'info')">
              <i class="fa-solid fa-receipt"></i>
            </button>
            <button class="btn-icon-square" title="Message Concierge" onclick="showToast('Concierge Alert', 'Dispatch notification sent for ${res.guestName}', 'info')">
              <i class="fa-solid fa-bell-concierge"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Concierge Requests
function renderConciergeRequests() {
  const container = document.getElementById('conciergeList');
  if (!container) return;

  container.innerHTML = CONCIERGE_REQUESTS.map(req => `
    <div class="request-card" id="${req.id}">
      <div class="request-header">
        <span style="font-size: 0.78rem; font-weight: 700; color: var(--accent-gold);">${req.suite}</span>
        <span class="priority-badge ${req.priority}">${req.priority}</span>
      </div>
      <div class="request-body">
        <h4>${req.title}</h4>
        <p><i class="fa-regular fa-clock"></i> Requested ${req.time} • Assigned to: <strong>${req.assignedTo}</strong></p>
      </div>
      <div class="request-actions">
        <button class="btn-secondary-luxury" style="padding: 6px 14px; font-size: 0.8rem;" onclick="resolveConciergeRequest('${req.id}')">
          <i class="fa-solid fa-check"></i> Mark Complete
        </button>
        <button class="btn-secondary-luxury" style="padding: 6px 14px; font-size: 0.8rem;" onclick="showToast('Dispatch Update', 'Escalated to Head Butler', 'info')">
          <i class="fa-solid fa-phone"></i> Expedite
        </button>
      </div>
    </div>
  `).join('');
}

// Update KPI Ribbon counters
function updateKPIs() {
  const total = ROOMS_DATA.length;
  const occupied = ROOMS_DATA.filter(r => r.status === 'occupied').length;
  const occupancyRate = ((occupied / total) * 100).toFixed(1);

  const occEl = document.getElementById('kpiOccupancy');
  if (occEl) occEl.textContent = `${occupancyRate}%`;

  const heroOccEl = document.getElementById('heroOccupancyRate');
  if (heroOccEl) heroOccEl.textContent = `${occupancyRate}%`;

  const activeGuestsCount = RESERVATIONS_DATA.filter(r => r.status === 'Checked In').length * 2 + 14;
  const activeGuestsEl = document.getElementById('kpiActiveGuests');
  if (activeGuestsEl) activeGuestsEl.textContent = activeGuestsCount;

  // Refresh monetary dashboard KPIs according to active role's currency
  updateDashboardKPIs();
}

// --- CONCIERGE ACTIONS ---
function resolveConciergeRequest(id) {
  CONCIERGE_REQUESTS = CONCIERGE_REQUESTS.filter(r => r.id !== id);
  renderConciergeRequests();
  soundEngine.playChime('success');
  showToast('Task Completed', `Concierge request ${id} resolved & logged to guest profile`, 'success');
}

// --- ROOM STATUS TOGGLE ---
function toggleRoomStatus(roomId) {
  const room = ROOMS_DATA.find(r => r.id === roomId);
  if (!room) return;

  if (room.status === 'maintenance') {
    room.status = 'available';
    room.guest = null;
    showToast('Housekeeping Passed', `Suite ${room.number} is pristine & ready for check-in!`, 'success');
  } else if (room.status === 'occupied') {
    room.status = 'maintenance';
    room.guest = 'Deep Sanitization in Progress';
    showToast('Housekeeping Dispatched', `Suite ${room.number} scheduled for inspection`, 'info');
  } else {
    room.status = 'maintenance';
    room.guest = 'Linens & Turndown Inspection';
    showToast('Status Updated', `Suite ${room.number} marked for housekeeping review`, 'info');
  }

  soundEngine.playChime('bell');
  renderRoomsGrid();
  updateKPIs();
}

// --- EVENT LISTENERS & NAVIGATION ---
function initEventListeners() {
  // Mobile drawer navigation toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Section Tabs Navigation
  const tabButtons = document.querySelectorAll('.tab-btn, .sidebar-nav .nav-item[data-target]');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target;
      if (!targetId) return;

      // Close mobile sidebar if open
      if (sidebar) sidebar.classList.remove('mobile-open');

      // Update active tab buttons
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.target === targetId);
      });
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.target === targetId);
      });

      // Switch Tab Panes
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
      }

      if (targetId === 'tabReservations') {
        if (typeof renderBookingsByActiveRole === 'function') renderBookingsByActiveRole();
        if (typeof syncBookingsFromBackend === 'function') syncBookingsFromBackend();
      }

      soundEngine.playChime('bell');
    });
  });

  // Room Inventory Filters
  const roomFilterPills = document.querySelectorAll('.filter-pill[data-category]');
  roomFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      roomFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.category;

      let filtered = ROOMS_DATA;
      if (cat !== 'all') {
        filtered = ROOMS_DATA.filter(r => r.category === cat);
      }
      renderRoomsGrid(filtered);
      soundEngine.playChime('bell');
    });
  });

  // Universal Search
  const universalSearch = document.getElementById('universalSearchInput');
  if (universalSearch) {
    universalSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const isGuest = isGuestUser();
      if (!q) {
        renderRoomsGrid();
        if (!isGuest) renderReservationsTable();
        return;
      }

      // If Guest: strictly search room features/titles only (never guests, guest IDs, or reservations)
      if (isGuest) {
        const filteredRooms = ROOMS_DATA.filter(r => 
          r.name.toLowerCase().includes(q) ||
          r.number.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.features && r.features.some(f => f.toLowerCase().includes(q)))
        );
        renderRoomsGrid(filteredRooms);
        return;
      }

      // For Staff/Admin: can search rooms and reservations
      const filteredRooms = ROOMS_DATA.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.guest && r.guest.toLowerCase().includes(q))
      );

      const filteredRes = RESERVATIONS_DATA.filter(res => 
        (res.guestName && res.guestName.toLowerCase().includes(q)) ||
        (res.id && res.id.toLowerCase().includes(q)) ||
        (res.roomNumber && res.roomNumber.toLowerCase().includes(q)) ||
        (res.email && res.email.toLowerCase().includes(q))
      );

      renderRoomsGrid(filteredRooms);
      renderReservationsTable(filteredRes);
    });
  }

  // Property Switcher
  const propertySelect = document.getElementById('propertySelectorDropdown');
  if (propertySelect) {
    propertySelect.addEventListener('change', (e) => {
      switchProperty(e.target.value);
    });
  }

  // Reservation Form Real-time Calculation
  const resRoomSelect = document.getElementById('resRoomSelect');
  const resNightsInput = document.getElementById('resNightsInput');
  const addonCheckboxes = document.querySelectorAll('input[name="resAddons"]');

  if (resRoomSelect && resNightsInput) {
    const recalculatePrice = () => {
      const selectedRoomId = resRoomSelect.value;
      const room = ROOMS_DATA.find(r => r.id === selectedRoomId);
      const nights = parseInt(resNightsInput.value) || 1;

      if (!room) return;

      let subtotal = room.price * nights;
      let addonsTotal = 0;

      addonCheckboxes.forEach(cb => {
        if (cb.checked) {
          addonsTotal += parseInt(cb.dataset.price) * (cb.dataset.pernight === 'true' ? nights : 1);
        }
      });

      const luxuryTax = Math.round((subtotal + addonsTotal) * 0.12);
      const grandTotal = subtotal + addonsTotal + luxuryTax;

      const subtotalEl = document.getElementById('calcSubtotal');
      const addonsEl = document.getElementById('calcAddons');
      const taxEl = document.getElementById('calcTax');
      const grandTotalEl = document.getElementById('calcGrandTotal');

      if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
      if (addonsEl) addonsEl.textContent = formatCurrency(addonsTotal);
      if (taxEl) taxEl.textContent = formatCurrency(luxuryTax);
      if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
    };

    resRoomSelect.addEventListener('change', recalculatePrice);
    resNightsInput.addEventListener('input', recalculatePrice);
    addonCheckboxes.forEach(cb => cb.addEventListener('change', recalculatePrice));
  }

  // Reservation Form Submission
  const resForm = document.getElementById('newReservationForm');
  if (resForm) {
    resForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCreateReservation();
    });
  }

  // Export Report Button
  const exportBtn = document.getElementById('exportReportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      generateOperationsReport();
    });
  }

  // Chart period buttons
  const chartFilterBtns = document.querySelectorAll('.chart-filter-btn');
  chartFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chartFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.textContent.trim();
      updateRevenueChartPeriod(period);
    });
  });

  // Party Hall Search & Filters
  const hallSearchInput = document.getElementById('hallSearchInput');
  const hallTypeFilter = document.getElementById('hallTypeFilter');
  const hallCapacityFilter = document.getElementById('hallCapacityFilter');
  const hallAvailFilter = document.getElementById('hallAvailFilter');
  const hallSortSelect = document.getElementById('hallSortSelect');
  const btnResetHallFilters = document.getElementById('btnResetHallFilters');

  if (hallSearchInput) hallSearchInput.addEventListener('input', () => filterPartyHalls());
  if (hallTypeFilter) hallTypeFilter.addEventListener('change', () => filterPartyHalls());
  if (hallCapacityFilter) hallCapacityFilter.addEventListener('change', () => filterPartyHalls());
  if (hallAvailFilter) hallAvailFilter.addEventListener('change', () => filterPartyHalls());
  if (hallSortSelect) hallSortSelect.addEventListener('change', () => filterPartyHalls());
  if (btnResetHallFilters) btnResetHallFilters.addEventListener('click', () => resetHallFilters());

  // Party Hall Booking Form Dynamic Recalculation & Availability Check
  const hallBookingDate = document.getElementById('hallBookingDate');
  const hallBookingStartTime = document.getElementById('hallBookingStartTime');
  const hallBookingEndTime = document.getElementById('hallBookingEndTime');
  const hallAddonCheckboxes = document.querySelectorAll('input[name="hallAddons"]');

  if (hallBookingDate) hallBookingDate.addEventListener('change', () => checkHallAvailability());
  if (hallBookingStartTime) hallBookingStartTime.addEventListener('change', () => checkHallAvailability());
  if (hallBookingEndTime) hallBookingEndTime.addEventListener('change', () => checkHallAvailability());
  hallAddonCheckboxes.forEach(cb => cb.addEventListener('change', () => recalculateHallBookingPrice()));

  const hallBookingForm = document.getElementById('partyHallBookingForm');
  if (hallBookingForm) {
    hallBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleConfirmHallBooking();
    });
  }

  const adminHallForm = document.getElementById('adminPartyHallForm');
  if (adminHallForm) {
    adminHallForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveAdminPartyHall();
    });
  }

  // Favorites Search & Category Filter Listeners (Guest only)
  const favSearch = document.getElementById('favoritesSearchInput');
  if (favSearch) {
    favSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const activePill = document.querySelector('#favoritesFilterPills .filter-pill.active');
      const cat = activePill ? activePill.dataset.favFilter : 'all';

      const favIds = getFavoriteRoomIds();
      let filtered = ROOMS_DATA.filter(r => favIds.includes(r.id));
      if (cat && cat !== 'all') {
        filtered = filtered.filter(r => r.category === cat);
      }
      if (q) {
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.number.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
        );
      }
      renderFavoritesGrid(filtered);
    });
  }

  const favFilterPills = document.querySelectorAll('#favoritesFilterPills .filter-pill');
  favFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      favFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.favFilter;

      const favSearchInput = document.getElementById('favoritesSearchInput');
      const q = favSearchInput ? favSearchInput.value.toLowerCase().trim() : '';

      const favIds = getFavoriteRoomIds();
      let filtered = ROOMS_DATA.filter(r => favIds.includes(r.id));
      if (cat && cat !== 'all') {
        filtered = filtered.filter(r => r.category === cat);
      }
      if (q) {
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.number.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
        );
      }
      renderFavoritesGrid(filtered);
      if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
        soundEngine.playChime('bell');
      }
    });
  });

  // Re-render favorites on guest currency change
  window.addEventListener('guestCurrencyChange', () => {
    if (isGuestUser()) {
      renderFavoritesGrid();
    }
  });

  // Admin Advanced Intelligence Search Listeners
  const adminSearchInput = document.getElementById('adminAdvancedSearchInput');
  const adminCategorySelect = document.getElementById('adminSearchCategory');
  const adminClearBtn = document.getElementById('adminSearchClearBtn');

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', runAdminSearch);
  }
  if (adminCategorySelect) {
    adminCategorySelect.addEventListener('change', runAdminSearch);
  }
  if (adminClearBtn) {
    adminClearBtn.addEventListener('click', clearAdminAdvancedSearch);
  }

  // Staff Advanced Intelligence Search Listeners
  const staffSearchInput = document.getElementById('staffAdvancedSearchInput');
  const staffCategorySelect = document.getElementById('staffSearchCategory');
  const staffClearBtn = document.getElementById('staffSearchClearBtn');

  if (staffSearchInput) {
    staffSearchInput.addEventListener('input', runStaffSearch);
  }
  if (staffCategorySelect) {
    staffCategorySelect.addEventListener('change', runStaffSearch);
  }
  if (staffClearBtn) {
    staffClearBtn.addEventListener('click', clearStaffAdvancedSearch);
  }

  // Initialize role currency listeners and synchronize select options
  initAdminCurrencyUI();
  initStaffCurrencyUI();
  initGuestCurrencyUI();
}

// Switch Property Logic
function switchProperty(propKey) {
  const prop = HOTEL_PROPERTIES[propKey];
  if (!prop) return;
  currentPropertyKey = propKey;

  const heroBanner = document.getElementById('portfolioHeroBanner');
  if (heroBanner) {
    heroBanner.style.backgroundImage = `linear-gradient(135deg, rgba(17, 23, 36, 0.95), rgba(11, 15, 23, 0.85)), url('${prop.heroImage}')`;
  }

  const titleEl = document.getElementById('heroHotelTitle');
  if (titleEl) titleEl.textContent = prop.name;

  const subtitleEl = document.getElementById('heroHotelSubtitle');
  if (subtitleEl) subtitleEl.textContent = prop.tagline;

  // Refresh monetary dashboard KPIs using active role's currency
  updateDashboardKPIs();

  soundEngine.playChime('success');
  showToast('Portfolio Switched', `Loaded live operations for ${prop.name}`, 'success');
}

// --- RESERVATION ENGINE ---
function openReservationModal() {
  const select = document.getElementById('resRoomSelect');
  if (select) {
    select.innerHTML = ROOMS_DATA.map(r => `
      <option value="${r.id}" ${r.status === 'occupied' ? 'disabled' : ''}>
        Suite ${r.number} - ${r.name} (${formatCurrency(r.price)}/night) ${r.status === 'occupied' ? '[Occupied]' : ''}
      </option>
    `).join('');
  }

  // Trigger price calculation
  if (select) {
    const event = new Event('change');
    select.dispatchEvent(event);
  }

  const modal = document.getElementById('reservationModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function openReservationModalWithRoom(roomId) {
  openReservationModal();
  const select = document.getElementById('resRoomSelect');
  if (select) {
    select.value = roomId;
    select.dispatchEvent(new Event('change'));
  }
}

function closeReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (modal) modal.classList.remove('open');
}

function handleCreateReservation() {
  const guestName = document.getElementById('resGuestName').value.trim();
  const guestEmail = document.getElementById('resGuestEmail').value.trim();
  const vipTier = document.getElementById('resVipTier').value;
  const roomId = document.getElementById('resRoomSelect').value;
  const nights = parseInt(document.getElementById('resNightsInput').value) || 3;
  const grandTotalText = document.getElementById('calcGrandTotal').textContent;

  const room = ROOMS_DATA.find(r => r.id === roomId);
  if (!room) return;

  const newResId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRes = {
    id: newResId,
    guestName: guestName,
    email: guestEmail,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    vipTier: vipTier,
    roomNumber: room.number,
    roomType: room.name,
    dates: 'Sep 04 - Sep 11, 2026',
    nights: nights,
    total: grandTotalText,
    status: 'Checked In',
    payment: 'Settled on Arrival'
  };

  // Add to reservations list
  RESERVATIONS_DATA.unshift(newRes);

  // Update room state
  room.status = 'occupied';
  room.guest = guestName;
  room.guestVip = vipTier;

  // Re-render
  renderRoomsGrid();
  renderReservationsTable();
  updateKPIs();
  closeReservationModal();

  soundEngine.playChime('success');
  showToast('Reservation Confirmed', `Created ${newResId} for ${guestName} in Suite ${room.number}`, 'success');

  // Reset form
  document.getElementById('newReservationForm').reset();
}

// --- ROOM DETAIL MODAL ---
function openRoomDetailsModal(roomId) {
  const room = ROOMS_DATA.find(r => r.id === roomId);
  if (!room) return;

  const modal = document.getElementById('roomDetailsModal');
  const titleEl = document.getElementById('roomModalTitle');
  const bodyEl = document.getElementById('roomModalBody');

  const isGuest = isGuestUser();
  const isFav = isGuest && isRoomFavorite(room.id);

  if (titleEl) titleEl.textContent = `Suite ${room.number} • ${room.name}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="position: relative; height: 320px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 20px;">
        <img id="mainDetailImage" src="${room.gallery[0]}" alt="${room.name}" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease;" />
        <div style="position: absolute; bottom: 16px; left: 20px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; color: #fff;">
          <i class="fa-solid fa-camera"></i> Ultra High Resolution Photography
        </div>
        ${isGuest ? `
          <button type="button" 
                  class="room-favorite-btn ${isFav ? 'is-favorite' : ''}" 
                  data-room-id="${room.id}"
                  title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}"
                  aria-label="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}"
                  onclick="event.stopPropagation(); toggleFavorite('${room.id}', this)"
                  style="position: absolute; top: 16px; right: 20px; z-index: 10;">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
        ` : ''}
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 6px;">
        ${room.gallery.map(img => `
          <img src="${img}" style="width: 110px; height: 75px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-accent); cursor: pointer;" onclick="document.getElementById('mainDetailImage').src = '${img}'" />
        `).join('')}
      </div>

      <h4 style="font-size: 1.1rem; margin-bottom: 8px;">Architectural Overview</h4>
      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
        ${room.description}
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--bg-secondary); padding: 14px; border-radius: 10px; border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Floor Plan / Area</span>
          <h5 style="font-size: 1.1rem; font-weight: 600;">${room.size} (${room.floor}) • <i class="fa-solid fa-users" style="font-size: 0.85rem;"></i> ${room.capacity}</h5>
        </div>
        <div style="background: var(--bg-secondary); padding: 14px; border-radius: 10px; border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Nightly Rate</span>
          <h5 style="font-size: 1.1rem; font-weight: 600; color: var(--text-gold);">${formatCurrency(room.price)}</h5>
        </div>
      </div>

      <h4 style="font-size: 1.1rem; margin-bottom: 12px;">Curated Amenities & Inclusions</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px;">
        ${room.features.map(f => `
          <span class="feature-tag" style="padding: 8px 12px; font-size: 0.85rem;"><i class="fa-solid fa-crown"></i> ${f}</span>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 20px;">
        ${isGuest ? `
          <button type="button" class="btn-secondary-luxury room-detail-fav-btn ${isFav ? 'is-fav' : ''}" 
                  id="modalFavoriteBtn"
                  data-room-id="${room.id}"
                  onclick="toggleFavorite('${room.id}', this)"
                  title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFav ? 'color: #ef4444;' : ''}"></i>
            <span class="btn-fav-text">${isFav ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        ` : ''}
        <button class="btn-secondary-luxury" onclick="closeRoomDetailsModal()">Close</button>
        <button class="btn-primary-luxury" onclick="closeRoomDetailsModal(); openReservationModalWithRoom('${room.id}');">
          <i class="fa-solid fa-calendar-check"></i> Reserve Suite
        </button>
      </div>
    `;
  }

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeRoomDetailsModal() {
  const modal = document.getElementById('roomDetailsModal');
  if (modal) modal.classList.remove('open');
}

// --- CHART.JS VISUALIZATIONS ---
function initCharts() {
  const revCanvas = document.getElementById('revenueTrendChart');
  const catCanvas = document.getElementById('categoryPieChart');

  if (!revCanvas || !catCanvas || typeof Chart === 'undefined') return;

  const isLight = document.body.getAttribute('data-theme') === 'ivory';
  const textColor = isLight ? '#5c5549' : '#9aa5b8';
  const gridColor = isLight ? 'rgba(162, 123, 72, 0.12)' : 'rgba(212, 175, 55, 0.08)';

  // 1. Revenue & Occupancy Line Chart
  const ctxRev = revCanvas.getContext('2d');
  revenueChart = new Chart(ctxRev, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Revenue (₹)',
          data: [142000, 168000, 155000, 189000, 215000, 248000, 194850],
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#d4af37',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Occupancy Rate (%)',
          data: [82, 88, 86, 91, 98, 99, 94.8],
          borderColor: '#38bdf8',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            font: { family: 'Outfit', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 15, 23, 0.95)',
          titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
          bodyFont: { family: 'Outfit', size: 12 },
          borderColor: 'rgba(212, 175, 55, 0.3)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              if (context.dataset.yAxisID === 'y1') {
                return `Occupancy: ${context.parsed.y}%`;
              }
              return `Revenue: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Outfit' },
            callback: (val) => '₹' + (val >= 100000 ? (val / 100000).toLocaleString('en-IN') + 'L' : (val / 1000).toLocaleString('en-IN') + 'k')
          }
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: textColor,
            font: { family: 'Outfit' },
            callback: (val) => val + '%'
          },
          min: 60,
          max: 100
        }
      }
    }
  });

  // 2. Room Category Revenue Share Donut Chart
  const ctxCat = catCanvas.getContext('2d');
  categoryChart = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: ['Penthouses (42%)', 'Lagoon Villas (31%)', 'Sky Suites (18%)', 'Deluxe Ocean (9%)'],
      datasets: [{
        data: [42, 31, 18, 9],
        backgroundColor: [
          '#d4af37',
          '#38bdf8',
          '#c084fc',
          '#4ade80'
        ],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            boxWidth: 12,
            font: { family: 'Outfit', size: 11 }
          }
        }
      }
    }
  });
}

function updateRevenueChartPeriod(period) {
  if (!revenueChart) return;

  if (period === '30 Days') {
    revenueChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    revenueChart.data.datasets[0].data = [1120000, 1340000, 1290000, 1480000];
    revenueChart.data.datasets[1].data = [87, 92, 90, 94.8];
  } else if (period === 'Quarterly') {
    revenueChart.data.labels = ['Q1 (Winter)', 'Q2 (Spring)', 'Q3 (Summer Peak)', 'Q4 (Fall Projection)'];
    revenueChart.data.datasets[0].data = [4200000, 5100000, 6800000, 5900000];
    revenueChart.data.datasets[1].data = [84, 89, 96, 91];
  } else {
    // 7 Days Default
    revenueChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    revenueChart.data.datasets[0].data = [1420000, 1680000, 1550000, 1890000, 2150000, 2480000, 194850];
    revenueChart.data.datasets[1].data = [82, 88, 86, 91, 98, 99, 94.8];
  }

  revenueChart.update();
  soundEngine.playChime('bell');
}

function updateChartsTheme() {
  if (!revenueChart || !categoryChart) return;
  const isLight = document.body.getAttribute('data-theme') === 'ivory';
  const textColor = isLight ? '#5c5549' : '#9aa5b8';
  const gridColor = isLight ? 'rgba(162, 123, 72, 0.12)' : 'rgba(212, 175, 55, 0.08)';

  revenueChart.options.scales.x.grid.color = gridColor;
  revenueChart.options.scales.x.ticks.color = textColor;
  revenueChart.options.scales.y.grid.color = gridColor;
  revenueChart.options.scales.y.ticks.color = textColor;
  revenueChart.options.plugins.legend.labels.color = textColor;
  revenueChart.update();

  categoryChart.options.plugins.legend.labels.color = textColor;
  categoryChart.update();
}

// --- CSV EXPORT FUNCTIONALITY ---
function generateOperationsReport() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Reservation ID,Guest Name,VIP Tier,Suite,Dates,Nights,Total Bill (INR),Status\n";

  RESERVATIONS_DATA.forEach(r => {
    csvContent += `"${r.id}","${r.guestName}","${r.vipTier}","${r.roomNumber}","${r.dates}","${r.nights}","${r.total}","${r.status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Aurelia_Grand_Operations_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  soundEngine.playChime('success');
  showToast('Export Completed', 'Hotel operations summary downloaded as CSV', 'success');
}

// --- TOAST NOTIFICATIONS ---
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let iconHtml = '<i class="fa-solid fa-crown"></i>';
  if (type === 'success') iconHtml = '<i class="fa-solid fa-check"></i>';
  if (type === 'info') iconHtml = '<i class="fa-solid fa-bell"></i>';

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      ${iconHtml}
    </div>
    <div class="toast-content">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4200);
}

// ==========================================================================
// PARTY HALL & BANQUET MODULE - FRONTEND STATE & CONTROLLERS
// ==========================================================================

// --- 1. PARTY HALL DATASET (Strictly INR / ₹ Currency) ---
let PARTY_HALLS_DATA = [
  {
    id: 'hall-royal-ballroom',
    name: 'Royal Grand Ballroom',
    type: 'Grand Ballroom',
    price: 85000,
    capacity: 650,
    size: '10,500 sq ft',
    floor: 'Ground Wing East',
    status: 'AVAILABLE',
    rating: 4.97,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    description: 'Majestic double-height pillarless hall adorned with imported Austrian crystal chandeliers, acoustic walnut panelling, dynamic RGB mood lighting, and a motorized theatrical stage with dedicated bridal and VIP green rooms.',
    amenities: ['Austrian Crystal Chandeliers', 'Bose Concert Sound Array', '4K LED Video Backdrop', 'Bridal Suite & Powder Room', 'Motorized Theatrical Stage', 'VIP Green Room', 'Valet Parking Fleet', 'Private Helipad Access'],
    suitableFor: ['Royal Wedding & Reception', 'Executive Corporate Gala', 'Tech Conference & Keynote', 'Luxury Product Showcase']
  },
  {
    id: 'hall-celebration',
    name: 'Aurelia Celebration Hall',
    type: 'Celebration Hall',
    price: 60000,
    capacity: 350,
    size: '6,800 sq ft',
    floor: '2nd Floor Sanctuary Wing',
    status: 'AVAILABLE',
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    description: 'An exquisitely styled celebration venue featuring open panoramic lagoon vistas, integrated cocktail lounges, and modern concert illumination engineered for milestone jubilees and high-society receptions.',
    amenities: ['Lagoon Terrace View', 'Cocktail Lounge & Bar', 'Digital Surround Sound', 'Bridal Powder Room', 'Custom DJ Console', 'High-Speed Wi-Fi 6', 'Valet Parking'],
    suitableFor: ['High-Society Anniversary', 'Cocktail & Social Soirée', 'Milestone Birthday Jubilee', 'Haute Couture Fashion Show']
  },
  {
    id: 'hall-coral',
    name: 'Coral Event Hall',
    type: 'Event Hall',
    price: 45000,
    capacity: 180,
    size: '3,800 sq ft',
    floor: 'Mezzanine Level Central',
    status: 'AVAILABLE',
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    description: 'An intimate executive banquet sanctuary tailored for high-stakes investor summits, corporate annual banquets, private family dinners, and confidential product reveals with private terrace breakout lounges.',
    amenities: ['Private Terrace Lounge', 'Video Conference Array', 'Motorized Retractable Screens', 'Private Barista Bar', 'Bespoke Ambient Lighting', 'Concierge Host'],
    suitableFor: ['Executive Corporate Gala', 'Tech Conference & Keynote', 'High-Society Anniversary', 'Cocktail & Social Soirée']
  },
  {
    id: 'hall-ocean-view',
    name: 'Ocean View Banquet Hall',
    type: 'Banquet Hall',
    price: 95000,
    capacity: 500,
    size: '9,200 sq ft',
    floor: 'Waterfront Pavilion',
    status: 'AVAILABLE',
    rating: 4.98,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80',
    description: 'Perched directly above the azure waters of the Atoll with floor-to-ceiling glass facades, open-air sun decks, and an illuminated infinity pool reflecting banquet dining tables under the night sky.',
    amenities: ['Overwater Infinity Deck', 'Panoramic Sunset Glazing', 'Harman Kardon Acoustic Array', 'Bridal Dressing Suite', 'Live Cooking Stations', 'Dedicated Butler Brigade'],
    suitableFor: ['Royal Wedding & Reception', 'Executive Corporate Gala', 'Luxury Product Showcase', 'Cocktail & Social Soirée']
  },
  {
    id: 'hall-glasshouse',
    name: 'The Glasshouse Pavilion',
    type: 'Glasshouse Pavilion',
    price: 110000,
    capacity: 420,
    size: '7,500 sq ft',
    floor: 'Botanical Gardens West',
    status: 'OCCUPIED',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    description: 'A breathtaking glass conservatory framed by century-old tropical flora, starlit glass skylights, climate-controlled environmental domes, and cascading wisteria florals for ethereal evening galas.',
    amenities: ['Climate-Controlled Domes', 'Star-Gazing Glass Ceilings', 'Integrated Floral Arbors', 'Concealed Bose Surround Sound', 'Private Valet Arrival Ring', 'Executive Chef Gazebo'],
    suitableFor: ['Royal Wedding & Reception', 'Haute Couture Fashion Show', 'Luxury Product Showcase', 'Milestone Birthday Jubilee']
  },
  {
    id: 'hall-lawn',
    name: 'Imperial Grand Lawn & Amphitheater',
    type: 'Outdoor Royal Lawn',
    price: 125000,
    capacity: 1200,
    size: '24,000 sq ft',
    floor: 'Private Peninsula',
    status: 'AVAILABLE',
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    description: 'Expansive oceanfront manicured lawn and open amphitheater overlooking the open sea. Ideal for mega-weddings, grand music festivals, royal fireworks displays, and high-capacity evening banquets.',
    amenities: ['Helipad VIP Entry', 'Laser & Fireworks Launch Pad', 'Giant LED Jumbotron Setup', 'Open-Air Amphitheater Stage', 'Private Beachfront Access', '1000-Vehicle Valet Lot'],
    suitableFor: ['Royal Wedding & Reception', 'Executive Corporate Gala', 'Luxury Product Showcase', 'Cocktail & Social Soirée']
  }
];

// --- 2. PARTY HALL BOOKINGS STATE (Mock Ledger) ---
let PARTY_HALL_BOOKINGS = [
  {
    id: 'BH-78201',
    hallId: 'hall-glasshouse',
    hallName: 'The Glasshouse Pavilion',
    hostName: 'Baroness Caroline von Habsburg',
    email: 'user@aureliagrand.com',
    phone: '+91 98111 22334',
    eventType: 'Royal Wedding & Reception',
    date: '2026-09-08',
    startTime: '17:00',
    endTime: '23:30',
    guests: 380,
    layout: 'Banquet Round Tables (10 per table)',
    addons: ['Royal Floral Stage & Lighting Concept', 'Michelin Banquet 5-Course & Premium Bar'],
    total: 168000,
    status: 'CONFIRMED',
    roleCreated: 'USER',
    userEmail: 'user@aureliagrand.com'
  },
  {
    id: 'BH-78202',
    hallId: 'hall-royal-ballroom',
    hallName: 'Royal Grand Ballroom',
    hostName: 'Aetheris Global AI Summit',
    email: 'admin@aureliagrand.com',
    phone: '+91 99222 33445',
    eventType: 'Tech Conference & Keynote',
    date: '2026-09-15',
    startTime: '09:00',
    endTime: '17:00',
    guests: 500,
    layout: 'Theater & Auditorium Seating',
    addons: ['Concert High-Fidelity Audio & 4K LED Screen', 'Michelin Banquet 5-Course & Premium Bar'],
    total: 132400,
    status: 'CONFIRMED',
    roleCreated: 'ADMIN',
    userEmail: 'admin@aureliagrand.com'
  },
  {
    id: 'BH-78203',
    hallId: 'hall-ocean-view',
    hallName: 'Ocean View Banquet Hall',
    hostName: 'Duchess Sophia of Monaco',
    email: 'staff@aureliagrand.com',
    phone: '+91 98333 44556',
    eventType: 'High-Society Anniversary',
    date: '2026-09-22',
    startTime: '19:00',
    endTime: '23:30',
    guests: 220,
    layout: 'Royal U-Shape VIP Arrangement',
    addons: ['Royal Floral Stage & Lighting Concept', 'Dedicated Butler Brigade & Valet Team'],
    total: 129920,
    status: 'CONFIRMED',
    roleCreated: 'STAFF',
    userEmail: 'staff@aureliagrand.com'
  },
  {
    id: 'AG-PH-00125',
    guestId: 'GST-1024',
    hallId: 'hall-glasshouse',
    hallName: 'The Glasshouse Pavilion',
    hostName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    eventType: 'Royal Anniversary Jubilee',
    date: '2026-10-14',
    startTime: '18:00',
    endTime: '23:30',
    guests: 250,
    layout: 'Banquet Round Tables (10 per table)',
    addons: ['Royal Floral Stage & Lighting Concept', 'Michelin Banquet 5-Course & Premium Bar'],
    total: 185000,
    status: 'CONFIRMED',
    roleCreated: 'ADMIN',
    userEmail: 'admin@aureliagrand.com'
  }
];

// --- 3. PARTY HALL STATS & KPI UPDATES ---
function updatePartyHallStats() {
  const totalHallsEl = document.getElementById('statsTotalHalls');
  const availHallsEl = document.getElementById('statsAvailableHalls');
  const banquetRevEl = document.getElementById('statsBanquetRevenue');

  const adminBadge = document.getElementById('adminBookingsCountBadge');
  const staffBadge = document.getElementById('staffBookingsCountBadge');
  const userBadge = document.getElementById('userBookingsCountBadge');

  const totalHalls = PARTY_HALLS_DATA.length;
  const availHalls = PARTY_HALLS_DATA.filter(h => h.status === 'AVAILABLE').length;

  // Compute revenue from confirmed banquet bookings
  const banquetRevenue = PARTY_HALL_BOOKINGS
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  if (totalHallsEl) totalHallsEl.textContent = totalHalls;
  if (availHallsEl) availHallsEl.textContent = availHalls;
  if (banquetRevEl) banquetRevEl.textContent = formatCurrency(banquetRevenue);

  const activeBookingsCount = PARTY_HALL_BOOKINGS.filter(b => b.status === 'CONFIRMED').length;
  if (adminBadge) adminBadge.textContent = activeBookingsCount;
  if (staffBadge) staffBadge.textContent = activeBookingsCount;

  // Current user's bookings count
  const currentUser = AuthManager.getCurrentUser();
  const userBookings = currentUser 
    ? PARTY_HALL_BOOKINGS.filter(b => b.userEmail === currentUser.email || b.roleCreated === 'USER' || b.roleCreated === 'GUEST').length
    : 1;
  if (userBadge) userBadge.textContent = userBookings;
}

// --- 4. RENDER PARTY HALLS GRID ---
function renderPartyHallsGrid(filteredHalls = null) {
  const grid = document.getElementById('partyHallsGrid');
  if (!grid) return;

  const hallsToDisplay = filteredHalls || PARTY_HALLS_DATA;
  const currentUser = AuthManager.getCurrentUser();
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  if (hallsToDisplay.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px dashed var(--border-subtle);">
        <i class="fa-solid fa-champagne-glasses" style="font-size: 3rem; color: var(--accent-gold); margin-bottom: 16px;"></i>
        <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">No Event Sanctuaries Match Search</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 420px; margin: 0 auto 20px;">
          Adjust your venue filters, guest capacity parameters, or clear search keyword.
        </p>
        <button class="btn-primary-luxury" onclick="resetHallFilters()">
          <i class="fa-solid fa-rotate-left"></i> Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = hallsToDisplay.map(hall => {
    let statusClass = 'available';
    let statusLabel = 'Available';
    if (hall.status === 'OCCUPIED') {
      statusClass = 'occupied';
      statusLabel = 'Occupied';
    } else if (hall.status === 'MAINTENANCE') {
      statusClass = 'maintenance';
      statusLabel = 'Maintenance';
    }

    return `
      <div class="hall-card" data-id="${hall.id}">
        <!-- Image & Overlay Badges -->
        <div class="hall-image-wrapper">
          <img src="${hall.image}" alt="${hall.name}" loading="lazy" />
          
          <div class="hall-overlay-top">
            <span class="hall-type-tag">${hall.type}</span>
            <span class="hall-status-pill ${statusClass}">${statusLabel}</span>
          </div>

          <div class="hall-rate-badge">
            <span class="rate-val">${formatCurrency(hall.price)}</span>
            <span class="rate-unit">per day + banquet GST</span>
          </div>
        </div>

        <!-- Body & Details -->
        <div class="hall-card-body">
          <div class="hall-location-meta">
            <i class="fa-solid fa-location-dot"></i>
            <span>${hall.floor}</span>
          </div>

          <h3 class="hall-card-title">${hall.name}</h3>
          
          <p class="hall-card-desc">${hall.description}</p>

          <!-- Specs Strip -->
          <div class="hall-specs-strip">
            <div class="spec-cell">
              <span class="spec-val">${hall.capacity}</span>
              <span class="spec-label">Max Guests</span>
            </div>
            <div class="spec-cell">
              <span class="spec-val">${hall.size}</span>
              <span class="spec-label">Area</span>
            </div>
            <div class="spec-cell">
              <span class="spec-val">${hall.rating} ★</span>
              <span class="spec-label">Rating</span>
            </div>
          </div>

          <!-- Amenities Preview Chips -->
          <div class="hall-amenities-row">
            ${hall.amenities.slice(0, 4).map(a => `
              <span class="hall-chip"><i class="fa-solid fa-sparkles"></i> ${a}</span>
            `).join('')}
          </div>

          <!-- Actions -->
          <div class="hall-card-footer">
            <div class="hall-actions-primary">
              <button class="btn-secondary-luxury" onclick="openPartyHallDetailsModal('${hall.id}')">
                <i class="fa-regular fa-eye"></i> Details
              </button>
              <button class="btn-primary-luxury" onclick="openPartyHallBookingModal('${hall.id}')">
                <i class="fa-solid fa-calendar-check"></i> Book Venue
              </button>
            </div>

            ${isAdmin ? `
              <div class="hall-actions-admin">
                <button class="btn-admin-icon" title="Edit Venue Information" onclick="openAdminEditHallModal('${hall.id}')">
                  <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="btn-admin-icon" title="Toggle Hall Status" onclick="togglePartyHallStatus('${hall.id}')">
                  <i class="fa-solid fa-arrows-rotate"></i> Status
                </button>
                <button class="btn-admin-icon danger" title="Delete Venue" onclick="deletePartyHall('${hall.id}')">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- 5. PARTY HALL SEARCH, MULTI-FILTER & SORT ---
function filterPartyHalls() {
  const searchInput = document.getElementById('hallSearchInput');
  const typeFilter = document.getElementById('hallTypeFilter');
  const capacityFilter = document.getElementById('hallCapacityFilter');
  const availFilter = document.getElementById('hallAvailFilter');
  const sortSelect = document.getElementById('hallSortSelect');

  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedType = typeFilter ? typeFilter.value : 'all';
  const selectedCap = capacityFilter ? capacityFilter.value : 'all';
  const selectedAvail = availFilter ? availFilter.value : 'all';
  const selectedSort = sortSelect ? sortSelect.value : 'default';

  let filtered = PARTY_HALLS_DATA.filter(hall => {
    // Search Query Match
    const matchesQuery = !q || 
      hall.name.toLowerCase().includes(q) ||
      hall.type.toLowerCase().includes(q) ||
      hall.floor.toLowerCase().includes(q) ||
      hall.description.toLowerCase().includes(q) ||
      hall.amenities.some(a => a.toLowerCase().includes(q));

    // Type Match
    const matchesType = (selectedType === 'all' || hall.type === selectedType);

    // Capacity Match
    let matchesCap = true;
    if (selectedCap === 'under200') {
      matchesCap = hall.capacity < 200;
    } else if (selectedCap === '200-400') {
      matchesCap = hall.capacity >= 200 && hall.capacity <= 400;
    } else if (selectedCap === 'over400') {
      matchesCap = hall.capacity > 400;
    }

    // Availability Match
    const matchesAvail = (selectedAvail === 'all' || hall.status === selectedAvail);

    return matchesQuery && matchesType && matchesCap && matchesAvail;
  });

  // Sorting
  if (selectedSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (selectedSort === 'capacity-desc') {
    filtered.sort((a, b) => b.capacity - a.capacity);
  } else if (selectedSort === 'capacity-asc') {
    filtered.sort((a, b) => a.capacity - b.capacity);
  }

  renderPartyHallsGrid(filtered);
}

function resetHallFilters() {
  const searchInput = document.getElementById('hallSearchInput');
  const typeFilter = document.getElementById('hallTypeFilter');
  const capacityFilter = document.getElementById('hallCapacityFilter');
  const availFilter = document.getElementById('hallAvailFilter');
  const sortSelect = document.getElementById('hallSortSelect');

  if (searchInput) searchInput.value = '';
  if (typeFilter) typeFilter.value = 'all';
  if (capacityFilter) capacityFilter.value = 'all';
  if (availFilter) availFilter.value = 'all';
  if (sortSelect) sortSelect.value = 'default';

  filterPartyHalls();
  soundEngine.playChime('bell');
}

// --- 6. PARTY HALL DETAILS MODAL ---
function openPartyHallDetailsModal(hallId) {
  const hall = PARTY_HALLS_DATA.find(h => h.id === hallId);
  if (!hall) return;

  const modal = document.getElementById('partyHallDetailsModal');
  const titleEl = document.getElementById('hallDetailsModalTitle');
  const subtitleEl = document.getElementById('hallDetailsModalSubtitle');
  const bodyEl = document.getElementById('hallDetailsModalBody');
  const bookBtn = document.getElementById('btnDetailsBookHall');

  if (titleEl) titleEl.textContent = hall.name;
  if (subtitleEl) subtitleEl.textContent = `${hall.type} • ${hall.floor}`;

  if (bodyEl) {
    let statusClass = 'available';
    let statusLabel = 'Available for Booking';
    if (hall.status === 'OCCUPIED') {
      statusClass = 'occupied';
      statusLabel = 'Currently Reserved';
    } else if (hall.status === 'MAINTENANCE') {
      statusClass = 'maintenance';
      statusLabel = 'Under Maintenance';
    }

    bodyEl.innerHTML = `
      <div class="hall-details-wrap">
        <!-- Hero Image -->
        <div class="hall-details-hero">
          <img src="${hall.image}" alt="${hall.name}" />
          <div class="hero-overlay">
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span class="hall-type-tag">${hall.type}</span>
              <span class="hall-status-pill ${statusClass}">${statusLabel}</span>
            </div>
            <h3 class="font-serif" style="font-size: 1.5rem; color: #ffffff;">${hall.name}</h3>
          </div>
        </div>

        <!-- 4-Metrics Strip -->
        <div class="hall-details-grid">
          <div class="detail-metric-card">
            <i class="fa-solid fa-users"></i>
            <span class="val">${hall.capacity} Guests</span>
            <span class="lbl">Capacity</span>
          </div>
          <div class="detail-metric-card">
            <i class="fa-solid fa-ruler-combined"></i>
            <span class="val">${hall.size}</span>
            <span class="lbl">Floor Area</span>
          </div>
          <div class="detail-metric-card">
            <i class="fa-solid fa-tag"></i>
            <span class="val" style="color: var(--accent-gold);">${formatCurrency(hall.price)}</span>
            <span class="lbl">Daily Rental</span>
          </div>
          <div class="detail-metric-card">
            <i class="fa-solid fa-compass"></i>
            <span class="val">${hall.floor}</span>
            <span class="lbl">Location</span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h4 style="font-size: 0.92rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; color: var(--accent-gold);">
            Architectural & Acoustic Overview
          </h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7;">
            ${hall.description}
          </p>
        </div>

        <!-- Amenities Chips -->
        <div>
          <h4 style="font-size: 0.92rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; color: var(--accent-gold);">
            Included Luxury Amenities & Technical Infrastructure
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${hall.amenities.map(a => `
              <span class="hall-chip" style="padding: 6px 12px; font-size: 0.8rem;">
                <i class="fa-solid fa-star"></i> ${a}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Suitable Occasions -->
        <div>
          <h4 style="font-size: 0.92rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; color: var(--accent-gold);">
            Curated Event Applications
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${hall.suitableFor.map(ev => `
              <span style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 0.78rem; padding: 5px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-champagne-glasses" style="color: var(--accent-gold); font-size: 0.7rem;"></i> ${ev}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Policy Box -->
        <div class="hall-policy-box">
          <strong><i class="fa-solid fa-shield-halved"></i> Aurelia Grand Banquet Protocol:</strong>
          Reservations require a 25% advance commitment deposit. Dedicated private butler brigade and executive catering coordination are assigned 72 hours prior to arrival. Cancellations with full reimbursement permitted up to 14 days before event commencement.
        </div>
      </div>
    `;
  }

  if (bookBtn) {
    bookBtn.onclick = () => {
      closePartyHallDetailsModal();
      openPartyHallBookingModal(hallId);
    };
  }

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closePartyHallDetailsModal() {
  const modal = document.getElementById('partyHallDetailsModal');
  if (modal) modal.classList.remove('open');
}

// --- 7. PARTY HALL BOOKING & LIVE AVAILABILITY ENGINE ---
function openPartyHallBookingModal(hallId) {
  closePartyHallDetailsModal();

  const hall = PARTY_HALLS_DATA.find(h => h.id === hallId) || PARTY_HALLS_DATA[0];
  if (!hall) return;

  const modal = document.getElementById('partyHallBookingModal');
  const subtitle = document.getElementById('bookingHallSubtitle');
  const summaryBox = document.getElementById('bookingVenueSummary');
  const hallIdInput = document.getElementById('hallBookingHallId');
  const dateInput = document.getElementById('hallBookingDate');
  const guestInput = document.getElementById('hallBookingGuestCount');
  const hostNameInput = document.getElementById('hallBookingHostName');
  const hostEmailInput = document.getElementById('hallBookingHostEmail');

  if (subtitle) subtitle.textContent = `${hall.name} • ${hall.type}`;
  if (hallIdInput) hallIdInput.value = hall.id;

  // Set default date to tomorrow in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.value = tomorrowStr;
  }

  if (guestInput) {
    guestInput.max = hall.capacity * 1.2; // leeway
    guestInput.value = Math.min(250, hall.capacity);
  }

  // Pre-fill user details if logged in
  const currentUser = AuthManager.getCurrentUser();
  if (currentUser) {
    if (hostNameInput && !hostNameInput.value) hostNameInput.value = currentUser.fullName;
    if (hostEmailInput && !hostEmailInput.value) hostEmailInput.value = currentUser.email;
  }

  // Populate Venue Summary Pill
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="${hall.image}" alt="${hall.name}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-accent);" />
        <div class="venue-info">
          <h4>${hall.name}</h4>
          <span>${hall.type} • Capacity: ${hall.capacity} Guests • ${hall.floor}</span>
        </div>
      </div>
      <div class="venue-rate">
        <span style="font-size: 0.72rem; color: var(--text-secondary); display: block;">Base Rate</span>
        <strong>${formatCurrency(hall.price)}</strong>
      </div>
    `;
  }

  // Run initial checks
  checkHallAvailability();
  recalculateHallBookingPrice();

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closePartyHallBookingModal() {
  const modal = document.getElementById('partyHallBookingModal');
  if (modal) modal.classList.remove('open');
}

// Check Live Availability for Hall, Date & Time Slot
function checkHallAvailability() {
  const hallIdInput = document.getElementById('hallBookingHallId');
  const dateInput = document.getElementById('hallBookingDate');
  const statusBox = document.getElementById('hallAvailStatusBox');
  const statusMsg = document.getElementById('hallAvailStatusMsg');
  const confirmBtn = document.getElementById('btnConfirmHallBooking');

  if (!hallIdInput || !dateInput || !statusBox) return true;

  const hallId = hallIdInput.value;
  const dateVal = dateInput.value;

  // Search existing confirmed bookings for conflict on this hall & date
  const conflict = PARTY_HALL_BOOKINGS.find(b => 
    b.hallId === hallId && 
    b.date === dateVal && 
    b.status !== 'CANCELLED'
  );

  if (conflict) {
    statusBox.className = 'avail-status-alert booked';
    statusBox.querySelector('i').className = 'fa-solid fa-circle-xmark';
    statusBox.querySelector('strong').textContent = 'Hall Already Booked';
    if (statusMsg) {
      statusMsg.innerHTML = `Conflict detected with <strong>${conflict.eventType}</strong> (Ref: <code>${conflict.id}</code>). Please pick another date or choose an alternate venue.`;
    }
    if (confirmBtn) confirmBtn.disabled = true;
    return false;
  } else {
    statusBox.className = 'avail-status-alert available';
    statusBox.querySelector('i').className = 'fa-solid fa-circle-check';
    statusBox.querySelector('strong').textContent = 'Venue Available';
    if (statusMsg) {
      statusMsg.textContent = `Selected date (${dateVal}) is completely open for reservations. Instant confirmation guaranteed.`;
    }
    if (confirmBtn) confirmBtn.disabled = false;
    return true;
  }
}

// Recalculate Booking Folio with Live Add-ons & Taxes
function recalculateHallBookingPrice() {
  const hallIdInput = document.getElementById('hallBookingHallId');
  const basePriceEl = document.getElementById('hallCalcBasePrice');
  const addonsEl = document.getElementById('hallCalcAddons');
  const taxEl = document.getElementById('hallCalcTax');
  const grandTotalEl = document.getElementById('hallCalcGrandTotal');

  if (!hallIdInput) return;

  const hall = PARTY_HALLS_DATA.find(h => h.id === hallIdInput.value);
  if (!hall) return;

  const basePrice = hall.price;

  let addonsTotal = 0;
  const addonCheckboxes = document.querySelectorAll('input[name="hallAddons"]:checked');
  addonCheckboxes.forEach(cb => {
    addonsTotal += parseInt(cb.dataset.price || '0', 10);
  });

  const subtotal = basePrice + addonsTotal;
  const tax = Math.round(subtotal * 0.12);
  const discount = 2000; // VIP Guest Courtesy Discount
  const grandTotal = Math.max(0, subtotal + tax - discount);

  if (basePriceEl) basePriceEl.textContent = formatCurrency(basePrice);
  if (addonsEl) addonsEl.textContent = formatCurrency(addonsTotal);
  if (taxEl) taxEl.textContent = formatCurrency(tax);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  return { basePrice, addonsTotal, tax, discount, grandTotal };
}

// Confirm Hall Booking Submission
function handleConfirmHallBooking() {
  const hallIdInput = document.getElementById('hallBookingHallId');
  const dateInput = document.getElementById('hallBookingDate');
  const startTimeInput = document.getElementById('hallBookingStartTime');
  const endTimeInput = document.getElementById('hallBookingEndTime');
  const hostNameInput = document.getElementById('hallBookingHostName');
  const hostEmailInput = document.getElementById('hallBookingHostEmail');
  const hostPhoneInput = document.getElementById('hallBookingHostPhone');
  const eventTypeInput = document.getElementById('hallBookingEventType');
  const guestsInput = document.getElementById('hallBookingGuestCount');
  const layoutInput = document.getElementById('hallBookingLayout');
  const requestsInput = document.getElementById('hallBookingRequests');

  const hall = PARTY_HALLS_DATA.find(h => h.id === hallIdInput.value);
  if (!hall) {
    showToast('Booking Error', 'Venue could not be found.', 'info');
    return;
  }

  // Validate live availability
  const isAvailable = checkHallAvailability();
  if (!isAvailable) {
    soundEngine.playChime('bell');
    showToast('Reservation Conflict', 'This venue is already booked for the selected date. Please choose another date.', 'info');
    return;
  }

  const calculation = recalculateHallBookingPrice();
  const selectedAddons = [];
  document.querySelectorAll('input[name="hallAddons"]:checked').forEach(cb => {
    selectedAddons.push(cb.nextElementSibling ? cb.nextElementSibling.textContent.trim() : 'Curated Add-on');
  });

  const bookingRef = `BH-${Math.floor(10000 + Math.random() * 90000)}`;
  const currentUser = AuthManager.getCurrentUser();

  const newBooking = {
    id: bookingRef,
    hallId: hall.id,
    hallName: hall.name,
    hostName: hostNameInput.value.trim(),
    email: hostEmailInput.value.trim(),
    phone: hostPhoneInput.value.trim(),
    eventType: eventTypeInput.value,
    date: dateInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    guests: parseInt(guestsInput.value, 10) || 100,
    layout: layoutInput.value,
    addons: selectedAddons,
    specialRequests: requestsInput ? requestsInput.value.trim() : '',
    total: calculation.grandTotal,
    status: 'CONFIRMED',
    roleCreated: currentUser ? currentUser.role : 'GUEST',
    userEmail: currentUser ? currentUser.email : hostEmailInput.value.trim()
  };

  // Add to active bookings
  PARTY_HALL_BOOKINGS.unshift(newBooking);

  const guestBookingObj = {
    id: bookingRef,
    guestId: currentUser ? `GST-${currentUser.id}` : 'GST-1024',
    type: 'hall',
    hallId: hall.id,
    title: hall.name,
    roomNumber: hall.id,
    guestName: hostNameInput.value.trim(),
    guestEmail: hostEmailInput.value.trim(),
    guestPhone: hostPhoneInput.value.trim(),
    vipTier: 'gold',
    checkIn: dateInput.value,
    checkOut: dateInput.value,
    nights: 1,
    adults: parseInt(guestsInput.value, 10) || 100,
    children: 0,
    basePrice: hall.price,
    addons: selectedAddons,
    subtotal: calculation.grandTotal,
    addonsTotal: 0,
    tax: 0,
    serviceCharge: 0,
    totalAmount: calculation.grandTotal,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Banquet Direct Folio',
    specialRequests: `${eventTypeInput.value} | ${layoutInput.value} | ${requestsInput ? requestsInput.value.trim() : ''}`,
    image: hall.image,
    createdAt: new Date().toISOString()
  };
  saveBooking(guestBookingObj);

  // Sync with backend database
  const hallToken = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
  if (hallToken) {
    fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hallToken}`
      },
      body: JSON.stringify({
        type: 'hall',
        hallId: hall.id,
        checkInDate: dateInput.value,
        checkOutDate: dateInput.value,
        guestName: hostNameInput.value.trim(),
        guestEmail: hostEmailInput.value.trim(),
        guestPhone: hostPhoneInput.value.trim(),
        guests: parseInt(guestsInput.value, 10) || 100,
        specialRequests: `${eventTypeInput.value} | ${layoutInput.value} | ${requestsInput ? requestsInput.value.trim() : ''}`,
        paymentMethod: 'Banquet Direct Folio',
        currency: 'INR'
      })
    }).then(res => res.ok ? res.json() : null)
      .then(saved => {
        if (saved && saved.id) {
          newBooking.id = saved.id;
          guestBookingObj.id = saved.id;
          saveBooking(guestBookingObj);
          if (typeof syncBookingsFromBackend === 'function') {
            syncBookingsFromBackend();
          }
        }
      }).catch(e => console.warn('[Hall Backend Booking]', e));
  }

  // Close modal and play audio chime
  closePartyHallBookingModal();
  soundEngine.playChime('success');

  // Notify user
  showToast(
    'Banquet Reservation Confirmed',
    `Booking Ref: ${bookingRef} secured for ${hall.name} on ${newBooking.date} (${formatCurrency(newBooking.total)})`,
    'success'
  );

  // Refresh stats & grid
  updatePartyHallStats();
  renderPartyHallsGrid();
  renderBookingsByActiveRole();
  updateBookingsNavBadge();
}

// --- 8. ADMIN ADD / EDIT / DELETE HALL CONTROLS ---
function openAdminAddHallModal() {
  const form = document.getElementById('adminPartyHallForm');
  const title = document.getElementById('adminHallModalTitle');
  const idInput = document.getElementById('adminFormHallId');

  if (form) form.reset();
  if (idInput) idInput.value = '';
  if (title) title.textContent = 'Add New Event Sanctuary';

  const modal = document.getElementById('adminPartyHallModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function openAdminEditHallModal(hallId) {
  const hall = PARTY_HALLS_DATA.find(h => h.id === hallId);
  if (!hall) return;

  const modal = document.getElementById('adminPartyHallModal');
  const title = document.getElementById('adminHallModalTitle');
  const idInput = document.getElementById('adminFormHallId');
  const nameInput = document.getElementById('adminHallName');
  const typeInput = document.getElementById('adminHallType');
  const priceInput = document.getElementById('adminHallPrice');
  const capacityInput = document.getElementById('adminHallCapacity');
  const sizeInput = document.getElementById('adminHallSize');
  const floorInput = document.getElementById('adminHallFloor');
  const statusInput = document.getElementById('adminHallStatus');
  const imageInput = document.getElementById('adminHallImage');
  const descInput = document.getElementById('adminHallDescription');
  const amenitiesInput = document.getElementById('adminHallAmenities');

  if (idInput) idInput.value = hall.id;
  if (title) title.textContent = `Edit: ${hall.name}`;
  if (nameInput) nameInput.value = hall.name;
  if (typeInput) typeInput.value = hall.type;
  if (priceInput) priceInput.value = hall.price;
  if (capacityInput) capacityInput.value = hall.capacity;
  if (sizeInput) sizeInput.value = hall.size;
  if (floorInput) floorInput.value = hall.floor;
  if (statusInput) statusInput.value = hall.status;
  if (imageInput) imageInput.value = hall.image;
  if (descInput) descInput.value = hall.description;
  if (amenitiesInput) amenitiesInput.value = hall.amenities.join(', ');

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeAdminPartyHallModal() {
  const modal = document.getElementById('adminPartyHallModal');
  if (modal) modal.classList.remove('open');
}

function handleSaveAdminPartyHall() {
  const idInput = document.getElementById('adminFormHallId');
  const nameInput = document.getElementById('adminHallName');
  const typeInput = document.getElementById('adminHallType');
  const priceInput = document.getElementById('adminHallPrice');
  const capacityInput = document.getElementById('adminHallCapacity');
  const sizeInput = document.getElementById('adminHallSize');
  const floorInput = document.getElementById('adminHallFloor');
  const statusInput = document.getElementById('adminHallStatus');
  const imageInput = document.getElementById('adminHallImage');
  const descInput = document.getElementById('adminHallDescription');
  const amenitiesInput = document.getElementById('adminHallAmenities');

  const hallId = idInput ? idInput.value : '';
  const amenitiesArray = amenitiesInput.value
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0);

  if (hallId) {
    // Edit existing hall
    const hall = PARTY_HALLS_DATA.find(h => h.id === hallId);
    if (hall) {
      hall.name = nameInput.value.trim();
      hall.type = typeInput.value;
      hall.price = parseInt(priceInput.value, 10) || 50000;
      hall.capacity = parseInt(capacityInput.value, 10) || 100;
      hall.size = sizeInput.value.trim();
      hall.floor = floorInput.value.trim();
      hall.status = statusInput.value;
      hall.image = imageInput.value.trim();
      hall.description = descInput.value.trim();
      hall.amenities = amenitiesArray;

      showToast('Hall Updated', `${hall.name} inventory details saved successfully.`, 'success');
    }
  } else {
    // Add new hall
    const newId = `hall-custom-${Date.now()}`;
    const newHall = {
      id: newId,
      name: nameInput.value.trim(),
      type: typeInput.value,
      price: parseInt(priceInput.value, 10) || 50000,
      capacity: parseInt(capacityInput.value, 10) || 100,
      size: sizeInput.value.trim(),
      floor: floorInput.value.trim(),
      status: statusInput.value,
      rating: 4.95,
      image: imageInput.value.trim(),
      description: descInput.value.trim(),
      amenities: amenitiesArray,
      suitableFor: ['Royal Wedding & Reception', 'Executive Corporate Gala', 'Cocktail & Social Soirée']
    };

    PARTY_HALLS_DATA.unshift(newHall);
    showToast('New Hall Added', `${newHall.name} is now live in the banquet portfolio.`, 'success');
  }

  closeAdminPartyHallModal();
  soundEngine.playChime('success');
  updatePartyHallStats();
  renderPartyHallsGrid();
}

function deletePartyHall(hallId) {
  const hall = PARTY_HALLS_DATA.find(h => h.id === hallId);
  if (!hall) return;

  if (confirm(`Are you sure you want to decommission "${hall.name}" from the banquet portfolio?`)) {
    PARTY_HALLS_DATA = PARTY_HALLS_DATA.filter(h => h.id !== hallId);
    soundEngine.playChime('bell');
    showToast('Venue Removed', `${hall.name} has been decommissioned.`, 'info');
    updatePartyHallStats();
    renderPartyHallsGrid();
  }
}

function togglePartyHallStatus(hallId) {
  const hall = PARTY_HALLS_DATA.find(h => h.id === hallId);
  if (!hall) return;

  if (hall.status === 'AVAILABLE') {
    hall.status = 'OCCUPIED';
  } else if (hall.status === 'OCCUPIED') {
    hall.status = 'MAINTENANCE';
  } else {
    hall.status = 'AVAILABLE';
  }

  soundEngine.playChime('bell');
  showToast('Status Updated', `${hall.name} is now marked as ${hall.status}.`, 'info');
  updatePartyHallStats();
  renderPartyHallsGrid();
}

// --- 9. BANQUET BOOKINGS OVERVIEW MODAL (Admin, Staff & User) ---
function openPartyHallBookingsModal() {
  const modal = document.getElementById('partyHallBookingsListModal');
  const title = document.getElementById('bookingsModalTitle');
  const subtitle = document.getElementById('bookingsModalSubtitle');
  const summaryText = document.getElementById('bookingsModalSummaryText');

  if (title) title.textContent = 'All Banquet & Party Hall Reservations';
  if (subtitle) subtitle.textContent = 'Comprehensive operations schedule and folio receipts ledger';
  if (summaryText) summaryText.textContent = `Displaying ${PARTY_HALL_BOOKINGS.length} banquet reservations`;

  renderPartyHallBookingsTable(PARTY_HALL_BOOKINGS);

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function openUserMyBookingsModal() {
  const modal = document.getElementById('partyHallBookingsListModal');
  const title = document.getElementById('bookingsModalTitle');
  const subtitle = document.getElementById('bookingsModalSubtitle');
  const summaryText = document.getElementById('bookingsModalSummaryText');

  const currentUser = AuthManager.getCurrentUser();
  const userBookings = currentUser
    ? PARTY_HALL_BOOKINGS.filter(b => b.userEmail === currentUser.email || b.roleCreated === 'USER' || b.roleCreated === 'GUEST')
    : PARTY_HALL_BOOKINGS;

  if (title) title.textContent = 'My Banquet & Party Hall Reservations';
  if (subtitle) subtitle.textContent = 'Active bookings and confirmed celebration folios';
  if (summaryText) summaryText.textContent = `Displaying ${userBookings.length} confirmed event reservation(s)`;

  renderPartyHallBookingsTable(userBookings);

  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closePartyHallBookingsModal() {
  const modal = document.getElementById('partyHallBookingsListModal');
  if (modal) modal.classList.remove('open');
}

function renderPartyHallBookingsTable(bookings) {
  const tbody = document.getElementById('hallBookingsTableBody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 8px; display: block;"></i>
          No banquet reservations found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const isCancelled = b.status === 'CANCELLED';
    return `
      <tr>
        <td>
          <strong style="color: var(--accent-gold); font-size: 0.85rem;">${b.id}</strong>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${b.hallName}</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">${b.layout || 'Standard'}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${b.hostName}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${b.eventType}</div>
        </td>
        <td>
          <div>${b.date}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.startTime} - ${b.endTime}</div>
        </td>
        <td>
          <span>${b.guests} Guests</span>
        </td>
        <td>
          <strong style="color: var(--accent-gold);">${formatCurrency(b.total)}</strong>
        </td>
        <td>
          <span class="room-status-badge ${isCancelled ? 'status-maintenance' : 'status-available'}">
            ${b.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${!isCancelled ? `
              <button class="btn-icon-square" title="Cancel Reservation" onclick="cancelHallBooking('${b.id}')">
                <i class="fa-solid fa-ban" style="color: #f87171;"></i>
              </button>
            ` : ''}
            <button class="btn-icon-square" title="View Folio / Pass" onclick="showToast('Folio Loaded', 'Event Folio loaded for ${b.id}', 'info')">
              <i class="fa-solid fa-receipt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function cancelHallBooking(bookingRef) {
  const booking = PARTY_HALL_BOOKINGS.find(b => b.id === bookingRef);
  if (!booking) return;

  if (confirm(`Are you sure you want to cancel Banquet Reservation ${bookingRef}?`)) {
    booking.status = 'CANCELLED';
    soundEngine.playChime('bell');
    showToast('Reservation Cancelled', `Banquet Booking ${bookingRef} has been cancelled.`, 'info');
    updatePartyHallStats();
    renderPartyHallBookingsTable(PARTY_HALL_BOOKINGS);
  }
}

// Global exposure for event triggers
window.openPartyHallDetailsModal = openPartyHallDetailsModal;
window.closePartyHallDetailsModal = closePartyHallDetailsModal;
window.openPartyHallBookingModal = openPartyHallBookingModal;
window.closePartyHallBookingModal = closePartyHallBookingModal;
window.openAdminAddHallModal = openAdminAddHallModal;
window.openAdminEditHallModal = openAdminEditHallModal;
window.closeAdminPartyHallModal = closeAdminPartyHallModal;
window.deletePartyHall = deletePartyHall;
window.togglePartyHallStatus = togglePartyHallStatus;
window.openPartyHallBookingsModal = openPartyHallBookingsModal;
window.openUserMyBookingsModal = openUserMyBookingsModal;
window.closePartyHallBookingsModal = closePartyHallBookingsModal;
window.cancelHallBooking = cancelHallBooking;
window.filterPartyHalls = filterPartyHalls;
window.resetHallFilters = resetHallFilters;
window.checkHallAvailability = checkHallAvailability;
window.recalculateHallBookingPrice = recalculateHallBookingPrice;

// ==========================================================================
// AURELIA GRAND LUXURY BOOKINGS SYSTEM - COMPLETE ENGINE
// ==========================================================================

const BOOKINGS_STORAGE_KEY = 'aurelia_bookings';

const INITIAL_BOOKINGS_DATA = [
  {
    id: 'AG-2026-00124',
    guestId: 'GST-1024',
    type: 'room',
    roomId: 'SUITE-205',
    title: 'Royal Grand Suite',
    roomNumber: '205',
    guestName: 'John Doe',
    guestEmail: 'john.doe@example.com',
    guestPhone: '+91 98765 43210',
    vipTier: 'gold',
    checkIn: '2026-10-12',
    checkOut: '2026-10-16',
    nights: 4,
    adults: 2,
    children: 0,
    basePrice: 30000,
    addons: [],
    subtotal: 120000,
    addonsTotal: 0,
    tax: 0,
    serviceCharge: 0,
    totalAmount: 120000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Visa Infinite (Luxury Folio)',
    specialRequests: 'High floor, late arrival, complimentary airport transfer',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'AG-2026-00128',
    guestId: 'GST-1028',
    type: 'room',
    roomId: 'R-702',
    title: 'The Royal Horizon Penthouse',
    roomNumber: '702',
    guestName: 'John Smith',
    guestEmail: 'john.smith@luxuryhotels.com',
    guestPhone: '+1 555-0199',
    vipTier: 'diamond',
    checkIn: '2026-10-18',
    checkOut: '2026-10-22',
    nights: 4,
    adults: 2,
    children: 0,
    basePrice: 45000,
    addons: [],
    subtotal: 180000,
    addonsTotal: 0,
    tax: 0,
    serviceCharge: 0,
    totalAmount: 180000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Amex Centurion',
    specialRequests: 'Sunset observation deck reserved daily',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-02T12:00:00.000Z'
  },
  {
    id: 'AG-2026-00129',
    guestId: 'GST-1029',
    type: 'room',
    roomId: 'R-605',
    title: 'Coral Reef Sunset Villa',
    roomNumber: '605',
    guestName: 'Johnny Wilson',
    guestEmail: 'j.wilson@summit.org',
    guestPhone: '+44 7700 900123',
    vipTier: 'silver',
    checkIn: '2026-10-20',
    checkOut: '2026-10-25',
    nights: 5,
    adults: 2,
    children: 1,
    basePrice: 19800,
    addons: [],
    subtotal: 99000,
    addonsTotal: 0,
    tax: 0,
    serviceCharge: 0,
    totalAmount: 99000,
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Pending Guarantee',
    specialRequests: 'Quiet lagoon side villa',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-03T15:30:00.000Z'
  },
  {
    id: 'AG-2026-00131',
    guestId: 'GST-1031',
    type: 'room',
    roomId: 'ROOM-101',
    title: 'Deluxe Oceanfront Suite',
    roomNumber: '101',
    guestName: 'Arun Kumar',
    guestEmail: 'arun.kumar@techcorp.in',
    guestPhone: '+91 98450 11223',
    vipTier: 'gold',
    checkIn: '2026-11-01',
    checkOut: '2026-11-05',
    nights: 4,
    adults: 2,
    children: 0,
    basePrice: 18000,
    addons: [],
    subtotal: 72000,
    addonsTotal: 0,
    tax: 0,
    serviceCharge: 0,
    totalAmount: 72000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI Direct NetBanking',
    specialRequests: 'Ground level room with fast WiFi',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-04T16:00:00.000Z'
  },
  {
    id: 'AG-PH-00125',
    guestId: 'GST-1024',
    type: 'hall',
    hallId: 'hall-glasshouse',
    title: 'The Glasshouse Pavilion',
    roomNumber: 'GH-01',
    guestName: 'John Doe',
    guestEmail: 'john.doe@example.com',
    guestPhone: '+91 98765 43210',
    vipTier: 'gold',
    checkIn: '2026-10-14',
    checkOut: '2026-10-14',
    nights: 1,
    adults: 250,
    children: 0,
    basePrice: 185000,
    addons: [{ name: 'Royal Floral Stage & Lighting Concept', price: 28000 }],
    subtotal: 185000,
    addonsTotal: 28000,
    tax: 0,
    serviceCharge: 0,
    totalAmount: 185000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Corporate Wire Clearance',
    specialRequests: 'Royal Anniversary Jubilee, evening banquet',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-09-05T11:00:00.000Z'
  },
  {
    id: 'AG-2026-08142',
    guestId: 'GST-1001',
    type: 'room',
    roomId: 'R-701',
    title: 'The Imperial Ocean Penthouse',
    roomNumber: '701',
    guestName: 'Lord Arthur Wellington',
    guestEmail: 'user@aureliagrand.com',
    guestPhone: '+91 98765 43210',
    vipTier: 'diamond',
    checkIn: '2026-09-02',
    checkOut: '2026-09-09',
    nights: 7,
    adults: 2,
    children: 0,
    basePrice: 3450,
    addons: [{ name: 'Helipad VIP Private Transfer', price: 1500 }, { name: 'Vintage Champagne & Beluga Caviar', price: 2200 }],
    subtotal: 24150,
    addonsTotal: 3700,
    tax: 3342,
    serviceCharge: 1393,
    totalAmount: 32585,
    status: 'Checked In',
    paymentStatus: 'Paid',
    paymentMethod: 'Amex Centurion',
    specialRequests: 'Helipad private greeting, vintage champagne sabering on arrival',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-28T10:00:00.000Z'
  },
  {
    id: 'AG-2026-08143',
    guestId: 'GST-1002',
    type: 'room',
    roomId: 'R-602',
    title: 'Royal Lagoon Overwater Villa',
    roomNumber: '602',
    guestName: 'Sophia Lorenze',
    guestEmail: 'user@aureliagrand.com',
    guestPhone: '+41 79 123 4567',
    vipTier: 'gold',
    checkIn: '2026-09-12',
    checkOut: '2026-09-16',
    nights: 4,
    adults: 2,
    children: 0,
    basePrice: 2150,
    addons: [{ name: 'Private Sunset Catamaran Charter', price: 3500 }],
    subtotal: 8600,
    addonsTotal: 3500,
    tax: 1452,
    serviceCharge: 605,
    totalAmount: 14157,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Visa Infinite',
    specialRequests: 'Sunset terrace dinner arrangement, organic spa salts',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-01T14:30:00.000Z'
  },
  {
    id: 'AG-2026-08144',
    guestId: 'GST-1003',
    type: 'room',
    roomId: 'R-504',
    title: 'Presidential Sky Suite',
    roomNumber: '504',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@monaco-yachts.mc',
    guestPhone: '+377 98 76 54 32',
    vipTier: 'silver',
    checkIn: '2026-09-18',
    checkOut: '2026-09-23',
    nights: 5,
    adults: 3,
    children: 1,
    basePrice: 1850,
    addons: [{ name: 'Daily Michelin In-Suite Breakfast', price: 800 }],
    subtotal: 9250,
    addonsTotal: 800,
    tax: 1206,
    serviceCharge: 503,
    totalAmount: 11759,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Mastercard World Elite',
    specialRequests: 'Hypoallergenic pillows and extra baby cot',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-02T11:20:00.000Z'
  },
  {
    id: 'AG-2026-08145',
    guestId: 'GST-1004',
    type: 'room',
    roomId: 'R-305',
    title: 'Deluxe Coral Oceanfront',
    roomNumber: '305',
    guestName: 'Julian & Genevieve Vance',
    guestEmail: 'user@aureliagrand.com',
    guestPhone: '+91 99887 76655',
    vipTier: 'gold',
    checkIn: '2026-09-25',
    checkOut: '2026-09-28',
    nights: 3,
    adults: 2,
    children: 0,
    basePrice: 980,
    addons: [],
    subtotal: 2940,
    addonsTotal: 0,
    tax: 353,
    serviceCharge: 147,
    totalAmount: 3440,
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Pending Front Desk Billing',
    specialRequests: 'Quiet high floor suite away from elevators',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-04T09:00:00.000Z'
  },
  {
    id: 'AG-2026-08146',
    guestId: 'GST-1005',
    type: 'room',
    roomId: 'R-202',
    title: 'Bespoke Executive Terrace',
    roomNumber: '202',
    guestName: 'Ambassador Jean Dupont',
    guestEmail: 'user@aureliagrand.com',
    userEmail: 'user@aureliagrand.com',
    guestPhone: '+33 1 42 68 00 00',
    vipTier: 'diamond',
    checkIn: '2026-08-10',
    checkOut: '2026-08-16',
    nights: 6,
    adults: 2,
    children: 0,
    basePrice: 890,
    addons: [{ name: 'Executive Security Escort', price: 1200 }],
    subtotal: 5340,
    addonsTotal: 1200,
    tax: 785,
    serviceCharge: 327,
    totalAmount: 7652,
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMethod: 'Diplomatic Direct Billing',
    specialRequests: 'Encrypted high-speed network terminal',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-01T15:00:00.000Z'
  },
  {
    id: 'AG-2026-08147',
    guestId: 'GST-1006',
    type: 'room',
    roomId: 'R-702',
    title: 'The Royal Horizon Penthouse',
    roomNumber: '702',
    guestName: 'Countess Vivienne d’Orsay',
    guestEmail: 'user@aureliagrand.com',
    guestPhone: '+33 6 12 34 56 78',
    vipTier: 'diamond',
    checkIn: '2026-08-20',
    checkOut: '2026-08-24',
    nights: 4,
    adults: 4,
    children: 0,
    basePrice: 3200,
    addons: [{ name: 'Private Teppanyaki Chef Experience', price: 2800 }],
    subtotal: 12800,
    addonsTotal: 2800,
    tax: 1872,
    serviceCharge: 780,
    totalAmount: 18252,
    status: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentMethod: 'Refunded to Visa Platinum',
    specialRequests: 'Dedicated master sommelier on-call',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-15T18:20:00.000Z'
  },
  {
    id: 'AG-2026-08148',
    guestId: 'GST-1007',
    type: 'hall',
    hallId: 'hall-glasshouse',
    title: 'The Glasshouse Pavilion',
    roomNumber: 'GH-01',
    guestName: 'Baroness Caroline von Habsburg',
    guestEmail: 'user@aureliagrand.com',
    guestPhone: '+91 98111 22334',
    vipTier: 'diamond',
    checkIn: '2026-09-08',
    checkOut: '2026-09-08',
    nights: 1,
    adults: 380,
    children: 0,
    basePrice: 110000,
    addons: [{ name: 'Royal Floral Stage Concept', price: 28000 }, { name: 'Michelin Banquet 5-Course & Premium Bar', price: 30000 }],
    subtotal: 110000,
    addonsTotal: 58000,
    tax: 20160,
    serviceCharge: 8400,
    totalAmount: 196560,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'International Wire Clearance',
    specialRequests: 'Royal Floral Stage, 4K LED Screen Backdrop, Red Carpet Arrival Ring',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-20T12:00:00.000Z'
  },
  {
    id: 'AG-2026-08149',
    guestId: 'GST-1008',
    type: 'hall',
    hallId: 'hall-royal-ballroom',
    title: 'Royal Grand Ballroom',
    roomNumber: 'RGB-01',
    guestName: 'Aetheris Global AI Summit',
    guestEmail: 'admin@aureliagrand.com',
    guestPhone: '+91 99222 33445',
    vipTier: 'gold',
    checkIn: '2026-09-15',
    checkOut: '2026-09-15',
    nights: 1,
    adults: 500,
    children: 0,
    basePrice: 85000,
    addons: [{ name: 'Bose Concert Sound & 4K LED Screen', price: 25000 }, { name: 'Executive Catering Package', price: 22400 }],
    subtotal: 85000,
    addonsTotal: 47400,
    tax: 15888,
    serviceCharge: 6620,
    totalAmount: 154908,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Corporate Direct Billing',
    specialRequests: 'Theater seating with dual translation booths',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-25T16:00:00.000Z'
  }
];

// --- STORAGE ACCESS HELPERS ---
function loadBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS_DATA));
      return [...INITIAL_BOOKINGS_DATA];
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    // Guarantee required test seeds exist even if localStorage was pre-populated
    INITIAL_BOOKINGS_DATA.forEach(seed => {
      const existingIdx = parsed.findIndex(b => b.id === seed.id);
      if (existingIdx === -1) {
        parsed.unshift(seed);
        updated = true;
      } else {
        if (!parsed[existingIdx].guestId && seed.guestId) {
          parsed[existingIdx].guestId = seed.guestId;
          updated = true;
        }
        if (!parsed[existingIdx].roomId && seed.roomId) {
          parsed[existingIdx].roomId = seed.roomId;
          updated = true;
        }
      }
    });
    if (updated) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.warn('[Bookings] Error parsing storage, reverting to seed:', e);
    return [...INITIAL_BOOKINGS_DATA];
  }
}

function persistBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('[Bookings] Error persisting bookings:', e);
  }
}

function getBookingById(id) {
  const bookings = loadBookings();
  return bookings.find(b => b.id === id) || null;
}

function saveBooking(booking) {
  const bookings = loadBookings();
  const index = bookings.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    bookings[index] = booking;
  } else {
    bookings.unshift(booking);
  }
  persistBookings(bookings);
}

// Global active filter states
let currentGuestBookingFilter = 'all';
let currentStaffBookingFilter = 'all';

// ==========================================================================
// 1. GUEST BOOKINGS CONTROLLER (MY BOOKINGS)
// ==========================================================================

function setGuestBookingFilter(filter) {
  currentGuestBookingFilter = filter;
  const chips = document.querySelectorAll('#guestFilterChips .filter-chip');
  chips.forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === filter);
  });
  renderGuestBookings();
  soundEngine.playChime('bell');
}

function filterGuestBookings() {
  renderGuestBookings();
}

function renderGuestBookings() {
  const grid = document.getElementById('guestBookingsGrid');
  const emptyState = document.getElementById('guestBookingsEmpty');
  if (!grid) return;

  const allBookings = loadBookings();
  const currentUser = AuthManager.getCurrentUser();
  const userEmail = currentUser ? currentUser.email : 'user@aureliagrand.com';

  const currentGuestId = currentUser ? `GST-${currentUser.id}` : null;
  const isDemoGuest = !currentUser || userEmail.toLowerCase() === 'user@aureliagrand.com' || userEmail.toLowerCase() === 'guest@aureliagrand.com';

  // Filter bookings strictly belonging to the authenticated guest user
  const userBookings = allBookings.filter(b => {
    const emailMatch = (b.guestEmail && b.guestEmail.toLowerCase() === userEmail.toLowerCase()) ||
                       (b.userEmail && b.userEmail.toLowerCase() === userEmail.toLowerCase());
    const idMatch = currentGuestId && b.guestId === currentGuestId;
    if (emailMatch || idMatch) return true;
    if (isDemoGuest && (!b.guestEmail || b.guestEmail.toLowerCase() === 'user@aureliagrand.com')) return true;
    return false;
  });

  // Calculate top summary card metrics
  const upcomingCount = userBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const activeCount = userBookings.filter(b => b.status === 'Checked In').length;
  const completedCount = userBookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = userBookings.filter(b => b.status === 'Cancelled').length;

  const statUpcomingEl = document.getElementById('guestStatUpcoming');
  const statActiveEl = document.getElementById('guestStatActive');
  const statCompletedEl = document.getElementById('guestStatCompleted');
  const statCancelledEl = document.getElementById('guestStatCancelled');

  if (statUpcomingEl) statUpcomingEl.textContent = upcomingCount;
  if (statActiveEl) statActiveEl.textContent = activeCount;
  if (statCompletedEl) statCompletedEl.textContent = completedCount;
  if (statCancelledEl) statCancelledEl.textContent = cancelledCount;

  // Update filter chip badge counts
  const countAllEl = document.getElementById('guestCountAll');
  const countUpcomingEl = document.getElementById('guestCountUpcoming');
  const countActiveEl = document.getElementById('guestCountActive');
  const countCompletedEl = document.getElementById('guestCountCompleted');
  const countCancelledEl = document.getElementById('guestCountCancelled');

  if (countAllEl) countAllEl.textContent = userBookings.length;
  if (countUpcomingEl) countUpcomingEl.textContent = upcomingCount;
  if (countActiveEl) countActiveEl.textContent = activeCount;
  if (countCompletedEl) countCompletedEl.textContent = completedCount;
  if (countCancelledEl) countCancelledEl.textContent = cancelledCount;

  // Apply search query & filters
  const searchInput = document.getElementById('guestBookingSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const typeFilter = document.getElementById('guestBookingTypeFilter')?.value || 'all';

  let filtered = userBookings.filter(b => {
    // Status filter
    if (currentGuestBookingFilter === 'upcoming' && !(b.status === 'Confirmed' || b.status === 'Pending')) return false;
    if (currentGuestBookingFilter === 'active' && b.status !== 'Checked In') return false;
    if (currentGuestBookingFilter === 'completed' && b.status !== 'Completed') return false;
    if (currentGuestBookingFilter === 'cancelled' && b.status !== 'Cancelled') return false;

    // Type filter
    if (typeFilter !== 'all' && b.type !== typeFilter) return false;

    // Text search
    if (query) {
      const matchId = b.id.toLowerCase().includes(query);
      const matchTitle = (b.title || '').toLowerCase().includes(query);
      const matchRoom = (b.roomNumber || '').toLowerCase().includes(query);
      if (!matchId && !matchTitle && !matchRoom) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(b => {
    const isHall = b.type === 'hall';
    const isCompleted = b.status === 'Completed';
    const isCancelled = b.status === 'Cancelled';
    const canModify = !isCompleted && !isCancelled;

    let statusBadgeClass = 'status-confirmed';
    if (b.status === 'Pending') statusBadgeClass = 'status-pending';
    if (b.status === 'Checked In') statusBadgeClass = 'status-checked-in';
    if (b.status === 'Completed') statusBadgeClass = 'status-completed';
    if (b.status === 'Cancelled') statusBadgeClass = 'status-cancelled';

    let payBadgeClass = 'payment-paid';
    if (b.paymentStatus === 'Pending') payBadgeClass = 'payment-pending';
    if (b.paymentStatus === 'Refunded') payBadgeClass = 'payment-refunded';

    const formattedAmount = formatCurrency(b.totalAmount);

    return `
      <div class="luxury-booking-card" id="bookingCard-${b.id}">
        <div class="booking-card-media">
          <img src="${b.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}" alt="${b.title}" loading="lazy" />
          <div class="booking-card-overlay">
            <div class="booking-media-top">
              <span class="booking-id-tag">${b.id}</span>
              <span class="booking-type-badge ${isHall ? 'hall' : 'room'}">
                <i class="fa-solid ${isHall ? 'fa-champagne-glasses' : 'fa-bed'}"></i> ${isHall ? 'Party Hall' : 'Suite'}
              </span>
            </div>
            <div class="booking-media-bottom">
              <h4 class="font-serif">${b.title}</h4>
              <span>${isHall ? `Banquet Venue • ${b.adults || b.guests || 200} Capacity` : `Suite ${b.roomNumber} • ${b.nights || 1} Night(s)`}</span>
            </div>
          </div>
        </div>

        <div class="booking-card-body">
          <div class="booking-dates-strip">
            <div class="date-point">
              <span class="date-lbl">${isHall ? 'Event Date' : 'Check-in'}</span>
              <span class="date-val">${b.checkIn}</span>
            </div>
            <div class="date-arrow-divider">
              <i class="fa-solid fa-arrow-right-long"></i>
            </div>
            <div class="date-point">
              <span class="date-lbl">${isHall ? 'Concludes' : 'Check-out'}</span>
              <span class="date-val">${b.checkOut}</span>
            </div>
          </div>

          <div class="booking-specs-row">
            <span><i class="fa-solid fa-users"></i> ${isHall ? `${b.adults || 200} Attendees` : `${b.adults || 2} Adults${b.children ? `, ${b.children} Kids` : ''}`}</span>
            <div style="display: flex; gap: 6px;">
              <span class="payment-status-badge ${payBadgeClass}">${b.paymentStatus}</span>
              <span class="booking-status-badge ${statusBadgeClass}">${b.status}</span>
            </div>
          </div>

          <div class="booking-card-folio">
            <span class="folio-label">Total Folio Charge:</span>
            <span class="folio-amount">${formattedAmount}</span>
          </div>
        </div>

        <div class="booking-card-actions">
          <button type="button" class="btn-secondary-luxury" onclick="openBookingDetailsModal('${b.id}')" title="View Full Folio Details">
            <i class="fa-solid fa-eye"></i> Details
          </button>
          ${canModify ? `
            <button type="button" class="btn-secondary-luxury" onclick="openModifyBookingModal('${b.id}')" title="Modify Dates / Requests">
              <i class="fa-solid fa-pen-to-square"></i> Modify
            </button>
            <button type="button" class="btn-secondary-luxury" style="color: #f87171;" onclick="openCancelBookingModal('${b.id}')" title="Cancel Reservation">
              <i class="fa-solid fa-ban"></i> Cancel
            </button>
          ` : ''}
          <button type="button" class="btn-secondary-luxury" onclick="openBookingInvoiceModal('${b.id}')" title="Print Official Folio Receipt">
            <i class="fa-solid fa-file-invoice"></i> Folio
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// 2. ADMIN BOOKINGS CONTROLLER (EXECUTIVE LEDGER)
// ==========================================================================

function filterAdminBookings() {
  renderAdminBookings();
}

function resetAdminBookingFilters() {
  const searchInput = document.getElementById('adminBookingSearch');
  const statusFilter = document.getElementById('adminBookingStatusFilter');
  const roomFilter = document.getElementById('adminBookingRoomFilter');
  const dateFilter = document.getElementById('adminBookingDateFilter');

  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = 'all';
  if (roomFilter) roomFilter.value = 'all';
  if (dateFilter) dateFilter.value = 'all';

  renderAdminBookings();
  soundEngine.playChime('bell');
}

function renderAdminBookings() {
  const tbody = document.getElementById('adminBookingsTableBody');
  if (!tbody) return;

  const allBookings = loadBookings();

  // Populate accommodations dropdown if not populated
  const roomSelect = document.getElementById('adminBookingRoomFilter');
  if (roomSelect && roomSelect.options.length <= 1) {
    const accommodations = new Set();
    allBookings.forEach(b => { if (b.title) accommodations.add(b.title); });
    accommodations.forEach(acc => {
      const opt = document.createElement('option');
      opt.value = acc;
      opt.textContent = acc;
      roomSelect.appendChild(opt);
    });
  }

  // Calculate 7 Executive KPIs
  const totalCount = allBookings.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = allBookings.filter(b => b.checkIn === todayStr || (b.createdAt && b.createdAt.startsWith(todayStr))).length;
  const upcomingCheckins = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const upcomingCheckouts = allBookings.filter(b => b.status === 'Checked In').length;
  const confirmedCount = allBookings.filter(b => b.status === 'Confirmed').length;
  const cancelledCount = allBookings.filter(b => b.status === 'Cancelled').length;

  const totalRevenue = allBookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Update KPI displays (Admin displays in INR base)
  const kpiTotalEl = document.getElementById('adminKpiTotal');
  const kpiTodayEl = document.getElementById('adminKpiToday');
  const kpiCheckinsEl = document.getElementById('adminKpiUpcomingCheckins');
  const kpiCheckoutsEl = document.getElementById('adminKpiUpcomingCheckouts');
  const kpiConfirmedEl = document.getElementById('adminKpiConfirmed');
  const kpiCancelledEl = document.getElementById('adminKpiCancelled');
  const kpiRevenueEl = document.getElementById('adminKpiRevenue');

  if (kpiTotalEl) kpiTotalEl.textContent = totalCount;
  if (kpiTodayEl) kpiTodayEl.textContent = todayCount;
  if (kpiCheckinsEl) kpiCheckinsEl.textContent = upcomingCheckins;
  if (kpiCheckoutsEl) kpiCheckoutsEl.textContent = upcomingCheckouts;
  if (kpiConfirmedEl) kpiConfirmedEl.textContent = confirmedCount;
  if (kpiCancelledEl) kpiCancelledEl.textContent = cancelledCount;
  if (kpiRevenueEl) kpiRevenueEl.textContent = formatCurrency(totalRevenue);

  // Apply filters
  const searchInput = document.getElementById('adminBookingSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const statusFilter = document.getElementById('adminBookingStatusFilter')?.value || 'all';
  const roomFilter = document.getElementById('adminBookingRoomFilter')?.value || 'all';
  const dateFilter = document.getElementById('adminBookingDateFilter')?.value || 'all';

  const filtered = allBookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (roomFilter !== 'all' && b.title !== roomFilter) return false;

    if (dateFilter === 'today' && b.checkIn !== todayStr && b.checkOut !== todayStr) return false;
    if (dateFilter === 'upcoming' && b.checkIn < todayStr) return false;
    if (dateFilter === 'past' && b.checkOut >= todayStr) return false;

    if (query) {
      const matchId = b.id.toLowerCase().includes(query);
      const matchGuest = (b.guestName || '').toLowerCase().includes(query);
      const matchGuestId = (b.guestId || '').toLowerCase().includes(query);
      const matchEmail = (b.guestEmail || '').toLowerCase().includes(query);
      const matchPhone = (b.guestPhone || '').toLowerCase().includes(query);
      const matchTitle = (b.title || '').toLowerCase().includes(query);
      if (!matchId && !matchGuest && !matchGuestId && !matchEmail && !matchPhone && !matchTitle) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 8px; display: block;"></i>
          No executive bookings found matching specified ledger filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    let statusClass = 'status-confirmed';
    if (b.status === 'Pending') statusClass = 'status-pending';
    if (b.status === 'Checked In') statusClass = 'status-checked-in';
    if (b.status === 'Completed') statusClass = 'status-completed';
    if (b.status === 'Cancelled') statusClass = 'status-cancelled';

    let payBadgeClass = 'payment-paid';
    if (b.paymentStatus === 'Pending') payBadgeClass = 'payment-pending';
    if (b.paymentStatus === 'Refunded') payBadgeClass = 'payment-refunded';

    const isCancelled = b.status === 'Cancelled';
    const isCompleted = b.status === 'Completed';

    return `
      <tr>
        <td>
          <strong style="color: var(--accent-gold); font-size: 0.85rem;">${b.id}</strong>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${b.guestName}</div>
          <div style="font-size: 0.74rem; color: var(--text-secondary);">${b.guestEmail || 'Confidential'}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${b.title}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${b.type === 'hall' ? 'Banquet Sanctuary' : `Suite ${b.roomNumber}`}</div>
        </td>
        <td>
          <div>${b.checkIn}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${b.checkOut}</div>
        </td>
        <td>
          <div>${b.nights} Night(s)</div>
          <div style="font-size: 0.74rem; color: var(--text-secondary);">${b.adults || 2} Guest(s)</div>
        </td>
        <td>
          <strong style="color: var(--accent-gold);">${formatCurrency(b.totalAmount || 0)}</strong>
        </td>
        <td>
          <span class="payment-status-badge ${payBadgeClass}">${b.paymentStatus}</span>
        </td>
        <td>
          <span class="booking-status-badge ${statusClass}">${b.status}</span>
        </td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="action-btn-mini" title="View Full Details" onclick="openBookingDetailsModal('${b.id}')">
              <i class="fa-regular fa-eye"></i>
            </button>
            ${!isCancelled && !isCompleted ? `
              <button type="button" class="action-btn-mini" title="Modify Parameters" onclick="openModifyBookingModal('${b.id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="action-btn-mini danger" title="Cancel Booking" onclick="openCancelBookingModal('${b.id}')">
                <i class="fa-solid fa-ban"></i>
              </button>
            ` : ''}
            ${b.status === 'Pending' ? `
              <button type="button" class="action-btn-text-sm" title="Authorize Booking" onclick="adminUpdateBookingStatus('${b.id}', 'Confirmed')">
                <i class="fa-solid fa-check"></i> Confirm
              </button>
            ` : ''}
            ${b.status === 'Confirmed' ? `
              <button type="button" class="action-btn-text-sm" title="Check-in Guest" onclick="adminUpdateBookingStatus('${b.id}', 'Checked In')">
                <i class="fa-solid fa-key"></i> Check In
              </button>
            ` : ''}
            ${b.status === 'Checked In' ? `
              <button type="button" class="action-btn-text-sm" title="Check-out Guest" onclick="adminUpdateBookingStatus('${b.id}', 'Completed')">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Check Out
              </button>
            ` : ''}
            <button type="button" class="action-btn-mini" title="Folio Invoice" onclick="openBookingInvoiceModal('${b.id}')">
              <i class="fa-solid fa-receipt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function adminUpdateBookingStatus(bookingId, newStatus) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  booking.status = newStatus;
  if (newStatus === 'Checked In') {
    booking.paymentStatus = 'Paid';
  }
  saveBooking(booking);

  soundEngine.playChime('success');
  showToast('Booking Updated', `Reservation ${bookingId} status changed to ${newStatus}`, 'success');
  renderAdminBookings();
  updateBookingsNavBadge();
}

function exportBookingsCSV() {
  const allBookings = loadBookings();
  const currCfg = getActiveCurrencyConfig();
  const code = currCfg.code || 'INR';
  const rate = currCfg.rate !== undefined ? currCfg.rate : 1.0;

  let csv = "data:text/csv;charset=utf-8,";
  csv += `Booking ID,Type,Accommodation,Guest Name,Email,Phone,Check In,Check Out,Nights,Guests,Total (${code}),Payment Status,Booking Status\n`;

  allBookings.forEach(b => {
    const convertedTotal = Math.round((b.totalAmount || 0) * rate);
    csv += `"${b.id}","${b.type}","${b.title}","${b.guestName}","${b.guestEmail}","${b.guestPhone || ''}","${b.checkIn}","${b.checkOut}","${b.nights}","${b.adults}","${convertedTotal}","${b.paymentStatus}","${b.status}"\n`;
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Aurelia_Grand_Executive_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  soundEngine.playChime('success');
  showToast('CSV Exported', 'Complete executive booking records downloaded', 'success');
}

// ==========================================================================
// 3. STAFF BOOKINGS CONTROLLER (FRONT DESK & CONCIERGE OPERATIONS)
// ==========================================================================

function setStaffFilter(filter) {
  currentStaffBookingFilter = filter;
  const chips = document.querySelectorAll('#staffFilterChips .filter-chip');
  chips.forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === filter);
  });
  renderStaffBookings();
  soundEngine.playChime('bell');
}

function filterStaffBookings() {
  renderStaffBookings();
}

function renderStaffBookings() {
  const tbody = document.getElementById('staffBookingsTableBody');
  if (!tbody) return;

  const allBookings = loadBookings();
  const todayStr = new Date().toISOString().slice(0, 10);

  // 5 Operational Counters
  const todayCheckins = allBookings.filter(b => b.checkIn === todayStr && b.status !== 'Cancelled').length;
  const todayCheckouts = allBookings.filter(b => b.checkOut === todayStr && b.status === 'Checked In').length;
  const upcomingArrivals = allBookings.filter(b => b.checkIn >= todayStr && (b.status === 'Confirmed' || b.status === 'Pending')).length;
  const currentGuests = allBookings.filter(b => b.status === 'Checked In').length;
  const pendingRequests = allBookings.filter(b => b.status === 'Pending').length;

  const kpiCheckins = document.getElementById('staffKpiTodayCheckins');
  const kpiCheckouts = document.getElementById('staffKpiTodayCheckouts');
  const kpiArrivals = document.getElementById('staffKpiUpcomingArrivals');
  const kpiCurrent = document.getElementById('staffKpiCurrentGuests');
  const kpiReqs = document.getElementById('staffKpiRequests');

  if (kpiCheckins) kpiCheckins.textContent = todayCheckins;
  if (kpiCheckouts) kpiCheckouts.textContent = todayCheckouts;
  if (kpiArrivals) kpiArrivals.textContent = upcomingArrivals;
  if (kpiCurrent) kpiCurrent.textContent = currentGuests;
  if (kpiReqs) kpiReqs.textContent = pendingRequests;

  // Filter operational list
  const searchInput = document.getElementById('staffBookingSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = allBookings.filter(b => {
    if (currentStaffBookingFilter === 'checkins' && b.checkIn !== todayStr) return false;
    if (currentStaffBookingFilter === 'checkouts' && b.checkOut !== todayStr) return false;
    if (currentStaffBookingFilter === 'inhouse' && b.status !== 'Checked In') return false;

    if (query) {
      const matchId = b.id.toLowerCase().includes(query);
      const matchGuest = (b.guestName || '').toLowerCase().includes(query);
      const matchGuestId = (b.guestId || '').toLowerCase().includes(query);
      const matchEmail = (b.guestEmail || '').toLowerCase().includes(query);
      const matchPhone = (b.guestPhone || '').toLowerCase().includes(query);
      const matchRoom = (b.roomNumber || '').toLowerCase().includes(query);
      const matchTitle = (b.title || '').toLowerCase().includes(query);
      if (!matchId && !matchGuest && !matchGuestId && !matchEmail && !matchPhone && !matchRoom && !matchTitle) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fa-solid fa-clipboard-check" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 8px; display: block;"></i>
          No operational reservations matching active front-desk queue.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    let statusClass = 'status-confirmed';
    if (b.status === 'Pending') statusClass = 'status-pending';
    if (b.status === 'Checked In') statusClass = 'status-checked-in';
    if (b.status === 'Completed') statusClass = 'status-completed';
    if (b.status === 'Cancelled') statusClass = 'status-cancelled';

    return `
      <tr>
        <td>
          <strong style="color: var(--accent-gold); font-size: 0.85rem;">${b.id}</strong>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${b.guestName}</div>
          <div style="font-size: 0.74rem; color: var(--text-secondary);">${b.guestPhone || b.guestEmail}</div>
        </td>
        <td>
          <strong style="color: var(--text-primary);">${b.title}</strong>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${b.type === 'hall' ? 'Banquet' : `Suite ${b.roomNumber}`}</div>
        </td>
        <td>
          <div><strong>In:</strong> ${b.checkIn}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);"><strong>Out:</strong> ${b.checkOut}</div>
        </td>
        <td>
          <span>${b.adults || 2} Guests</span>
        </td>
        <td>
          <span class="booking-status-badge ${statusClass}">${b.status}</span>
        </td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="action-btn-mini" title="View Details" onclick="openBookingDetailsModal('${b.id}')">
              <i class="fa-regular fa-eye"></i>
            </button>
            ${b.status === 'Confirmed' ? `
              <button type="button" class="action-btn-text-sm" title="Dispatch Key & Check In" onclick="staffUpdateBookingStatus('${b.id}', 'Checked In')">
                <i class="fa-solid fa-key"></i> Check In
              </button>
            ` : ''}
            ${b.status === 'Checked In' ? `
              <button type="button" class="action-btn-text-sm" title="Complete Checkout" onclick="staffUpdateBookingStatus('${b.id}', 'Completed')">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Check Out
              </button>
            ` : ''}
            ${b.status === 'Pending' ? `
              <button type="button" class="action-btn-text-sm" title="Confirm Reservation" onclick="staffUpdateBookingStatus('${b.id}', 'Confirmed')">
                <i class="fa-solid fa-check"></i> Confirm
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function staffUpdateBookingStatus(bookingId, newStatus) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  booking.status = newStatus;
  if (newStatus === 'Checked In') {
    booking.paymentStatus = 'Paid';
  }
  saveBooking(booking);

  soundEngine.playChime('success');
  showToast('Operational Update', `Guest ${booking.guestName} marked as ${newStatus}`, 'success');
  renderStaffBookings();
  updateBookingsNavBadge();
}

// Navigation Badge updater
function updateBookingsNavBadge() {
  const badge = document.getElementById('navBookingsBadge');
  if (!badge) return;

  const all = loadBookings();
  const user = AuthManager.getCurrentUser();

  let count = 0;
  if (user && (user.role === 'USER' || user.role === 'GUEST')) {
    count = all.filter(b => (b.guestEmail === user.email || b.userEmail === user.email || b.guestEmail === 'user@aureliagrand.com') && (b.status === 'Confirmed' || b.status === 'Checked In')).length;
  } else {
    // Admin / Staff sees active stays + confirmed arrivals
    count = all.filter(b => b.status === 'Confirmed' || b.status === 'Checked In' || b.status === 'Pending').length;
  }

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function renderBookingsByActiveRole() {
  const user = AuthManager.getCurrentUser();
  const role = user ? ((user.role === 'USER' || user.role === 'GUEST') ? 'GUEST' : user.role) : 'GUEST';
  if (role === 'ADMIN') {
    renderAdminBookings();
  } else if (role === 'STAFF') {
    renderStaffBookings();
  } else {
    renderGuestBookings();
  }
}

// ==========================================================================
// ADVANCED INTELLIGENCE SEARCH ENGINE (ADMIN & STAFF ONLY)
// ==========================================================================

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Execute advanced search across executive folios, rooms, and party halls.
 * Strictly available for ADMIN and STAFF roles.
 */
function executeAdvancedSearch(rawQuery, category = 'all', role = 'ADMIN') {
  const q = (rawQuery || '').toLowerCase().trim();
  if (!q) return [];

  const allBookings = loadBookings();
  const allHalls = Array.isArray(PARTY_HALL_BOOKINGS) ? PARTY_HALL_BOOKINGS : [];
  const allRooms = Array.isArray(ROOMS_DATA) ? ROOMS_DATA : [];

  const results = [];
  const seenBookingIds = new Set();

  // 1. Search Room / Suite Bookings and General Bookings
  allBookings.forEach(b => {
    const isHall = b.type === 'hall';
    const guestName = (b.guestName || b.hostName || '').toLowerCase();
    const guestId = (b.guestId || '').toLowerCase();
    const id = (b.id || '').toLowerCase();
    const title = (b.title || b.hallName || '').toLowerCase();
    const roomId = (b.roomId || b.roomNumber || '').toLowerCase();
    const roomNumber = (b.roomNumber || '').toLowerCase();
    const phone = (b.guestPhone || b.phone || '').toLowerCase();
    const email = (b.guestEmail || b.email || '').toLowerCase();

    let matched = false;

    if (category === 'guest') {
      matched = guestName.includes(q);
    } else if (category === 'guestId') {
      matched = guestId.includes(q);
    } else if (category === 'bookingId' || category === 'booking') {
      matched = id.includes(q);
    } else if (category === 'contact') {
      matched = phone.includes(q) || email.includes(q);
    } else if (category === 'room') {
      matched = !isHall && (title.includes(q) || roomId.includes(q) || roomNumber.includes(q));
    } else if (category === 'hall') {
      matched = isHall && (title.includes(q) || id.includes(q) || (b.hallId && b.hallId.toLowerCase().includes(q)));
    } else {
      // 'all'
      matched = guestName.includes(q) ||
                guestId.includes(q) ||
                id.includes(q) ||
                title.includes(q) ||
                roomId.includes(q) ||
                roomNumber.includes(q) ||
                phone.includes(q) ||
                email.includes(q);
    }

    if (matched && !seenBookingIds.has(b.id)) {
      seenBookingIds.add(b.id);
      results.push({
        resultType: isHall ? 'hall_booking' : 'booking',
        item: b
      });
    }
  });

  // 2. Search Party Hall bookings ledger (if any not already covered in allBookings)
  allHalls.forEach(hb => {
    if (seenBookingIds.has(hb.id)) return;

    const hostName = (hb.hostName || '').toLowerCase();
    const guestId = (hb.guestId || '').toLowerCase();
    const id = (hb.id || '').toLowerCase();
    const hallName = (hb.hallName || '').toLowerCase();
    const hallId = (hb.hallId || '').toLowerCase();
    const phone = (hb.phone || '').toLowerCase();
    const email = (hb.email || '').toLowerCase();

    let matched = false;

    if (category === 'guest') {
      matched = hostName.includes(q);
    } else if (category === 'guestId') {
      matched = guestId.includes(q);
    } else if (category === 'bookingId' || category === 'booking') {
      matched = id.includes(q);
    } else if (category === 'contact') {
      matched = phone.includes(q) || email.includes(q);
    } else if (category === 'room') {
      matched = false;
    } else if (category === 'hall') {
      matched = hallName.includes(q) || hallId.includes(q) || id.includes(q);
    } else {
      matched = hostName.includes(q) ||
                guestId.includes(q) ||
                id.includes(q) ||
                hallName.includes(q) ||
                hallId.includes(q) ||
                phone.includes(q) ||
                email.includes(q);
    }

    if (matched) {
      seenBookingIds.add(hb.id);
      results.push({
        resultType: 'hall_booking',
        item: hb
      });
    }
  });

  // 3. Search Direct Room Inventory (when category is 'all' or 'room')
  if (category === 'all' || category === 'room') {
    allRooms.forEach(rm => {
      const name = (rm.name || '').toLowerCase();
      const id = (rm.id || '').toLowerCase();
      const num = (rm.number || '').toLowerCase();
      const type = (rm.type || '').toLowerCase();
      const occupant = (rm.guest || '').toLowerCase();

      const matched = name.includes(q) || id.includes(q) || num.includes(q) || type.includes(q) || (role === 'ADMIN' && occupant.includes(q));

      if (matched) {
        results.push({
          resultType: 'room',
          item: rm
        });
      }
    });
  }

  // 4. Search Direct Party Hall Venues (when category is 'all' or 'hall')
  if (category === 'all' || category === 'hall') {
    if (Array.isArray(PARTY_HALLS_DATA)) {
      PARTY_HALLS_DATA.forEach(ph => {
        const name = (ph.name || '').toLowerCase();
        const id = (ph.id || '').toLowerCase();
        const type = (ph.type || '').toLowerCase();

        if (name.includes(q) || id.includes(q) || type.includes(q)) {
          results.push({
            resultType: 'hall_venue',
            item: ph
          });
        }
      });
    }
  }

  // 5. Synthesize guest profiles from stored bookings (for offline fallback)
  if (category === 'all' || category === 'guest' || category === 'guestId' || category === 'contact') {
    const seenGuests = new Map();
    allBookings.forEach(b => {
      const gId = b.guestId || 'GST-1024';
      const gName = b.guestName || b.hostName || '';
      const gEmail = b.guestEmail || b.email || '';
      const gPhone = b.guestPhone || b.phone || '';
      const key = gId + '_' + gName;
      if (!seenGuests.has(key)) {
        seenGuests.set(key, {
          guestId: gId,
          guestName: gName,
          guestEmail: gEmail,
          guestPhone: gPhone,
          role: 'GUEST',
          bookings: []
        });
      }
      seenGuests.get(key).bookings.push(b);
    });

    seenGuests.forEach(g => {
      const name = (g.guestName || '').toLowerCase();
      const gid = (g.guestId || '').toLowerCase();
      const email = (g.guestEmail || '').toLowerCase();
      const phone = (g.guestPhone || '').toLowerCase();

      let gMatched = false;
      if (category === 'guest') {
        gMatched = name.includes(q);
      } else if (category === 'guestId') {
        gMatched = gid.includes(q);
      } else if (category === 'contact') {
        gMatched = email.includes(q) || phone.includes(q);
      } else {
        gMatched = name.includes(q) || gid.includes(q) || email.includes(q) || phone.includes(q);
      }

      if (gMatched) {
        results.push({
          resultType: 'guest',
          item: {
            id: g.guestId,
            guestId: g.guestId,
            guestName: g.guestName,
            guestEmail: g.guestEmail,
            guestPhone: g.guestPhone,
            role: g.role,
            bookingCount: g.bookings.length,
            bookings: g.bookings.map(bk => ({
              id: bk.id,
              bookingId: bk.id,
              title: bk.title || (bk.roomNumber ? `Suite ${bk.roomNumber}` : 'Stay'),
              checkIn: bk.checkIn,
              checkOut: bk.checkOut,
              status: bk.status || 'Confirmed',
              totalAmount: bk.totalAmount || 0
            }))
          }
        });
      }
    });
  }

  return results;
}

/**
 * Render luxury cards for search results inside a container element.
 */
function renderSearchResults(results, containerEl, rawQuery, role = 'ADMIN') {
  if (!containerEl) return;
  containerEl.style.display = 'block';

  const query = (rawQuery || '').trim();

  // If query is empty, show awaiting prompt
  if (!query) {
    containerEl.innerHTML = `
      <div class="search-empty-state">
        <div class="search-empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <h4>Search Guest, Booking, Room or Suite</h4>
        <p>Type a guest name, guest ID, booking reference, suite ID, phone or banquet hall to explore live records.</p>
      </div>
    `;
    return;
  }

  // If query has no matches
  if (!Array.isArray(results) || results.length === 0) {
    containerEl.innerHTML = `
      <div class="search-empty-state">
        <div class="search-empty-icon"><i class="fa-solid fa-folder-open"></i></div>
        <h4>No Records Found</h4>
        <p>No reservations, guests, or suites matched "<strong>${escapeHtml(query)}</strong>". Please verify spelling or change category filter.</p>
      </div>
    `;
    return;
  }

  // Render Result Count & Grid
  const countHtml = `
    <div class="search-results-count">
      <i class="fa-solid fa-circle-check" style="color: var(--accent-gold);"></i>
      <span>Found <strong>${results.length}</strong> matching record${results.length === 1 ? '' : 's'} for "<strong>${escapeHtml(query)}</strong>"</span>
    </div>
  `;

  const cardsHtml = results.map(res => {
    const item = (res && res.item) ? res.item : (res || {});
    const resultType = (res && (res.resultType || res.type)) || (item && (item.resultType || item.type)) || '';

    // A. Guest Profile Card
    if (resultType === 'guest' || item.type === 'guest') {
      const guestName = item.guestName || item.name || item.title || 'Distinguished Guest';
      const guestId = item.guestId || item.id || 'GST-0';
      const phone = item.guestPhone || item.phone || '';
      const email = item.guestEmail || item.email || '';
      const country = item.country || 'India';
      const currency = item.currency || 'INR';
      const roleName = item.role || 'GUEST';
      const bookingsList = Array.isArray(item.bookings) ? item.bookings : [];
      const bookingCount = item.bookingCount !== undefined ? item.bookingCount : bookingsList.length;

      let bookingsHtml = '';
      if (bookingsList.length > 0) {
        bookingsHtml = `
          <div class="result-bookings-preview" style="margin-top: 12px; background: rgba(0, 0, 0, 0.28); border-radius: var(--radius-sm, 6px); padding: 10px 12px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-gold); font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
              <span><i class="fa-solid fa-receipt"></i> Associated Reservations (${bookingsList.length})</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${bookingsList.slice(0, 3).map(bk => {
                const bId = bk.id || bk.bookingId;
                const bTitle = bk.title || (bk.type === 'hall' ? 'Banquet Reservation' : 'Room Stay');
                const bStatus = bk.status || 'Confirmed';
                const bStatusClass = `status-${bStatus.toLowerCase().replace(/\s+/g, '-')}`;
                const bDates = (bk.checkIn && bk.checkOut) ? `${bk.checkIn} → ${bk.checkOut}` : '';
                const bAmount = bk.totalAmount ? formatCurrency(bk.totalAmount) : '';
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.06);">
                    <div>
                      <strong style="color: var(--accent-gold); font-family: monospace; font-size: 0.82rem;">${escapeHtml(bId)}</strong>
                      <span style="color: var(--text-primary); margin-left: 6px; font-weight: 500;">${escapeHtml(bTitle)}</span>
                      ${bDates ? `<span style="color: var(--text-muted); font-size: 0.72rem; margin-left: 6px;">(${escapeHtml(bDates)})</span>` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="booking-status-badge ${bStatusClass}" style="font-size: 0.68rem; padding: 2px 6px;">${escapeHtml(bStatus)}</span>
                      ${bAmount ? `<span style="color: var(--accent-gold); font-weight: 600;">${bAmount}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
              ${bookingsList.length > 3 ? `
                <div style="font-size: 0.72rem; color: var(--text-muted); text-align: right; margin-top: 2px;">
                  +${bookingsList.length - 3} additional reservation(s) on record
                </div>
              ` : ''}
            </div>
          </div>
        `;
      } else {
        bookingsHtml = `
          <div style="margin-top: 10px; font-size: 0.76rem; color: var(--text-muted); font-style: italic; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-info"></i> Stored guest profile — currently no reservations recorded in ledger.
          </div>
        `;
      }

      const primaryBookingId = bookingsList.length > 0 ? (bookingsList[0].id || bookingsList[0].bookingId) : null;

      return `
        <div class="search-result-card" id="searchResult-guest-${escapeHtml(guestId)}">
          <div class="search-result-card-header">
            <div class="result-card-title-group">
              <span class="result-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35);">
                <i class="fa-solid fa-user-tie"></i> VIP GUEST
              </span>
              <span class="booking-status-badge status-confirmed">${escapeHtml(roleName)}</span>
            </div>
            <div class="result-primary-ref">
              <strong>${escapeHtml(guestId)}</strong>
            </div>
          </div>

          <div class="result-card-body">
            <div class="result-guest-highlight">
              <div>
                <h4 class="font-serif result-card-name">${escapeHtml(guestName)}</h4>
                <div class="result-card-id"><i class="fa-solid fa-id-badge"></i> Guest Profile ID: <strong>${escapeHtml(guestId)}</strong></div>
              </div>
              <div class="result-card-amount">
                <span class="amount-lbl">Folio Roster</span>
                <span class="amount-val">${bookingCount} Stay${bookingCount === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div class="result-fields-grid">
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-envelope"></i> Email Address</span>
                <span class="result-field-val">${email ? escapeHtml(email) : '<em style="color:var(--text-muted);">Not provided</em>'}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-phone"></i> Phone Number</span>
                <span class="result-field-val">${phone ? escapeHtml(phone) : '<em style="color:var(--text-muted);">Not provided</em>'}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-earth-americas"></i> Country / Region</span>
                <span class="result-field-val">${escapeHtml(country)}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-coins"></i> Billing Currency</span>
                <span class="result-field-val">${escapeHtml(currency)}</span>
              </div>
            </div>

            ${bookingsHtml}
          </div>

          <div class="result-card-footer">
            ${primaryBookingId ? `
              <button type="button" class="btn-primary-luxury" onclick="openBookingDetailsModal('${primaryBookingId}')">
                <i class="fa-regular fa-eye"></i> View Folio
              </button>
            ` : `
              <button type="button" class="btn-primary-luxury" onclick="openRoomBookingWizard()">
                <i class="fa-solid fa-calendar-plus"></i> Book Suite
              </button>
            `}
            <button type="button" class="btn-secondary-luxury" onclick="openPartyHallBookingModal()">
              <i class="fa-solid fa-champagne-glasses"></i> Reserve Banquet
            </button>
          </div>
        </div>
      `;
    }

    // B. Booking Card
    if (resultType === 'booking') {
      const status = item.status || 'Confirmed';
      const statusClass = `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
      const guestName = item.guestName || 'Distinguished Guest';
      const guestId = item.guestId || 'GST-0';
      const roomName = item.title || (item.roomNumber ? `Suite ${item.roomNumber}` : 'Executive Suite');
      const roomId = item.roomId || (item.roomNumber ? `SUITE-${item.roomNumber}` : 'SUITE-205');
      const checkIn = item.checkIn || '12 Oct 2026';
      const checkOut = item.checkOut || '16 Oct 2026';
      const nights = item.nights || 1;
      const guests = item.adults || 2;
      const phone = item.guestPhone || item.phone || '+91 98765 43210';
      const email = item.guestEmail || item.email || 'guest@example.com';
      const totalFormatted = formatCurrency(item.totalAmount || 120000);
      const bookingRef = item.id || item.bookingId || 'AG-2026-00000';

      const contactHtml = role === 'ADMIN' ? `
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-phone"></i> Phone Number</span>
          <span class="result-field-val">${escapeHtml(phone)}</span>
        </div>
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-envelope"></i> Guest Email</span>
          <span class="result-field-val">${escapeHtml(email)}</span>
        </div>
      ` : `
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-phone"></i> Front Desk Contact</span>
          <span class="result-field-val">${escapeHtml(phone)}</span>
        </div>
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-user-group"></i> Party Size</span>
          <span class="result-field-val">${guests} Distinguished Guest(s)</span>
        </div>
      `;

      const checkInBtn = (status === 'Confirmed' || status === 'CONFIRMED') ? `
        <button type="button" class="btn-secondary-luxury" onclick="adminUpdateBookingStatus('${bookingRef}', 'Checked In'); ${role === 'ADMIN' ? 'runAdminSearch()' : 'runStaffSearch()'};">
          <i class="fa-solid fa-key"></i> Check In
        </button>
      ` : ((status === 'Checked In' || status === 'CHECKED_IN') ? `
        <button type="button" class="btn-secondary-luxury" onclick="adminUpdateBookingStatus('${bookingRef}', 'Completed'); ${role === 'ADMIN' ? 'runAdminSearch()' : 'runStaffSearch()'};">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Check Out
        </button>
      ` : '');

      return `
        <div class="search-result-card" id="searchResult-booking-${escapeHtml(bookingRef)}">
          <div class="search-result-card-header">
            <div class="result-card-title-group">
              <span class="result-badge badge-booking">
                <i class="fa-solid fa-calendar-check"></i> BOOKING
              </span>
              <span class="booking-status-badge ${statusClass}">${escapeHtml(status)}</span>
            </div>
            <div class="result-primary-ref">
              <strong>${escapeHtml(bookingRef)}</strong>
            </div>
          </div>

          <div class="result-card-body">
            <div class="result-guest-highlight">
              <div>
                <h4 class="font-serif result-card-name">${escapeHtml(guestName)}</h4>
                <div class="result-card-id"><i class="fa-solid fa-id-badge"></i> Guest ID: <strong>${escapeHtml(guestId)}</strong></div>
              </div>
              <div class="result-card-amount">
                <span class="amount-lbl">Total Folio</span>
                <span class="amount-val">${totalFormatted}</span>
              </div>
            </div>

            <div class="result-fields-grid">
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-receipt"></i> Booking ID</span>
                <span class="result-field-val"><strong style="color: var(--accent-gold); font-family: monospace;">${escapeHtml(bookingRef)}</strong></span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-bed"></i> Room / Suite</span>
                <span class="result-field-val">${escapeHtml(roomName)} (Suite ${item.roomNumber || ''})</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-door-open"></i> Room / Suite ID</span>
                <span class="result-field-val"><strong style="color: var(--accent-gold); font-family: monospace;">${escapeHtml(roomId)}</strong></span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-calendar-days"></i> Stay Dates</span>
                <span class="result-field-val">${checkIn} → ${checkOut} (${nights} Night${nights > 1 ? 's' : ''})</span>
              </div>
              ${contactHtml}
            </div>
          </div>

          <div class="result-card-footer">
            <button type="button" class="btn-primary-luxury" onclick="openBookingDetailsModal('${bookingRef}')">
              <i class="fa-regular fa-eye"></i> View Details
            </button>
            ${checkInBtn}
            <button type="button" class="btn-secondary-luxury" onclick="openBookingInvoiceModal('${bookingRef}')">
              <i class="fa-solid fa-receipt"></i> Folio
            </button>
          </div>
        </div>
      `;
    }

    // C. Party Hall Booking Card
    if (resultType === 'hall_booking' || (resultType === 'hall' && item.bookingId)) {
      const status = item.status || 'Confirmed';
      const statusClass = `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
      const hostName = item.guestName || item.hostName || 'Distinguished Host';
      const guestId = item.guestId || 'GST-0';
      const venueName = item.title || item.hallName || 'The Glasshouse Pavilion';
      const eventDate = item.checkIn || item.date || '2026-10-14';
      const guests = item.adults || item.guests || 250;
      const phone = item.guestPhone || item.phone || '+91 98765 43210';
      const email = item.guestEmail || item.email || 'host@example.com';
      const totalFormatted = formatCurrency(item.totalAmount || item.total || 185000);
      const bookingRef = item.id || item.bookingId || 'AG-PH-00000';

      const contactHtml = role === 'ADMIN' ? `
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-phone"></i> Host Phone</span>
          <span class="result-field-val">${escapeHtml(phone)}</span>
        </div>
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-envelope"></i> Host Email</span>
          <span class="result-field-val">${escapeHtml(email)}</span>
        </div>
      ` : `
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-phone"></i> Event Contact</span>
          <span class="result-field-val">${escapeHtml(phone)}</span>
        </div>
        <div class="result-field-item">
          <span class="result-field-lbl"><i class="fa-solid fa-users"></i> Attendees</span>
          <span class="result-field-val">${guests} Guests</span>
        </div>
      `;

      return `
        <div class="search-result-card" id="searchResult-hall-${escapeHtml(bookingRef)}">
          <div class="search-result-card-header">
            <div class="result-card-title-group">
              <span class="result-badge badge-banquet">
                <i class="fa-solid fa-champagne-glasses"></i> BANQUET
              </span>
              <span class="booking-status-badge ${statusClass}">${escapeHtml(status)}</span>
            </div>
            <div class="result-primary-ref">
              <strong>${escapeHtml(bookingRef)}</strong>
            </div>
          </div>

          <div class="result-card-body">
            <div class="result-guest-highlight">
              <div>
                <h4 class="font-serif result-card-name">${escapeHtml(hostName)}</h4>
                <div class="result-card-id"><i class="fa-solid fa-id-badge"></i> Guest ID: <strong>${escapeHtml(guestId)}</strong></div>
              </div>
              <div class="result-card-amount">
                <span class="amount-lbl">Banquet Folio</span>
                <span class="amount-val">${totalFormatted}</span>
              </div>
            </div>

            <div class="result-fields-grid">
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-receipt"></i> Booking ID</span>
                <span class="result-field-val"><strong style="color: var(--accent-gold); font-family: monospace;">${escapeHtml(bookingRef)}</strong></span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-landmark"></i> Venue Name</span>
                <span class="result-field-val">${escapeHtml(venueName)}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-calendar-days"></i> Event Date</span>
                <span class="result-field-val">${eventDate} (${guests} Attendees)</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-bell-concierge"></i> Event Type</span>
                <span class="result-field-val">${escapeHtml(item.eventType || item.specialRequests || 'Banquet Jubilee')}</span>
              </div>
              ${contactHtml}
            </div>
          </div>

          <div class="result-card-footer">
            <button type="button" class="btn-primary-luxury" onclick="openBookingDetailsModal('${bookingRef}')">
              <i class="fa-regular fa-eye"></i> View Folio
            </button>
            <button type="button" class="btn-secondary-luxury" onclick="openPartyHallDetailsModal('${item.hallId || 'hall-glasshouse'}')">
              <i class="fa-solid fa-champagne-glasses"></i> Venue Details
            </button>
          </div>
        </div>
      `;
    }

    // D. Room Card
    if (resultType === 'room') {
      const statusClass = `status-${(item.status || 'available').toLowerCase()}`;
      const statusLabel = item.status === 'occupied' ? 'Occupied' : (item.status === 'maintenance' ? 'Maintenance' : 'Available');
      const rateFormatted = formatCurrency(item.price || 0);

      return `
        <div class="search-result-card" id="searchResult-room-${item.id}">
          <div class="search-result-card-header">
            <div class="result-card-title-group">
              <span class="result-badge badge-suite">
                <i class="fa-solid fa-bed"></i> SUITE
              </span>
              <span class="room-status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="result-primary-ref">
              <strong>${item.id}</strong>
            </div>
          </div>

          <div class="result-card-body">
            <div class="result-guest-highlight">
              <div>
                <h4 class="font-serif result-card-name">${escapeHtml(item.name || item.title)}</h4>
                <div class="result-card-id"><i class="fa-solid fa-door-open"></i> Suite ID: <strong>${item.id}</strong> (Suite ${item.number || ''})</div>
              </div>
              <div class="result-card-amount">
                <span class="amount-lbl">Nightly Rate</span>
                <span class="amount-val">${rateFormatted}</span>
              </div>
            </div>

            <div class="result-fields-grid">
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-layer-group"></i> Category & Floor</span>
                <span class="result-field-val">${item.type || 'Executive'} • ${item.floor || 'Floor 7'}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-maximize"></i> Floor Space</span>
                <span class="result-field-val">${item.size || '150 m²'} • ${item.capacity || '2 Adults'}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-star" style="color: var(--accent-gold);"></i> Rating</span>
                <span class="result-field-val">${item.rating || 5.0} / 5.0 Luxury Index</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-user-check"></i> Current Occupant</span>
                <span class="result-field-val">${escapeHtml(item.guest || 'Vacant / Available')}</span>
              </div>
            </div>
          </div>

          <div class="result-card-footer">
            <button type="button" class="btn-primary-luxury" onclick="openRoomDetailsModal('${item.id}')">
              <i class="fa-regular fa-eye"></i> View Suite Details
            </button>
            ${item.status === 'available' ? `
              <button type="button" class="btn-secondary-luxury" onclick="openReservationModalWithRoom('${item.id}')">
                <i class="fa-solid fa-plus"></i> Reserve Suite
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    // E. Venue Card
    if (resultType === 'hall_venue' || resultType === 'hall') {
      const statusClass = item.status === 'AVAILABLE' ? 'status-available' : 'status-maintenance';
      const rateFormatted = formatCurrency(item.price || 0);

      return `
        <div class="search-result-card" id="searchResult-venue-${item.id}">
          <div class="search-result-card-header">
            <div class="result-card-title-group">
              <span class="result-badge badge-banquet">
                <i class="fa-solid fa-landmark"></i> VENUE
              </span>
              <span class="room-status-badge ${statusClass}">${item.status || 'AVAILABLE'}</span>
            </div>
            <div class="result-primary-ref">
              <strong>${item.id}</strong>
            </div>
          </div>

          <div class="result-card-body">
            <div class="result-guest-highlight">
              <div>
                <h4 class="font-serif result-card-name">${escapeHtml(item.name || item.title)}</h4>
                <div class="result-card-id"><i class="fa-solid fa-tag"></i> Venue ID: <strong>${item.id}</strong></div>
              </div>
              <div class="result-card-amount">
                <span class="amount-lbl">Daily Rental</span>
                <span class="amount-val">${rateFormatted}</span>
              </div>
            </div>

            <div class="result-fields-grid">
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-users"></i> Capacity</span>
                <span class="result-field-val">${item.capacity || '100'} Attendees</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-maximize"></i> Floor Space</span>
                <span class="result-field-val">${item.size || '350 m²'} • ${item.floor || 'Ground'}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-landmark"></i> Venue Type</span>
                <span class="result-field-val">${item.type || 'Grand Ballroom'}</span>
              </div>
              <div class="result-field-item">
                <span class="result-field-lbl"><i class="fa-solid fa-star" style="color: var(--accent-gold);"></i> Rating</span>
                <span class="result-field-val">${item.rating || 5.0} / 5.0</span>
              </div>
            </div>
          </div>

          <div class="result-card-footer">
            <button type="button" class="btn-primary-luxury" onclick="openPartyHallDetailsModal('${item.id}')">
              <i class="fa-regular fa-eye"></i> Venue Specs
            </button>
            <button type="button" class="btn-secondary-luxury" onclick="openPartyHallBookingModal('${item.id}')">
              <i class="fa-solid fa-calendar-check"></i> Book Venue
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }).join('');

  containerEl.innerHTML = countHtml + `<div class="search-results-grid">${cardsHtml}</div>`;
}

// Controller functions for Admin & Staff Search
let adminSearchDebounceTimer = null;
let staffSearchDebounceTimer = null;

function runAdminSearch() {
  const inputEl = document.getElementById('adminAdvancedSearchInput');
  const catEl = document.getElementById('adminSearchCategory');
  const wrapper = document.getElementById('adminSearchResultsWrapper');
  const clearBtn = document.getElementById('adminSearchClearBtn');

  const rawQuery = inputEl ? inputEl.value : '';
  const query = rawQuery.trim();
  const category = catEl ? catEl.value : 'all';

  if (clearBtn) {
    clearBtn.style.display = query ? 'flex' : 'none';
  }

  if (!query) {
    if (adminSearchDebounceTimer) clearTimeout(adminSearchDebounceTimer);
    if (wrapper) {
      wrapper.style.display = 'none';
      wrapper.innerHTML = '';
    }
    return;
  }

  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.innerHTML = `
      <div class="search-empty-state" style="padding: 28px;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.8rem; color: var(--accent-gold); margin-bottom: 12px; display: block;"></i>
        <h4>Querying Hotel Directory...</h4>
        <p>Searching stored guest profiles, bookings, suites, and venues for "<strong>${escapeHtml(query)}</strong>"</p>
      </div>
    `;
  }

  if (adminSearchDebounceTimer) clearTimeout(adminSearchDebounceTimer);

  adminSearchDebounceTimer = setTimeout(async () => {
    try {
      const token = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
      const apiUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080';

      let backendResults = null;
      if (token) {
        try {
          const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          if (res.ok) {
            backendResults = await res.json();
          }
        } catch (netErr) {
          console.warn('[Admin Search API]', netErr);
        }
      }

      // Check current input to prevent race condition
      const currentQuery = (inputEl ? inputEl.value : '').trim();
      if (currentQuery !== query) return;

      if (Array.isArray(backendResults)) {
        renderSearchResults(backendResults, wrapper, query, 'ADMIN');
      } else {
        const localResults = executeAdvancedSearch(query, category, 'ADMIN');
        renderSearchResults(localResults, wrapper, query, 'ADMIN');
      }
    } catch (err) {
      console.error('[Admin Search]', err);
      const fallback = executeAdvancedSearch(query, category, 'ADMIN');
      renderSearchResults(fallback, wrapper, query, 'ADMIN');
    }
  }, 200);
}

function clearAdminAdvancedSearch() {
  const inputEl = document.getElementById('adminAdvancedSearchInput');
  const catEl = document.getElementById('adminSearchCategory');
  const wrapper = document.getElementById('adminSearchResultsWrapper');
  const clearBtn = document.getElementById('adminSearchClearBtn');

  if (adminSearchDebounceTimer) clearTimeout(adminSearchDebounceTimer);

  if (inputEl) inputEl.value = '';
  if (catEl) catEl.value = 'all';
  if (clearBtn) clearBtn.style.display = 'none';
  if (wrapper) {
    wrapper.style.display = 'none';
    wrapper.innerHTML = '';
  }

  if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
    soundEngine.playChime('bell');
  }
}

function runStaffSearch() {
  const inputEl = document.getElementById('staffAdvancedSearchInput');
  const catEl = document.getElementById('staffSearchCategory');
  const wrapper = document.getElementById('staffSearchResultsWrapper');
  const clearBtn = document.getElementById('staffSearchClearBtn');

  const rawQuery = inputEl ? inputEl.value : '';
  const query = rawQuery.trim();
  const category = catEl ? catEl.value : 'all';

  if (clearBtn) {
    clearBtn.style.display = query ? 'flex' : 'none';
  }

  if (!query) {
    if (staffSearchDebounceTimer) clearTimeout(staffSearchDebounceTimer);
    if (wrapper) {
      wrapper.style.display = 'none';
      wrapper.innerHTML = '';
    }
    return;
  }

  if (wrapper) {
    wrapper.style.display = 'block';
    wrapper.innerHTML = `
      <div class="search-empty-state" style="padding: 28px;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.8rem; color: var(--accent-gold); margin-bottom: 12px; display: block;"></i>
        <h4>Querying Front Desk Directory...</h4>
        <p>Searching stored guest folios, bookings, suites, and roster for "<strong>${escapeHtml(query)}</strong>"</p>
      </div>
    `;
  }

  if (staffSearchDebounceTimer) clearTimeout(staffSearchDebounceTimer);

  staffSearchDebounceTimer = setTimeout(async () => {
    try {
      const token = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
      const apiUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:8080';

      let backendResults = null;
      if (token) {
        try {
          const res = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          if (res.ok) {
            backendResults = await res.json();
          }
        } catch (netErr) {
          console.warn('[Staff Search API]', netErr);
        }
      }

      // Check current input to prevent race condition
      const currentQuery = (inputEl ? inputEl.value : '').trim();
      if (currentQuery !== query) return;

      if (Array.isArray(backendResults)) {
        renderSearchResults(backendResults, wrapper, query, 'STAFF');
      } else {
        const localResults = executeAdvancedSearch(query, category, 'STAFF');
        renderSearchResults(localResults, wrapper, query, 'STAFF');
      }
    } catch (err) {
      console.error('[Staff Search]', err);
      const fallback = executeAdvancedSearch(query, category, 'STAFF');
      renderSearchResults(fallback, wrapper, query, 'STAFF');
    }
  }, 200);
}

function clearStaffAdvancedSearch() {
  const inputEl = document.getElementById('staffAdvancedSearchInput');
  const catEl = document.getElementById('staffSearchCategory');
  const wrapper = document.getElementById('staffSearchResultsWrapper');
  const clearBtn = document.getElementById('staffSearchClearBtn');

  if (staffSearchDebounceTimer) clearTimeout(staffSearchDebounceTimer);

  if (inputEl) inputEl.value = '';
  if (catEl) catEl.value = 'all';
  if (clearBtn) clearBtn.style.display = 'none';
  if (wrapper) {
    wrapper.style.display = 'none';
    wrapper.innerHTML = '';
  }

  if (typeof soundEngine !== 'undefined' && soundEngine.playChime) {
    soundEngine.playChime('bell');
  }
}

window.executeAdvancedSearch = executeAdvancedSearch;
window.renderSearchResults = renderSearchResults;
window.runAdminSearch = runAdminSearch;
window.clearAdminAdvancedSearch = clearAdminAdvancedSearch;
window.runStaffSearch = runStaffSearch;
window.clearStaffAdvancedSearch = clearStaffAdvancedSearch;

// ==========================================================================
// 4. ROOM BOOKING WIZARD CONTROLLER (5 STEPS)
// ==========================================================================

const wizardState = {
  currentStep: 1,
  selectedRoomId: null,
  checkIn: '',
  checkOut: '',
  nights: 3,
  adults: 2,
  children: 0,
  specialRequests: '',
  selectedAddons: [],
  guestName: '',
  guestEmail: '',
  guestPhone: '+91 98765 43210',
  subtotal: 0,
  addonsTotal: 0,
  tax: 0,
  serviceCharge: 0,
  grandTotal: 0,
  confirmedBookingId: null
};

function openRoomBookingWizard(preselectedRoomId = null) {
  wizardState.currentStep = 1;
  wizardState.selectedRoomId = preselectedRoomId || 'R-701';

  // Default dates: tomorrow to +3 days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDate = new Date(today);
  checkoutDate.setDate(checkoutDate.getDate() + 4);

  wizardState.checkIn = tomorrow.toISOString().slice(0, 10);
  wizardState.checkOut = checkoutDate.toISOString().slice(0, 10);
  wizardState.nights = 3;
  wizardState.adults = 2;
  wizardState.children = 0;
  wizardState.specialRequests = '';
  wizardState.selectedAddons = [];

  // Autofill user credentials from logged in session
  const currentUser = AuthManager.getCurrentUser();
  if (currentUser) {
    wizardState.guestName = currentUser.fullName || 'VIP Guest';
    wizardState.guestEmail = currentUser.email || 'user@aureliagrand.com';
    wizardState.guestPhone = '+91 98765 43210';
  } else {
    wizardState.guestName = 'Lord Sterling & Lady Genevieve';
    wizardState.guestEmail = 'user@aureliagrand.com';
    wizardState.guestPhone = '+91 98765 43210';
  }

  // Populate form controls
  const inInput = document.getElementById('wizardCheckIn');
  const outInput = document.getElementById('wizardCheckOut');
  const adultsSelect = document.getElementById('wizardAdults');
  const kidsSelect = document.getElementById('wizardChildren');
  const reqText = document.getElementById('wizardSpecialRequests');
  const nameInput = document.getElementById('wizardGuestName');
  const emailInput = document.getElementById('wizardGuestEmail');
  const phoneInput = document.getElementById('wizardGuestPhone');

  if (inInput) inInput.value = wizardState.checkIn;
  if (outInput) outInput.value = wizardState.checkOut;
  if (adultsSelect) adultsSelect.value = wizardState.adults;
  if (kidsSelect) kidsSelect.value = wizardState.children;
  if (reqText) reqText.value = wizardState.specialRequests;
  if (nameInput) nameInput.value = wizardState.guestName;
  if (emailInput) emailInput.value = wizardState.guestEmail;
  if (phoneInput) phoneInput.value = wizardState.guestPhone;

  // Uncheck add-ons
  document.querySelectorAll('input[name="wizardAddonItem"]').forEach(cb => cb.checked = false);

  renderWizardRooms();
  recalculateWizardPrice();
  updateWizardStepView();

  const modal = document.getElementById('roomBookingWizardModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeRoomBookingWizard() {
  const modal = document.getElementById('roomBookingWizardModal');
  if (modal) modal.classList.remove('open');
}

function renderWizardRooms() {
  const grid = document.getElementById('wizardRoomsGrid');
  if (!grid) return;

  grid.innerHTML = ROOMS_DATA.map(room => {
    const isSelected = room.id === wizardState.selectedRoomId;
    return `
      <div class="wizard-room-card ${isSelected ? 'selected' : ''}" onclick="selectWizardRoom('${room.id}')">
        <div class="wizard-room-thumb">
          <img src="${room.image}" alt="${room.name}" />
          <span class="suite-avail-tag"><i class="fa-solid fa-circle-check"></i> Available</span>
        </div>
        <div class="wizard-room-details">
          <h5>${room.name}</h5>
          <div class="wizard-room-meta">
            <span><i class="fa-solid fa-maximize"></i> ${room.size}</span>
            <span><i class="fa-solid fa-user-group"></i> ${room.capacity}</span>
          </div>
          <div class="wizard-room-rate">
            <span>Per Night</span>
            <strong>${formatCurrency(room.price)}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectWizardRoom(roomId) {
  wizardState.selectedRoomId = roomId;
  renderWizardRooms();
  recalculateWizardPrice();
  soundEngine.playChime('bell');
}

function handleWizardDateChange() {
  const inInput = document.getElementById('wizardCheckIn');
  const outInput = document.getElementById('wizardCheckOut');
  if (inInput && outInput) {
    wizardState.checkIn = inInput.value;
    wizardState.checkOut = outInput.value;
  }
  recalculateWizardPrice();
}

function recalculateWizardPrice() {
  const room = ROOMS_DATA.find(r => r.id === wizardState.selectedRoomId) || ROOMS_DATA[0];
  if (!room) return;

  const inDate = new Date(wizardState.checkIn || new Date());
  const outDate = new Date(wizardState.checkOut || new Date());
  let diffDays = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
  if (isNaN(diffDays) || diffDays < 1) diffDays = 1;
  wizardState.nights = diffDays;

  // Selected add-ons
  const checkedBoxes = document.querySelectorAll('input[name="wizardAddonItem"]:checked');
  let addonsSum = 0;
  const addonsList = [];
  checkedBoxes.forEach(cb => {
    const price = parseInt(cb.dataset.price, 10) || 0;
    const isPerNight = cb.dataset.pernight === 'true';
    const cost = isPerNight ? price * diffDays : price;
    addonsSum += cost;
    addonsList.push({ name: cb.dataset.name, price: cost });
  });
  wizardState.selectedAddons = addonsList;

  const subtotal = room.price * diffDays;
  const luxuryTax = Math.round((subtotal + addonsSum) * 0.12);
  const serviceCharge = Math.round((subtotal + addonsSum) * 0.05);
  const grandTotal = subtotal + addonsSum + luxuryTax + serviceCharge;

  wizardState.subtotal = subtotal;
  wizardState.addonsTotal = addonsSum;
  wizardState.tax = luxuryTax;
  wizardState.serviceCharge = serviceCharge;
  wizardState.grandTotal = grandTotal;

  // Update DOM elements in Step 2
  const calcRateEl = document.getElementById('calcPerNightRate');
  const calcNightsEl = document.getElementById('calcNightCount');
  const subtotalEl = document.getElementById('wizardSubtotal');
  const addonsEl = document.getElementById('wizardAddonsTotal');
  const taxEl = document.getElementById('wizardTax');
  const serviceEl = document.getElementById('wizardService');
  const grandTotalEl = document.getElementById('wizardGrandTotal');

  if (calcRateEl) calcRateEl.textContent = formatCurrency(room.price);
  if (calcNightsEl) calcNightsEl.textContent = diffDays;
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (addonsEl) addonsEl.textContent = formatCurrency(addonsSum);
  if (taxEl) taxEl.textContent = formatCurrency(luxuryTax);
  if (serviceEl) serviceEl.textContent = formatCurrency(serviceCharge);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
}

function updateWizardStepView() {
  const step = wizardState.currentStep;

  // Toggle Panels
  for (let i = 1; i <= 5; i++) {
    const panel = document.getElementById(`wizardStep${i}`);
    if (panel) panel.style.display = (i === step) ? 'block' : 'none';
  }

  // Update Stepper indicators
  document.querySelectorAll('.wizard-step-item').forEach(item => {
    const s = parseInt(item.dataset.step, 10);
    item.classList.toggle('active', s === step);
    item.classList.toggle('completed', s < step);
  });

  // Footer controls
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');
  const indicatorText = document.getElementById('wizardStepIndicatorText');
  const modalFooter = document.getElementById('wizardModalFooter');

  if (step === 5) {
    if (modalFooter) modalFooter.style.display = 'none';
    return;
  }
  if (modalFooter) modalFooter.style.display = 'flex';

  if (prevBtn) prevBtn.style.display = (step > 1) ? 'inline-flex' : 'none';
  if (nextBtn) nextBtn.style.display = (step < 4) ? 'inline-flex' : 'none';
  if (submitBtn) submitBtn.style.display = (step === 4) ? 'inline-flex' : 'none';

  const stepTitles = [
    'Step 1 of 4: Select Suite',
    'Step 2 of 4: Stay Details',
    'Step 3 of 4: Guest Details',
    'Step 4 of 4: Folio Review',
    'Booking Confirmed'
  ];
  if (indicatorText) indicatorText.textContent = stepTitles[step - 1] || '';
}

function nextWizardStep() {
  if (wizardState.currentStep === 1) {
    if (!wizardState.selectedRoomId) {
      showToast('Selection Required', 'Please choose a luxury suite to proceed', 'info');
      return;
    }
  } else if (wizardState.currentStep === 2) {
    handleWizardDateChange();
    if (wizardState.checkOut <= wizardState.checkIn) {
      showToast('Date Discrepancy', 'Check-out date must be strictly after arrival date', 'info');
      return;
    }
    const adultsEl = document.getElementById('wizardAdults');
    const kidsEl = document.getElementById('wizardChildren');
    const reqEl = document.getElementById('wizardSpecialRequests');
    if (adultsEl) wizardState.adults = parseInt(adultsEl.value, 10) || 2;
    if (kidsEl) wizardState.children = parseInt(kidsEl.value, 10) || 0;
    if (reqEl) wizardState.specialRequests = reqEl.value.trim();
  } else if (wizardState.currentStep === 3) {
    const nameEl = document.getElementById('wizardGuestName');
    const emailEl = document.getElementById('wizardGuestEmail');
    const phoneEl = document.getElementById('wizardGuestPhone');

    if (!nameEl || !nameEl.value.trim()) {
      showToast('Guest Name Required', 'Please provide distinguished guest title and name', 'info');
      return;
    }
    if (!emailEl || !emailEl.value.trim()) {
      showToast('Email Required', 'Please enter a valid guest email for folio dispatch', 'info');
      return;
    }

    wizardState.guestName = nameEl.value.trim();
    wizardState.guestEmail = emailEl.value.trim();
    wizardState.guestPhone = phoneEl ? phoneEl.value.trim() : '+91 98765 43210';

    // Populate Step 4 Review details
    renderWizardStep4Review();
  }

  if (wizardState.currentStep < 4) {
    wizardState.currentStep++;
    updateWizardStepView();
    soundEngine.playChime('bell');
  }
}

function prevWizardStep() {
  if (wizardState.currentStep > 1) {
    wizardState.currentStep--;
    updateWizardStepView();
    soundEngine.playChime('bell');
  }
}

function renderWizardStep4Review() {
  const room = ROOMS_DATA.find(r => r.id === wizardState.selectedRoomId) || ROOMS_DATA[0];
  const previewBox = document.getElementById('reviewSuitePreview');
  const ledgerBox = document.getElementById('reviewFolioLedger');

  if (previewBox) {
    previewBox.innerHTML = `
      <div style="height: 140px; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
        <img src="${room.image}" alt="${room.name}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <h4 class="font-serif" style="color: var(--accent-gold); margin-bottom: 4px;">${room.name}</h4>
      <p style="color: var(--text-secondary); font-size: 0.82rem; margin-bottom: 12px;">Suite ${room.number} • ${room.floor} • ${room.size}</p>
      
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Check-in Date:</span>
          <strong>${wizardState.checkIn}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Check-out Date:</span>
          <strong>${wizardState.checkOut}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Duration:</span>
          <strong>${wizardState.nights} Nights</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Distinguished Guests:</span>
          <strong>${wizardState.adults} Adults${wizardState.children ? `, ${wizardState.children} Kids` : ''}</strong>
        </div>
      </div>
    `;
  }

  if (ledgerBox) {
    ledgerBox.innerHTML = `
      <h5 style="text-transform: uppercase; font-size: 0.76rem; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 12px;">Folio Statement Summary</h5>
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem;">
        <div style="display: flex; justify-content: space-between;">
          <span>Suite Rate (${formatCurrency(room.price)} × ${wizardState.nights}):</span>
          <strong>${formatCurrency(wizardState.subtotal)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Selected Bespoke Add-ons:</span>
          <strong>${formatCurrency(wizardState.addonsTotal)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Resort Luxury Tax (12%):</span>
          <strong>${formatCurrency(wizardState.tax)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Service & Royal Butler Folio (5%):</span>
          <strong>${formatCurrency(wizardState.serviceCharge)}</strong>
        </div>
        <div style="border-top: 1px solid rgba(212, 175, 55, 0.3); padding-top: 10px; margin-top: 6px; display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-weight: 700;">Total Estimated Folio:</span>
          <span style="color: var(--accent-gold); font-size: 1.3rem; font-weight: 700;">${formatCurrency(wizardState.grandTotal)}</span>
        </div>
      </div>

      <div style="margin-top: 18px; padding-top: 12px; border-top: 1px dashed var(--border-subtle); font-size: 0.8rem;">
        <span style="color: var(--text-muted); display: block; margin-bottom: 4px;">Folio Dispatch Recipient:</span>
        <div style="color: var(--text-primary); font-weight: 600;">${wizardState.guestName} (${wizardState.guestEmail})</div>
      </div>
    `;
  }
}

async function confirmRoomBooking() {
  const room = ROOMS_DATA.find(r => r.id === wizardState.selectedRoomId) || ROOMS_DATA[0];

  // Prevent local double-booking overlap
  const allCurrentBookings = loadBookings();
  const hasLocalOverlap = allCurrentBookings.some(b => 
    (b.roomId === room.id || b.roomNumber === room.number) &&
    b.status !== 'Cancelled' &&
    b.status !== 'CANCELLED' &&
    (wizardState.checkIn < b.checkOut && wizardState.checkOut > b.checkIn)
  );

  if (hasLocalOverlap) {
    soundEngine.playChime('bell');
    showToast('Reservation Conflict', `Suite ${room.number} is already booked for the selected dates. Please select alternative dates.`, 'info');
    return;
  }

  let finalBookingId = `AG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  let finalGuestId = 'GST-1024';

  const token = typeof AuthManager !== 'undefined' ? AuthManager.getToken() : null;
  if (token) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'room',
          roomId: room.id,
          checkInDate: wizardState.checkIn,
          checkOutDate: wizardState.checkOut,
          adults: wizardState.adults || 1,
          children: wizardState.children || 0,
          guestName: wizardState.guestName,
          guestEmail: wizardState.guestEmail,
          guestPhone: wizardState.guestPhone,
          specialRequests: wizardState.specialRequests,
          currency: 'INR'
        })
      });

      if (res.status === 409) {
        const errJson = await res.json().catch(() => ({}));
        soundEngine.playChime('bell');
        showToast('Reservation Conflict', errJson.message || 'Room is already booked for the selected dates.', 'info');
        return;
      }

      if (res.ok) {
        const savedDto = await res.json();
        if (savedDto && savedDto.id) {
          finalBookingId = savedDto.id;
          finalGuestId = savedDto.guestId || finalGuestId;
        }
      }
    } catch (netErr) {
      console.warn('[Backend Booking Call]', netErr);
    }
  }

  const newBooking = {
    id: finalBookingId,
    guestId: finalGuestId,
    type: 'room',
    roomId: room.id,
    title: room.name,
    roomNumber: room.number,
    guestName: wizardState.guestName,
    guestEmail: wizardState.guestEmail,
    guestPhone: wizardState.guestPhone,
    vipTier: 'gold',
    checkIn: wizardState.checkIn,
    checkOut: wizardState.checkOut,
    nights: wizardState.nights,
    adults: wizardState.adults,
    children: wizardState.children,
    basePrice: room.price,
    addons: wizardState.selectedAddons,
    subtotal: wizardState.subtotal,
    addonsTotal: wizardState.addonsTotal,
    tax: wizardState.tax,
    serviceCharge: wizardState.serviceCharge,
    totalAmount: wizardState.grandTotal,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Pre-Authorized Luxury Guarantee',
    specialRequests: wizardState.specialRequests,
    image: room.image,
    createdAt: new Date().toISOString()
  };

  saveBooking(newBooking);
  wizardState.confirmedBookingId = finalBookingId;

  // Render Step 5 Confirmed Folio Card
  const confirmedCard = document.getElementById('confirmedFolioDetails');
  if (confirmedCard) {
    confirmedCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 8px;">
        <span style="font-size: 0.8rem; color: var(--text-muted);">Booking Reference ID:</span>
        <strong style="color: var(--accent-gold); font-size: 1.15rem;">${finalBookingId}</strong>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.84rem;">
        <div>
          <span style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Suite:</span>
          <strong>${room.name}</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Stay Dates:</span>
          <strong>${wizardState.checkIn} → ${wizardState.checkOut}</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Registered Guest:</span>
          <strong>${wizardState.guestName}</strong>
        </div>
        <div>
          <span style="color: var(--text-muted); display: block; font-size: 0.72rem; text-transform: uppercase;">Total Folio Amount:</span>
          <strong style="color: var(--accent-gold);">${formatCurrency(wizardState.grandTotal)}</strong>
        </div>
      </div>
    `;
  }

  // Advance to Step 5
  wizardState.currentStep = 5;
  updateWizardStepView();
  soundEngine.playChime('success');
  showToast('Booking Confirmed!', `Reservation ${finalBookingId} successfully created.`, 'success');

  // Trigger reactive re-renders across views and sync with backend
  renderBookingsByActiveRole();
  updateBookingsNavBadge();
  if (typeof syncBookingsFromBackend === 'function') {
    syncBookingsFromBackend();
  }
}

function goToMyBookingsFromWizard() {
  closeRoomBookingWizard();
  // Switch to Bookings tab pane
  const reservationsTabBtn = document.querySelector('.tab-btn[data-target="tabReservations"]') || document.querySelector('.sidebar-nav .nav-item[data-target="tabReservations"]');
  if (reservationsTabBtn) {
    reservationsTabBtn.click();
  }
  if (typeof renderBookingsByActiveRole === 'function') {
    renderBookingsByActiveRole();
  }
}

// ==========================================================================
// 5. BOOKING DETAILS MODAL CONTROLLER
// ==========================================================================

let activeModalBookingId = null;

function openBookingDetailsModal(bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  activeModalBookingId = bookingId;

  const idEl = document.getElementById('detailsModalBookingId');
  const badgeEl = document.getElementById('detailsModalStatusBadge');
  const bodyEl = document.getElementById('bookingDetailsModalBody');
  const actionsEl = document.getElementById('detailsActionBtns');

  if (idEl) idEl.textContent = booking.id;
  if (badgeEl) {
    badgeEl.textContent = booking.status;
    badgeEl.className = `booking-status-badge status-${booking.status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  const isCompleted = booking.status === 'Completed';
  const isCancelled = booking.status === 'Cancelled';
  const isHall = booking.type === 'hall';

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
          <div style="height: 120px; border-radius: 6px; overflow: hidden; margin-bottom: 12px;">
            <img src="${booking.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}" alt="${booking.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <h4 class="font-serif" style="color: var(--accent-gold); font-size: 1.1rem; margin-bottom: 4px;">${booking.title}</h4>
          <span style="font-size: 0.78rem; color: var(--text-secondary);">${isHall ? 'Banquet & Event Venue' : `Suite ${booking.roomNumber || ''}`}</span>

          <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">${isHall ? 'Event Date' : 'Check-in'}:</span>
              <strong>${booking.checkIn}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">${isHall ? 'Concludes' : 'Check-out'}:</span>
              <strong>${booking.checkOut}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Duration:</span>
              <strong>${booking.nights || 1} Night(s)</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Party Size:</span>
              <strong>${booking.adults || 2} Guest(s)</strong>
            </div>
          </div>
        </div>

        <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h5 style="font-size: 0.76rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 10px;">Distinguished Guest Profile</h5>
            <div style="font-size: 0.85rem; margin-bottom: 12px;">
              <strong style="font-size: 1.05rem; display: block; margin-bottom: 2px;">${booking.guestName}</strong>
              <div style="color: var(--text-secondary);">${booking.guestEmail || 'user@aureliagrand.com'}</div>
              <div style="color: var(--text-secondary);">${booking.guestPhone || '+91 98765 43210'}</div>
            </div>

            <div style="margin-top: 12px;">
              <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">Special Requests:</span>
              <p style="font-size: 0.82rem; color: var(--text-secondary); background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px; border: 1px solid var(--border-subtle); margin: 0;">
                ${booking.specialRequests || 'No bespoke concierge requests recorded.'}
              </p>
            </div>
          </div>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Payment Clearance:</span>
            <span class="payment-status-badge payment-${booking.paymentStatus.toLowerCase()}">${booking.paymentStatus}</span>
          </div>
        </div>
      </div>

      <!-- Itemized Folio Table -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
        <h5 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 10px;">Itemized Folio Breakdown</h5>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between;">
            <span>Accommodation Nightly Rate:</span>
            <strong>${formatCurrency(booking.subtotal || booking.basePrice)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Curated Bespoke Add-ons:</span>
            <strong>${formatCurrency(booking.addonsTotal || 0)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Resort Luxury Tax (12%):</span>
            <strong>${formatCurrency(booking.tax || 0)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Service Charge & Butler Folio (5%):</span>
            <strong>${formatCurrency(booking.serviceCharge || 0)}</strong>
          </div>
          <div style="border-top: 1px solid rgba(212,175,55,0.3); padding-top: 10px; margin-top: 4px; display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: 700;">Total Folio Amount:</span>
            <span style="color: var(--accent-gold); font-size: 1.35rem; font-weight: 700;">${formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (actionsEl) {
    if (!isCompleted && !isCancelled) {
      actionsEl.innerHTML = `
        <button type="button" class="btn-secondary-luxury" onclick="closeBookingDetailsModal(); openModifyBookingModal('${booking.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Modify Reservation
        </button>
        <button type="button" class="btn-secondary-luxury" style="color: #f87171;" onclick="closeBookingDetailsModal(); openCancelBookingModal('${booking.id}')">
          <i class="fa-solid fa-ban"></i> Cancel Reservation
        </button>
      `;
    } else {
      actionsEl.innerHTML = '';
    }
  }

  const modal = document.getElementById('bookingDetailsModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeBookingDetailsModal() {
  const modal = document.getElementById('bookingDetailsModal');
  if (modal) modal.classList.remove('open');
}

function openInvoiceFromDetails() {
  if (activeModalBookingId) {
    closeBookingDetailsModal();
    openBookingInvoiceModal(activeModalBookingId);
  }
}

// ==========================================================================
// 6. MODIFY BOOKING MODAL CONTROLLER
// ==========================================================================

function openModifyBookingModal(bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  if (booking.status === 'Completed' || booking.status === 'Cancelled') {
    showToast('Modification Restricted', 'Completed or cancelled folios cannot be altered.', 'info');
    return;
  }

  const idInput = document.getElementById('modifyBookingId');
  const inInput = document.getElementById('modifyCheckIn');
  const outInput = document.getElementById('modifyCheckOut');
  const guestsSelect = document.getElementById('modifyGuests');
  const requestsText = document.getElementById('modifySpecialRequests');
  const subtitleEl = document.getElementById('modifyModalSubtitle');

  if (idInput) idInput.value = booking.id;
  if (inInput) inInput.value = booking.checkIn;
  if (outInput) outInput.value = booking.checkOut;
  if (guestsSelect) guestsSelect.value = booking.adults || 2;
  if (requestsText) requestsText.value = booking.specialRequests || '';
  if (subtitleEl) subtitleEl.textContent = `Reservation ${booking.id} • ${booking.title}`;

  recalculateModifiedBooking();

  const modal = document.getElementById('modifyBookingModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeModifyBookingModal() {
  const modal = document.getElementById('modifyBookingModal');
  if (modal) modal.classList.remove('open');
}

function recalculateModifiedBooking() {
  const bookingId = document.getElementById('modifyBookingId')?.value;
  const booking = getBookingById(bookingId);
  if (!booking) return;

  const inVal = document.getElementById('modifyCheckIn')?.value;
  const outVal = document.getElementById('modifyCheckOut')?.value;

  const inDate = new Date(inVal || booking.checkIn);
  const outDate = new Date(outVal || booking.checkOut);
  let nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights < 1) nights = 1;

  const nightsDisplay = document.getElementById('modifyNightsDisplay');
  if (nightsDisplay) nightsDisplay.value = `${nights} Night(s)`;

  const baseNightlyRate = booking.basePrice || Math.round(booking.totalAmount / (booking.nights || 1));
  const addonsTotal = booking.addonsTotal || 0;
  const subtotal = baseNightlyRate * nights;
  const tax = Math.round((subtotal + addonsTotal) * 0.12);
  const service = Math.round((subtotal + addonsTotal) * 0.05);
  const recalculatedGrandTotal = subtotal + addonsTotal + tax + service;

  const totalEl = document.getElementById('modifyRecalcTotal');
  if (totalEl) totalEl.textContent = formatCurrency(recalculatedGrandTotal);
}

function handleSaveModifiedBooking(e) {
  e.preventDefault();
  const bookingId = document.getElementById('modifyBookingId')?.value;
  const booking = getBookingById(bookingId);
  if (!booking) return;

  const newCheckIn = document.getElementById('modifyCheckIn').value;
  const newCheckOut = document.getElementById('modifyCheckOut').value;
  const newGuests = parseInt(document.getElementById('modifyGuests').value, 10) || 2;
  const newRequests = document.getElementById('modifySpecialRequests').value.trim();

  if (newCheckOut <= newCheckIn) {
    showToast('Invalid Dates', 'Check-out date must be after check-in date', 'info');
    return;
  }

  const inDate = new Date(newCheckIn);
  const outDate = new Date(newCheckOut);
  const nights = Math.max(1, Math.round((outDate - inDate) / (1000 * 60 * 60 * 24)));

  const baseNightlyRate = booking.basePrice || Math.round(booking.totalAmount / (booking.nights || 1));
  const addonsTotal = booking.addonsTotal || 0;
  const subtotal = baseNightlyRate * nights;
  const tax = Math.round((subtotal + addonsTotal) * 0.12);
  const service = Math.round((subtotal + addonsTotal) * 0.05);
  const newTotal = subtotal + addonsTotal + tax + service;

  booking.checkIn = newCheckIn;
  booking.checkOut = newCheckOut;
  booking.nights = nights;
  booking.adults = newGuests;
  booking.specialRequests = newRequests;
  booking.subtotal = subtotal;
  booking.tax = tax;
  booking.serviceCharge = service;
  booking.totalAmount = newTotal;

  saveBooking(booking);

  closeModifyBookingModal();
  soundEngine.playChime('success');
  showToast('Reservation Modified', `Schedule updated for ${booking.id}. Folio recalculated.`, 'success');

  renderBookingsByActiveRole();
}

// ==========================================================================
// 7. CANCEL BOOKING MODAL CONTROLLER
// ==========================================================================

let cancelTargetBookingId = null;

function openCancelBookingModal(bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  if (booking.status === 'Completed' || booking.status === 'Cancelled') {
    showToast('Cannot Cancel', 'This booking has already been completed or cancelled.', 'info');
    return;
  }

  cancelTargetBookingId = bookingId;

  const refEl = document.getElementById('cancelModalBookingRef');
  const noticeEl = document.getElementById('cancelRefundNotice');

  if (refEl) refEl.textContent = `Booking ${booking.id} • ${booking.title}`;
  if (noticeEl) {
    noticeEl.innerHTML = `
      <i class="fa-solid fa-shield-halved text-emerald"></i>
      <span>Full mock refund of <strong>${formatCurrency(booking.totalAmount)}</strong> will be credited back to your original billing folio.</span>
    `;
  }

  const modal = document.getElementById('cancelBookingModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeCancelBookingModal() {
  const modal = document.getElementById('cancelBookingModal');
  if (modal) modal.classList.remove('open');
  cancelTargetBookingId = null;
}

function handleConfirmCancelBooking() {
  if (!cancelTargetBookingId) return;

  const booking = getBookingById(cancelTargetBookingId);
  if (!booking) return;

  booking.status = 'Cancelled';
  booking.paymentStatus = 'Refunded';
  saveBooking(booking);

  // If this room was occupied by this guest, release it
  if (booking.roomId) {
    const room = ROOMS_DATA.find(r => r.id === booking.roomId);
    if (room && room.status === 'occupied') {
      room.status = 'available';
      room.guest = null;
    }
  }

  closeCancelBookingModal();
  soundEngine.playChime('bell');
  showToast('Booking Cancelled', `Reservation ${booking.id} cancelled. Mock refund processed.`, 'info');

  renderBookingsByActiveRole();
  updateBookingsNavBadge();
}

// ==========================================================================
// 8. OFFICIAL PRINTABLE INVOICE FOLIO MODAL
// ==========================================================================

function openBookingInvoiceModal(bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking) return;

  const body = document.getElementById('invoiceModalBody');
  if (!body) return;

  const isHall = booking.type === 'hall';
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  body.innerHTML = `
    <div class="invoice-container">
      <div class="invoice-header-flex">
        <div class="invoice-brand">
          <h2>AURELIA GRAND</h2>
          <p>Luxury Resort & Marine Sanctuary • Maldives Atoll</p>
          <p style="font-size: 0.72rem; color: #888;">Private Lagoon Island 04, North Malé Atoll</p>
        </div>
        <div class="invoice-folio-meta">
          <h3>GUEST FOLIO INVOICE</h3>
          <p><strong>Folio Ref:</strong> ${booking.id}</p>
          <p><strong>Issue Date:</strong> ${issueDate}</p>
          <p><strong>Status:</strong> ${booking.paymentStatus.toUpperCase()}</p>
        </div>
      </div>

      <div class="invoice-details-grid">
        <div class="invoice-box">
          <h4>Distinguished Guest Details</h4>
          <p><strong>${booking.guestName}</strong></p>
          <p>${booking.guestEmail || 'user@aureliagrand.com'}</p>
          <p>${booking.guestPhone || '+91 98765 43210'}</p>
          <p style="color: #d4af37; font-size: 0.78rem; margin-top: 4px;"><i class="fa-solid fa-crown"></i> Diamond Tier VIP Privileges</p>
        </div>

        <div class="invoice-box">
          <h4>Stay & Accommodation Parameters</h4>
          <p><strong>${booking.title}</strong> ${isHall ? '' : `(Suite ${booking.roomNumber})`}</p>
          <p>${isHall ? 'Event Date' : 'Check-in'}: ${booking.checkIn}</p>
          <p>${isHall ? 'Concludes' : 'Check-out'}: ${booking.checkOut}</p>
          <p>Bespoke Duration: ${booking.nights || 1} Night(s) • ${booking.adults || 2} Registered Guest(s)</p>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty / Nights</th>
            <th style="text-align: right;">Unit Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${booking.title}</strong>
              <div style="font-size: 0.74rem; color: #666;">Luxury accommodation tariff</div>
            </td>
            <td style="text-align: center;">${booking.nights || 1}</td>
            <td style="text-align: right;">${formatCurrency(booking.basePrice || Math.round(booking.subtotal / (booking.nights || 1)))}</td>
            <td style="text-align: right;">${formatCurrency(booking.subtotal || booking.basePrice)}</td>
          </tr>
          ${(booking.addons && booking.addons.length > 0) ? booking.addons.map(addon => `
            <tr>
              <td>
                <strong>${addon.name}</strong>
                <div style="font-size: 0.74rem; color: #666;">Curated bespoke VIP add-on</div>
              </td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">${formatCurrency(addon.price)}</td>
              <td style="text-align: right;">${formatCurrency(addon.price)}</td>
            </tr>
          `).join('') : ''}
          <tr>
            <td>
              <strong>Resort Luxury Hospitality Tax (12%)</strong>
              <div style="font-size: 0.74rem; color: #666;">National Tourism & Environmental Levy</div>
            </td>
            <td style="text-align: center;">—</td>
            <td style="text-align: right;">12%</td>
            <td style="text-align: right;">${formatCurrency(booking.tax || 0)}</td>
          </tr>
          <tr>
            <td>
              <strong>Service Charge & Royal Butler Brigade (5%)</strong>
              <div style="font-size: 0.74rem; color: #666;">Gratuity & Bespoke 24/7 Concierge Folio</div>
            </td>
            <td style="text-align: center;">—</td>
            <td style="text-align: right;">5%</td>
            <td style="text-align: right;">${formatCurrency(booking.serviceCharge || 0)}</td>
          </tr>
        </tbody>
      </table>

      <div class="invoice-totals-wrap">
        <table class="invoice-totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;"><strong>${formatCurrency(booking.subtotal || booking.basePrice)}</strong></td>
          </tr>
          <tr>
            <td>Add-ons:</td>
            <td style="text-align: right;"><strong>${formatCurrency(booking.addonsTotal || 0)}</strong></td>
          </tr>
          <tr>
            <td>Taxes & Levies:</td>
            <td style="text-align: right;"><strong>${formatCurrency(booking.tax || 0)}</strong></td>
          </tr>
          <tr>
            <td>Service Gratuity:</td>
            <td style="text-align: right;"><strong>${formatCurrency(booking.serviceCharge || 0)}</strong></td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td style="text-align: right;"><strong>${formatCurrency(booking.totalAmount)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="invoice-stamp">
        <p><strong>AUTHENTICATED LUXURY FOLIO RECEIPT</strong> • Aurelia Grand International Hospitality Group</p>
        <p>Settled via ${booking.paymentMethod || 'Pre-Authorized Luxury Folio'}. Thank you for gracing Aurelia Grand with your presence.</p>
      </div>
    </div>
  `;

  const modal = document.getElementById('bookingInvoiceModal');
  if (modal) modal.classList.add('open');
  soundEngine.playChime('bell');
}

function closeBookingInvoiceModal() {
  const modal = document.getElementById('bookingInvoiceModal');
  if (modal) modal.classList.remove('open');
}

// Global exposure of Bookings functions
window.loadBookings = loadBookings;
window.persistBookings = persistBookings;
window.setGuestBookingFilter = setGuestBookingFilter;
window.filterGuestBookings = filterGuestBookings;
window.renderGuestBookings = renderGuestBookings;
window.renderAdminBookings = renderAdminBookings;
window.filterAdminBookings = filterAdminBookings;
window.resetAdminBookingFilters = resetAdminBookingFilters;
window.adminUpdateBookingStatus = adminUpdateBookingStatus;
window.exportBookingsCSV = exportBookingsCSV;
window.setStaffFilter = setStaffFilter;
window.filterStaffBookings = filterStaffBookings;
window.renderStaffBookings = renderStaffBookings;
window.staffUpdateBookingStatus = staffUpdateBookingStatus;
window.openRoomBookingWizard = openRoomBookingWizard;
window.closeRoomBookingWizard = closeRoomBookingWizard;
window.selectWizardRoom = selectWizardRoom;
window.handleWizardDateChange = handleWizardDateChange;
window.nextWizardStep = nextWizardStep;
window.prevWizardStep = prevWizardStep;
window.confirmRoomBooking = confirmRoomBooking;
window.goToMyBookingsFromWizard = goToMyBookingsFromWizard;
window.openBookingDetailsModal = openBookingDetailsModal;
window.closeBookingDetailsModal = closeBookingDetailsModal;
window.openInvoiceFromDetails = openInvoiceFromDetails;
window.openModifyBookingModal = openModifyBookingModal;
window.closeModifyBookingModal = closeModifyBookingModal;
window.recalculateModifiedBooking = recalculateModifiedBooking;
window.handleSaveModifiedBooking = handleSaveModifiedBooking;
window.openCancelBookingModal = openCancelBookingModal;
window.closeCancelBookingModal = closeCancelBookingModal;
window.handleConfirmCancelBooking = handleConfirmCancelBooking;
window.openBookingInvoiceModal = openBookingInvoiceModal;
window.closeBookingInvoiceModal = closeBookingInvoiceModal;
window.updateBookingsNavBadge = updateBookingsNavBadge;
window.renderBookingsByActiveRole = renderBookingsByActiveRole;



