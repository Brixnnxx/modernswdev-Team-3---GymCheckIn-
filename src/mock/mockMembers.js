// src/mock/mockMembers.js

// Deterministic-ish helper (so you can make lots of members fast)
function pad(n, size = 4) {
  return String(n).padStart(size, "0");
}

// Deterministic photo picker (some members get a photo, others don't)
// Uses a public placeholder image service that returns different faces.
function photoForMember(member_id) {
  // ~35% of members get a photo
  if (member_id % 3 !== 0) return "";

  // Use a stable seed so the same member always gets the same face
  // pravatar has 70 images (1..70)
  const imgId = ((member_id * 7) % 70) + 1;

  // Example: https://i.pravatar.cc/150?img=12
  return `https://i.pravatar.cc/150?img=${imgId}`;
}

function addDaysIso(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function makeMockMembers(count = 50) {
  const first = [
    "Jake", "Ava", "Mia", "Noah", "Liam", "Emma", "Olivia", "Sophia", "Lucas", "Mason",
    "Ethan", "Logan", "Ella", "Zoe", "Chloe", "Henry", "Amelia", "Isabella", "Jack", "Leo",
  ];
  const last = [
    "Riddle", "Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson",
    "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Lee",
  ];
  const cities = ["Little Rock", "Conway", "Benton", "Bryant", "Maumelle", "Sherwood"];

  // ✅ Add trial into weighted status choices (still mostly active)
  const statuses = ["active", "active", "active", "trial", "frozen", "inactive"];

  const members = [];
  for (let i = 1; i <= count; i++) {
    const fn = first[i % first.length];
    const ln = last[i % last.length];
    const member_id = i; // important: numeric id
    const member_code = `M-${pad(i, 5)}`; // e.g. M-00001

    const phone = `501-55${pad(i % 100, 2)}-${pad((i * 73) % 10000, 4)}`; // fake but consistent
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;

    const status = statuses[i % statuses.length];

    members.push({
      member_id,
      member_code,
      first_name: fn,
      last_name: ln,
      phone,
      email,
      status,
      city: cities[i % cities.length],

      // ✅ Some members have photos (deterministic)
      photo_url: photoForMember(member_id),

      // ✅ Trial members get trial_end (POS would normally set this)
      trial_end: status === "trial" ? addDaysIso((i % 7) + 1) : "",

      member_notes: i % 7 === 0 ? "Prefers mornings. Has knee history." : "",
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }

  // Add a few “special” edge-case records to test searching + trial behavior
  members.unshift(
    {
      member_id: 9991,
      member_code: "VIP-0001",
      first_name: "Ana-Maria",
      last_name: "O'Neil",
      phone: "501-123-4567",
      email: "ana.oneil@example.com",
      status: "active",
      photo_url: photoForMember(9991),
      member_notes: "Hyphen + apostrophe test",
      created_at: new Date().toISOString(),
    },
    {
      member_id: 9992,
      member_code: "TEST-EMAIL",
      first_name: "Casey",
      last_name: "McTest",
      phone: "",
      email: "CASEY@EXAMPLE.COM",
      status: "active",
      photo_url: "",
      member_notes: "Uppercase email test",
      created_at: new Date().toISOString(),
    },

    // ✅ Trial edge cases
    {
      member_id: 9993,
      member_code: "TRIAL-0001",
      first_name: "Tori",
      last_name: "Trial",
      phone: "501-555-0101",
      email: "tori.trial@example.com",
      status: "trial",
      city: "Little Rock",
      photo_url: photoForMember(9993),
      trial_end: addDaysIso(3),
      member_notes: "3-day trial (ends soon)",
      created_at: new Date().toISOString(),
    },
    {
      member_id: 9994,
      member_code: "TRIAL-0002",
      first_name: "Sam",
      last_name: "Sampler",
      phone: "501-555-0202",
      email: "sam.sampler@example.com",
      status: "trial",
      city: "Conway",
      photo_url: photoForMember(9994),
      trial_end: addDaysIso(7),
      member_notes: "7-day trial",
      created_at: new Date().toISOString(),
    },
    {
      member_id: 9995,
      member_code: "TRIAL-EXPIRED",
      first_name: "Eddie",
      last_name: "Expired",
      phone: "501-555-0303",
      email: "eddie.expired@example.com",
      status: "trial",
      city: "Benton",
      photo_url: photoForMember(9995),
      // expired yesterday (useful to test auto-inactive logic later)
      trial_end: new Date(Date.now() - 86400000).toISOString(),
      member_notes: "Trial already expired (yesterday)",
      created_at: new Date().toISOString(),
    }
  );

  return members;
}

// Default export: a ready-to-use list
const mockMembers = makeMockMembers(80);
export default mockMembers;