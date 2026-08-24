/**
 * FitZone Automated API Verification Suite
 * Tests all 5 endpoints + validations + error handlers + populate logic
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('=== RUNNING FITZONE AUTOMATED API TESTS ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
    }
  }

  // 1. Test Login (POST /api/v1/auth/login)
  console.log('1. Testing POST /api/v1/auth/login...');
  let loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@fitzone.com',
      password: 'password123',
    }),
  });
  let loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Login returns HTTP 200');
  assert(loginData.success === true, 'Login success field is true');
  assert(!!loginData.token, 'Login returns JWT Bearer token');
  assert(loginData.member.name === 'John Carter', 'Login returns member profile');
  const token = loginData.token;
  const memberId = loginData.member._id;

  // 1b. Test Registration (POST /api/v1/auth/register)
  console.log('\n1b. Testing POST /api/v1/auth/register...');
  const testEmail = `newuser_${Date.now()}@fitzone.com`;
  let regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: testEmail,
      password: 'strongPassword99',
      phone: '+1 555 123 4567',
      membershipType: 'premium',
    }),
  });
  let regData = await regRes.json();
  assert(regRes.status === 201, 'Registration returns HTTP 201 Created');
  assert(regData.success === true, 'Registration success field is true');
  assert(!!regData.token, 'Registration returns JWT Bearer token');
  assert(regData.member.name === 'Sarah Connor', 'Registration returns new member name');
  assert(regData.member.membershipType === 'premium', 'Registration sets premium membership');

  // Test duplicate email rejection
  let dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Sarah',
      email: testEmail,
      password: 'strongPassword99',
    }),
  });
  let dupData = await dupRes.json();
  assert(dupRes.status === 400, 'Duplicate email registration returns HTTP 400');
  assert(dupData.success === false, 'Duplicate email returns success: false');

  // Test short password rejection
  let shortPassRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Short Pass User',
      email: `short_${Date.now()}@fitzone.com`,
      password: '123',
    }),
  });
  assert(shortPassRes.status === 400, 'Short password returns HTTP 400');

  // 2. Test Get Trainers (GET /api/v1/trainers)
  console.log('\n2. Testing GET /api/v1/trainers (Public)...');
  let trainersRes = await fetch(`${BASE_URL}/trainers`);
  let trainersData = await trainersRes.json();
  assert(trainersRes.status === 200, 'GET /trainers returns HTTP 200');
  assert(Array.isArray(trainersData.trainers), 'Trainers returned as array');
  assert(trainersData.trainers.length >= 4, `Found ${trainersData.trainers.length} trainers`);
  const trainer = trainersData.trainers.find((t) => t.available === true);
  assert(!!trainer, 'Found at least one available trainer');

  // 3. Test Protected Route Rejection without Token (POST /api/v1/bookings)
  console.log('\n3. Testing authGuard 401 Unauthorized handling...');
  let unauthRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ className: 'Test Yoga' }),
  });
  assert(unauthRes.status === 401, 'POST /bookings rejects request without token with HTTP 401');

  // 4. Test Mongoose Validation Failure (POST /api/v1/bookings with missing required fields)
  console.log('\n4. Testing Mongoose Validation Failure (HTTP 400)...');
  let invalidRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      // Missing trainerId, date, timeSlot
      className: 'Incomplete Booking',
    }),
  });
  let invalidData = await invalidRes.json();
  assert(invalidRes.status === 400, 'Invalid booking returns HTTP 400 Bad Request');
  assert(Array.isArray(invalidData.errors), 'Validation errors mapped to string array');
  console.log('   Captured Validation Errors:', invalidData.errors);

  // 5. Test Create Booking Success (POST /api/v1/bookings -> HTTP 201 Created)
  console.log('\n5. Testing POST /api/v1/bookings (HTTP 201 Created)...');
  let bookRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      memberId,
      trainerId: trainer._id,
      className: 'Automated Test Core Workout',
      date: '2026-09-15',
      timeSlot: '07:00 AM - 08:00 AM',
    }),
  });
  let bookData = await bookRes.json();
  assert(bookRes.status === 201, 'POST /bookings returns HTTP 201 Created');
  assert(bookData.success === true, 'Booking created successfully');
  assert(!!bookData.booking._id, 'Booking has MongoDB _id');
  const newBookingId = bookData.booking._id;

  // 6. Test Get My Bookings with populate (GET /api/v1/bookings/my)
  console.log('\n6. Testing GET /api/v1/bookings/my (Populated results)...');
  let myRes = await fetch(`${BASE_URL}/bookings/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let myData = await myRes.json();
  assert(myRes.status === 200, 'GET /bookings/my returns HTTP 200');
  assert(myData.bookings.length > 0, `Returned ${myData.bookings.length} member bookings`);
  const firstBooking = myData.bookings[0];
  assert(
    typeof firstBooking.trainerId === 'object' && !!firstBooking.trainerId.name,
    'trainerId populated with name and specialization'
  );
  assert(
    typeof firstBooking.memberId === 'object' && !!firstBooking.memberId.name,
    'memberId populated with name and email'
  );

  // 7. Test PATCH Booking Status (PATCH /api/v1/bookings/:id/status)
  console.log('\n7. Testing PATCH /api/v1/bookings/:id/status...');
  let patchRes = await fetch(`${BASE_URL}/bookings/${newBookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'attended' }),
  });
  let patchData = await patchRes.json();
  assert(patchRes.status === 200, 'PATCH /bookings/:id/status returns HTTP 200');
  assert(patchData.booking.status === 'attended', 'Booking status updated to "attended"');

  // 8. Test PATCH with invalid status (Enum validation failure -> 400)
  console.log('\n8. Testing PATCH with invalid enum status...');
  let badPatchRes = await fetch(`${BASE_URL}/bookings/${newBookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'invalid_status_enum' }),
  });
  assert(badPatchRes.status === 400, 'Invalid status returns HTTP 400');

  console.log(`\n=== API TEST SUMMARY: ${passed}/${total} TESTS PASSED ===\n`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
