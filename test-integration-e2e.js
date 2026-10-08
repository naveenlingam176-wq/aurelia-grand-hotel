/**
 * Comprehensive End-to-End Integration & Verification Test Suite
 * Tests Spring Boot 3 + MySQL Backend running on port 8080 connected to Frontend
 */

const http = require('http');

const PORT = 8080;
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

function request({ path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runE2ETests() {
  console.log('===============================================================');
  console.log('  AURELIA GRAND LUXURY - FULL END-TO-END INTEGRATION TEST SUITE');
  console.log('===============================================================\n');

  // --- 1. Health & Server Check ---
  console.log('--- Step 1: Health & Spring Boot Server Check ---');
  const healthRes = await request({ path: '/api/health' });
  assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
  assert(healthRes.body.status === 'healthy', 'Health check reports status: "healthy"');

  // --- 2. Static Content Serving ---
  console.log('\n--- Step 2: Static Resource Serving (Preserved Frontend UI) ---');
  const indexRes = await request({ path: '/index.html' });
  assert(indexRes.status === 200 && indexRes.body.includes('Aurelia Grand'), 'Spring Boot serves index.html with luxury branding');
  const cssRes = await request({ path: '/styles.css' });
  assert(cssRes.status === 200 && cssRes.body.includes('--accent-gold'), 'Spring Boot serves styles.css with theme tokens');
  const jsRes = await request({ path: '/app.js' });
  assert(jsRes.status === 200 && jsRes.body.includes('AuthManager'), 'Spring Boot serves app.js application logic');

  // --- 3. Catalog Browsing (Public Endpoints) ---
  console.log('\n--- Step 3: Public Catalog Endpoints (Rooms, Suites, Halls, Dining) ---');
  const roomsRes = await request({ path: '/api/rooms' });
  assert(roomsRes.status === 200 && Array.isArray(roomsRes.body), 'GET /api/rooms returns array of curated rooms');
  assert(roomsRes.body.length >= 5, `Found ${roomsRes.body.length} luxury rooms in MySQL database`);

  const suitesRes = await request({ path: '/api/suites' });
  assert(suitesRes.status === 200 && Array.isArray(suitesRes.body), 'GET /api/suites returns array of suites');

  const hallsRes = await request({ path: '/api/party-halls' });
  assert(hallsRes.status === 200 && Array.isArray(hallsRes.body), 'GET /api/party-halls returns array of event halls');

  const restaurantsRes = await request({ path: '/api/restaurants' });
  assert(restaurantsRes.status === 200 && Array.isArray(restaurantsRes.body), 'GET /api/restaurants returns dining options');

  // --- 4. User Authentication & JWT Issuance ---
  console.log('\n--- Step 4: Authentication & JWT Clearance ---');
  // Admin Login
  const adminLogin = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'admin@aureliagrand.com', password: 'AdminPassword123!' }
  });
  assert(adminLogin.status === 200 && adminLogin.body.token, 'Admin logs in successfully and receives JWT token');
  const adminToken = adminLogin.body.token;

  // Staff Login
  const staffLogin = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'staff@aureliagrand.com', password: 'StaffPassword123!' }
  });
  assert(staffLogin.status === 200 && staffLogin.body.token, 'Staff logs in successfully and receives JWT token');
  const staffToken = staffLogin.body.token;

  // Guest Login
  const guestLogin = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'user@aureliagrand.com', password: 'UserPassword123!' }
  });
  assert(guestLogin.status === 200 && guestLogin.body.token, 'Guest logs in successfully and receives JWT token');
  const guestToken = guestLogin.body.token;

  // Invalid Login
  const badLogin = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'admin@aureliagrand.com', password: 'WrongPassword' }
  });
  assert(badLogin.status === 401, 'Invalid credentials rejected with HTTP 401 Unauthorized');

  // --- 5. Role-Based Access Control (RBAC) Isolation ---
  console.log('\n--- Step 5: Strict Role-Based Access Isolation ---');
  // Financial Analytics: Admin only
  const adminAnalytics = await request({
    path: '/api/analytics/dashboard',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(adminAnalytics.status === 200 && adminAnalytics.body.totalRevenue !== undefined, 'Admin successfully accesses /api/analytics/dashboard');

  const staffAnalytics = await request({
    path: '/api/analytics/dashboard',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  assert(staffAnalytics.status === 403, 'Staff is strictly FORBIDDEN (HTTP 403) from accessing financial analytics');

  const guestAnalytics = await request({
    path: '/api/analytics/dashboard',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(guestAnalytics.status === 403, 'Guest is strictly FORBIDDEN (HTTP 403) from accessing financial analytics');

  // Advanced Search: Admin & Staff only
  const adminSearch = await request({
    path: '/api/search?q=John&category=all',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(adminSearch.status === 200 && Array.isArray(adminSearch.body), 'Admin successfully executes operational search');

  const staffSearch = await request({
    path: '/api/search?q=John&category=all',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  assert(staffSearch.status === 200 && Array.isArray(staffSearch.body), 'Staff successfully executes operational search');

  const guestSearch = await request({
    path: '/api/search?q=John&category=all',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(guestSearch.status === 403, 'Guest is strictly FORBIDDEN (HTTP 403) from executing operational search');

  // User Administration: Admin only
  const adminUsers = await request({
    path: '/api/users',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(adminUsers.status === 200, 'Admin can access user management');

  const staffUsers = await request({
    path: '/api/users',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  assert(staffUsers.status === 403, 'Staff is FORBIDDEN from user management');

  // --- 6. Double Booking Prevention (Room Reservations) ---
  console.log('\n--- Step 6: Double Booking Prevention (Rooms) ---');
  const randomDays = Math.floor(Math.random() * 500) + 100;
  function formatDate(d) { return d.toISOString().slice(0, 10); }
  const checkIn = formatDate(new Date(Date.now() + randomDays * 86400000));
  const checkOut = formatDate(new Date(Date.now() + (randomDays + 5) * 86400000));
  const partialIn = formatDate(new Date(Date.now() + (randomDays + 2) * 86400000));
  const partialOut = formatDate(new Date(Date.now() + (randomDays + 8) * 86400000));
  const nextIn = formatDate(new Date(Date.now() + (randomDays + 6) * 86400000));
  const nextOut = formatDate(new Date(Date.now() + (randomDays + 10) * 86400000));

  const initialBooking = await request({
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${guestToken}` },
    body: {
      type: 'room',
      roomId: 'R-701',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestName: 'Lady Genevieve',
      guestEmail: 'user@aureliagrand.com',
      adults: 2,
      specialRequests: 'High floor ocean breeze setup'
    }
  });
  assert(initialBooking.status === 201, `Initial room booking created successfully (HTTP 201, ID: ${initialBooking.body.id})`);

  // Attempt 1: Exact Overlap
  const conflictExact = await request({
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${guestToken}` },
    body: {
      type: 'room',
      roomId: 'R-701',
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestName: 'Lord Sterling',
      guestEmail: 'user@aureliagrand.com'
    }
  });
  assert(conflictExact.status === 409, 'Double booking rejected with HTTP 409 Conflict for exact overlapping dates');

  // Attempt 2: Partial Overlap (Starts during existing stay)
  const conflictPartial = await request({
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${guestToken}` },
    body: {
      type: 'room',
      roomId: 'R-701',
      checkInDate: partialIn,
      checkOutDate: partialOut,
      guestName: 'Another Guest',
      guestEmail: 'other@guest.com'
    }
  });
  assert(conflictPartial.status === 409, 'Double booking rejected with HTTP 409 Conflict for partial overlapping dates');

  // Attempt 3: Non-overlapping stay (Should Succeed)
  const nonOverlap = await request({
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${guestToken}` },
    body: {
      type: 'room',
      roomId: 'R-701',
      checkInDate: nextIn,
      checkOutDate: nextOut,
      guestName: 'Lady Genevieve',
      guestEmail: 'user@aureliagrand.com'
    }
  });
  assert(nonOverlap.status === 201, `Non-overlapping booking accepted cleanly (HTTP 201, ID: ${nonOverlap.body.id})`);

  // --- 7. Double Booking Prevention (Party Halls) ---
  console.log('\n--- Step 7: Double Booking Prevention (Party Halls) ---');
  const hallDate = formatDate(new Date(Date.now() + (randomDays + 20) * 86400000));
  const hallBooking1 = await request({
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      type: 'hall',
      hallId: 'hall-royal-ballroom',
      checkInDate: hallDate,
      checkOutDate: hallDate,
      guestName: 'Grand Gala Host',
      guestEmail: 'gala@aureliagrand.com',
      guests: 350,
      specialRequests: 'Christmas Gala'
    }
  });
  assert(hallBooking1.status === 201, `Party hall booked successfully (HTTP 201, ID: ${hallBooking1.body.id})`);

  const hallConflict = await request({
    path: '/api/bookings',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      type: 'hall',
      hallId: 'hall-royal-ballroom',
      checkInDate: hallDate,
      checkOutDate: hallDate,
      guestName: 'Conflicting Host',
      guestEmail: 'conflict@aureliagrand.com'
    }
  });
  assert(hallConflict.status === 409, 'Party hall double booking rejected with HTTP 409 Conflict');

  // --- 8. Favorites Feature (Guest Exclusivity) ---
  console.log('\n--- Step 8: Favorites Feature (Guest Only) ---');
  const addFav = await request({
    path: '/api/favorites/toggle/R-602',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(addFav.status === 200 && addFav.body.isFavorite === true, 'Guest can toggle favorite ON for R-602');

  const getFavs = await request({
    path: '/api/favorites/ids',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(getFavs.status === 200 && getFavs.body.includes('R-602'), 'Favorite room R-602 appears in guest favorites list');

  const removeFav = await request({
    path: '/api/favorites/toggle/R-602',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(removeFav.status === 200 && removeFav.body.isFavorite === false, 'Guest can toggle favorite OFF for R-602');

  const staffFav = await request({
    path: '/api/favorites',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  assert(staffFav.status === 403, 'Staff is FORBIDDEN (HTTP 403) from accessing favorites feature');

  // --- 9. Currency & Country Preferences Persistence ---
  console.log('\n--- Step 9: User Currency Preference Persistence ---');
  const updatePref = await request({
    path: '/api/auth/preferences',
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${guestToken}` },
    body: { country: 'United States', currency: 'USD' }
  });
  assert(updatePref.status === 200 && updatePref.body.currency === 'USD', 'User currency preference updated to USD');

  const getProfile = await request({
    path: '/api/auth/me',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(getProfile.status === 200 && getProfile.body.user.currency === 'USD', 'Currency preference persisted in MySQL database profile');

  // --- 10. Room Status & Housekeeping ---
  console.log('\n--- Step 10: Room Status Updates (Staff / Admin Operation) ---');
  const updateStatus = await request({
    path: '/api/rooms/R-701/status?status=maintenance',
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  assert(updateStatus.status === 200 && updateStatus.body.status === 'maintenance', 'Staff can update room status to maintenance');

  const guestStatusUpdate = await request({
    path: '/api/rooms/R-701/status?status=available',
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${guestToken}` }
  });
  assert(guestStatusUpdate.status === 403, 'Guest is FORBIDDEN (HTTP 403) from modifying room status');

  console.log('\n===============================================================');
  console.log(`  ALL ${passed} / ${total} END-TO-END INTEGRATION TESTS PASSED!`);
  console.log('===============================================================');
}

runE2ETests().catch(err => {
  console.error('\n❌ E2E Integration Test Failure:', err);
  process.exit(1);
});
