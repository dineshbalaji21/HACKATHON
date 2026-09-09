/**
 * GovAction AI — Auth Service
 * Centralised authentication logic. Ready to swap out localStorage calls
 * for real API calls when a backend is available.
 */

const USERS_KEY = 'govAction_users';
const SESSION_KEY = 'govAction_session';

// ─── ID Generators ───────────────────────────────────────────────────────────

function padded(n) {
  return String(n).padStart(4, '0');
}

function generateCitizenId(users) {
  const existing = users.filter(u => u.citizenId).length;
  return `CIT-${new Date().getFullYear()}-${padded(existing + 1)}`;
}

function generateOfficerId(users) {
  const existing = users.filter(u => u.officerId).length;
  return `OFF-${new Date().getFullYear()}-${padded(existing + 1)}`;
}

function generateHeadId(users) {
  const existing = users.filter(u => u.headId).length;
  return `HEAD-${new Date().getFullYear()}-${padded(existing + 1)}`;
}

function generateCollectorId(users) {
  const existing = users.filter(u => u.collectorId).length;
  return `COL-${new Date().getFullYear()}-${padded(existing + 1)}`;
}

function generateDeptId(deptName) {
  const abbr = deptName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  const num = Math.floor(Math.random() * 900) + 100;
  return `DPT-${abbr}-${num}`;
}

function generateInternalId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('LocalStorage session save failed:', err);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('LocalStorage clear session failed:', err);
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Register a new citizen.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function registerCitizen(data) {
  const { fullName, username, password, confirmPassword, phone, email, district, area, address } = data;

  if (!fullName || !username || !password || !phone || !district) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  const pwErr = validatePassword(password);
  if (pwErr) return { success: false, error: pwErr };

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const users = getStoredUsers();

  if (users.find(u => u.username === username.trim())) {
    return { success: false, error: 'Username already taken. Please choose another.' };
  }

  const citizenId = generateCitizenId(users);

  const newUser = {
    id: generateInternalId(),
    role: 'citizen',
    citizenId,
    name: fullName.trim(),
    username: username.trim(),
    password,
    phone: phone.trim(),
    email: email?.trim() || '',
    district: district.trim(),
    area: area?.trim() || '',
    address: address?.trim() || '',
    status: 'active',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  saveUsers([...users, newUser]);
  return { success: true, user: newUser, citizenId };
}

/**
 * Register a new field officer.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function registerOfficer(data) {
  const {
    fullName, employeeId, username, password, confirmPassword,
    designation, departmentName, district, office, phone, email,
  } = data;

  if (!fullName || !employeeId || !username || !password || !departmentName || !district) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  const pwErr = validatePassword(password);
  if (pwErr) return { success: false, error: pwErr };

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const users = getStoredUsers();

  if (users.find(u => u.username === username.trim())) {
    return { success: false, error: 'Username already taken.' };
  }
  if (users.find(u => u.employeeId === employeeId.trim())) {
    return { success: false, error: 'Employee ID already registered.' };
  }

  const officerId = generateOfficerId(users);
  const departmentId = generateDeptId(departmentName);

  const newUser = {
    id: generateInternalId(),
    role: 'officer',
    officerId,
    employeeId: employeeId.trim(),
    name: fullName.trim(),
    username: username.trim(),
    password,
    designation: designation?.trim() || 'Field Officer',
    departmentName: departmentName.trim(),
    departmentId,
    district: district.trim(),
    office: office?.trim() || '',
    phone: phone?.trim() || '',
    email: email?.trim() || '',
    status: 'active',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  saveUsers([...users, newUser]);
  return { success: true, user: newUser, officerId };
}

/**
 * Register a new department head.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function registerDeptHead(data) {
  const {
    fullName, username, password, confirmPassword,
    designation, departmentName, departmentId: suppliedDeptId,
    district, office, phone, email,
  } = data;

  if (!fullName || !username || !password || !departmentName || !district) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  const pwErr = validatePassword(password);
  if (pwErr) return { success: false, error: pwErr };

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const users = getStoredUsers();

  if (users.find(u => u.username === username.trim())) {
    return { success: false, error: 'Username already taken.' };
  }

  const headId = generateHeadId(users);
  const departmentId = suppliedDeptId?.trim() || generateDeptId(departmentName);

  const newUser = {
    id: generateInternalId(),
    role: 'department_head',
    headId,
    name: fullName.trim(),
    username: username.trim(),
    password,
    designation: designation?.trim() || 'Department Head',
    departmentName: departmentName.trim(),
    departmentId,
    district: district.trim(),
    office: office?.trim() || '',
    phone: phone?.trim() || '',
    email: email?.trim() || '',
    status: 'active',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  saveUsers([...users, newUser]);
  return { success: true, user: newUser, headId };
}

/**
 * Register a new district collector.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function registerCollector(data) {
  const {
    fullName, username, password, confirmPassword,
    designation, district, collectorateOffice, phone, email, verificationPin,
  } = data;

  if (!fullName || !username || !password || !district || !verificationPin) {
    return { success: false, error: 'Please fill in all required fields including the verification PIN.' };
  }

  if (verificationPin.length < 4) {
    return { success: false, error: 'Verification PIN must be at least 4 characters.' };
  }

  const pwErr = validatePassword(password);
  if (pwErr) return { success: false, error: pwErr };

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const users = getStoredUsers();

  if (users.find(u => u.username === username.trim())) {
    return { success: false, error: 'Username already taken.' };
  }

  const collectorId = generateCollectorId(users);

  const newUser = {
    id: generateInternalId(),
    role: 'district_collector',
    collectorId,
    name: fullName.trim(),
    username: username.trim(),
    password,
    verificationPin: verificationPin.trim(),
    designation: designation?.trim() || 'District Collector',
    district: district.trim(),
    office: collectorateOffice?.trim() || '',
    phone: phone?.trim() || '',
    email: email?.trim() || '',
    status: 'active',
    assignedDate: new Date().toISOString().split('T')[0],
  };

  saveUsers([...users, newUser]);
  return { success: true, user: newUser, collectorId };
}

// ─── Login ────────────────────────────────────────────────────────────────────

const GENERIC_ERROR = 'Unable to sign in. Please check your credentials and try again.';

/**
 * Login a citizen.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function loginCitizen({ identifier, password }) {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter your Citizen ID or username and password.' };
  }

  const users = getStoredUsers();
  const user = users.find(
    u => u.role === 'citizen' &&
      (u.username === identifier.trim() || u.citizenId === identifier.trim())
  );

  if (!user || user.password !== password) {
    return { success: false, error: GENERIC_ERROR };
  }

  setSession(user);
  return { success: true, user };
}

/**
 * Login an officer.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function loginOfficer({ identifier, password, departmentName }) {
  if (!identifier || !password || !departmentName) {
    return { success: false, error: 'Please fill in all fields including your department.' };
  }

  const users = getStoredUsers();
  const user = users.find(
    u => u.role === 'officer' &&
      (u.username === identifier.trim() || u.employeeId === identifier.trim()) &&
      u.departmentName === departmentName
  );

  if (!user || user.password !== password) {
    return { success: false, error: GENERIC_ERROR };
  }

  setSession(user);
  return { success: true, user };
}

/**
 * Login a department head.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function loginDeptHead({ identifier, password, departmentName, district }) {
  if (!identifier || !password || !departmentName || !district) {
    return { success: false, error: 'Please fill in all fields.' };
  }

  const users = getStoredUsers();
  const user = users.find(
    u => u.role === 'department_head' &&
      (u.username === identifier.trim() || u.headId === identifier.trim()) &&
      u.departmentName === departmentName &&
      u.district === district.trim()
  );

  if (!user || user.password !== password) {
    return { success: false, error: GENERIC_ERROR };
  }

  setSession(user);
  return { success: true, user };
}

/**
 * Login a district collector.
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function loginCollector({ identifier, password, district, verificationPin }) {
  if (!identifier || !password || !district || !verificationPin) {
    return { success: false, error: 'Please fill in all fields including the verification PIN.' };
  }

  const users = getStoredUsers();
  const user = users.find(
    u => u.role === 'district_collector' &&
      (u.username === identifier.trim() || u.collectorId === identifier.trim()) &&
      u.district === district.trim()
  );

  if (!user || user.password !== password || user.verificationPin !== verificationPin.trim()) {
    return { success: false, error: GENERIC_ERROR };
  }

  setSession(user);
  return { success: true, user };
}

// ─── User Sync ────────────────────────────────────────────────────────────────

/**
 * Update a user record in localStorage and return the updated user.
 * Used to sync currentUser when application state changes.
 */
export function updateStoredUser(updatedUser) {
  const users = getStoredUsers();
  const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
  saveUsers(newUsers);
  // Also update session if this is the logged-in user
  const session = getSession();
  if (session && session.id === updatedUser.id) {
    setSession(updatedUser);
  }
  return updatedUser;
}
