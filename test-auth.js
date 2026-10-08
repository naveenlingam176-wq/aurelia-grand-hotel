/**
 * Comprehensive Automated Test Suite for User Login & Authentication System
 * Covers Steps 1 to 12
 */

const http = require('http');
const { getDatabase, closeDatabase } = require('./db/database');
const UserRepository = require('./repositories/userRepository');
const PasswordService = require('./services/passwordService');
const AuthService = require('./services/authService');
const server = require('./server');

const TEST_PORT = 5088;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', chunk => chunks += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: chunks });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('  AURELIA GRAND HOTEL MANAGEMENT SYSTEM - AUTH TEST SUITE');
  console.log('===============================================================\n');

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

  // --- STEP 1: Database & Table Entity ---
  console.log('\n--- Step 1: Database & User Table Entity ---');
  const db = getDatabase();
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  assert(Boolean(tableCheck), 'Users table exists in SQLite database');

  const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  assert(cols.includes('id') && cols.includes('fullName') && cols.includes('email') && 
         cols.includes('password') && cols.includes('role') && cols.includes('status') && 
         cols.includes('createdAt'), 'Users table contains all required fields: id, fullName, email, password, role, status, createdAt');

  // --- STEP 2: User Repository ---
  console.log('\n--- Step 2: User Repository ---');
  const userRepo = new UserRepository();
  userRepo.seedDefaultUsers();
  const allUsers = userRepo.listAll();
  assert(allUsers.length >= 3, `Default users seeded: found ${allUsers.length} users`);

  const admin = userRepo.findByEmail('admin@aureliagrand.com');
  assert(admin !== null && admin.role === 'ADMIN', 'Admin user found by email with role ADMIN');

  const staff = userRepo.findByEmail('staff@aureliagrand.com');
  assert(staff !== null && staff.role === 'STAFF', 'Staff user found by email with role STAFF');

  const guest = userRepo.findByEmail('user@aureliagrand.com');
  assert(guest !== null && guest.role === 'USER', 'Guest user found by email with role USER');

  // --- STEP 3: Password Hashing ---
  console.log('\n--- Step 3: Password Hashing Security ---');
  const testPlainPass = 'UltraSecure123!#';
  const hashed = PasswordService.hashPassword(testPlainPass);
  assert(hashed !== testPlainPass, 'Password is never stored in plain text');
  assert(hashed.startsWith('scrypt:v1:'), 'Password hashed using salted cryptographic algorithm');
  assert(PasswordService.verifyPassword(testPlainPass, hashed) === true, 'Password verification succeeds with correct password');
  assert(PasswordService.verifyPassword('WrongPassword', hashed) === false, 'Password verification fails with incorrect password');

  // --- STEP 4: Authentication Service ---
  console.log('\n--- Step 4: Authentication Service ---');
  const authService = new AuthService(userRepo);
  const authSuccess = authService.authenticate('admin@aureliagrand.com', 'AdminPassword123!');
  assert(authSuccess.success === true, 'AuthService authenticates valid Admin credentials');
  assert(authSuccess.user.email === 'admin@aureliagrand.com', 'AuthService returns correct user profile');
  assert(authSuccess.user.password === undefined, 'AuthService NEVER returns password hash in user object');

  const authFailPass = authService.authenticate('admin@aureliagrand.com', 'InvalidPassword');
  assert(authFailPass.success === false, 'AuthService rejects incorrect password');

  const authFailUser = authService.authenticate('unknown@hotel.com', 'AnyPassword');
  assert(authFailUser.success === false, 'AuthService rejects unknown email');

  // --- STEP 5 & 6: HTTP Server, Login API & JWT Authentication ---
  console.log('\n--- Steps 5 & 6: Login API (POST /api/auth/login) & JWT ---');
  await new Promise(resolve => server.listen(TEST_PORT, resolve));

  try {
    // 1. Valid Admin Login
    const loginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@aureliagrand.com',
      password: 'AdminPassword123!'
    });

    assert(loginRes.status === 200, 'POST /api/auth/login returns HTTP 200');
    assert(loginRes.body.success === true, 'Response payload has success: true');
    assert(loginRes.body.message === 'Login successful', 'Response payload has message: "Login successful"');
    assert(typeof loginRes.body.token === 'string' && loginRes.body.token.split('.').length === 3, 'Valid JWT token returned');
    assert(loginRes.body.user.role === 'ADMIN', 'Returned user has role ADMIN');
    assert(loginRes.body.user.password === undefined, 'Returned user does NOT contain password');

    const adminToken = loginRes.body.token;

    // 2. Valid Staff Login
    const staffLoginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'staff@aureliagrand.com',
      password: 'StaffPassword123!'
    });
    assert(staffLoginRes.status === 200 && staffLoginRes.body.user.role === 'STAFF', 'Staff account logs in successfully with role STAFF');

    // 3. Valid User/Guest Login
    const userLoginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'user@aureliagrand.com',
      password: 'UserPassword123!'
    });
    assert(userLoginRes.status === 200 && userLoginRes.body.user.role === 'USER', 'Guest user logs in successfully with role USER');

    // 4. Invalid Login
    const badLoginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@aureliagrand.com',
      password: 'WrongPassword'
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login with wrong password returns HTTP 401');
    assert(badLoginRes.body.success === false, 'Invalid credentials returns success: false');
    assert(badLoginRes.body.message === 'Invalid email or password', 'Message indicates "Invalid email or password"');

    // 5. Protected Endpoint GET /api/auth/me with Valid Token
    const meRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(meRes.status === 200 && meRes.body.user.email === 'admin@aureliagrand.com', 'Protected GET /api/auth/me succeeds with valid Bearer JWT');

    // 6. Protected Endpoint without Token
    const noTokenRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET'
    });
    assert(noTokenRes.status === 401, 'Protected GET /api/auth/me rejected with HTTP 401 when token is missing');

    // 7. Protected Endpoint with Tampered Token
    const tamperedRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}tampered` }
    });
    assert(tamperedRes.status === 401, 'Protected GET /api/auth/me rejected with HTTP 401 when token signature is tampered');

    // 8. Logout Endpoint
    const logoutRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/logout',
      method: 'POST'
    });
    assert(logoutRes.status === 200 && logoutRes.body.success === true, 'POST /api/auth/logout succeeds');

    // 9. Static File Serving (Existing Dashboard Preserved)
    const indexRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/',
      method: 'GET'
    });
    assert(indexRes.status === 200 && indexRes.body.includes('AURELIA GRAND'), 'Server serves existing dashboard index.html correctly');

    const cssRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/styles.css',
      method: 'GET'
    });
    assert(cssRes.status === 200 && cssRes.body.includes('.auth-view-container'), 'Server serves styles.css with auth styling');

    const jsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/app.js',
      method: 'GET'
    });
    assert(jsRes.status === 200 && jsRes.body.includes('AuthManager'), 'Server serves app.js with AuthManager logic');

    console.log(`\n===============================================================`);
    console.log(`  ALL ${passed} / ${total} TESTS PASSED SUCCESSFULLY!`);
    console.log(`===============================================================`);

  } finally {
    server.close();
    closeDatabase();
  }
}

runTestSuite().catch(err => {
  console.error('\n❌ Test suite failure:', err);
  process.exit(1);
});
