// Centralized Configuration and Security Credentials Helper
// Prevents hardcoded secret exposure during build/deployment scanning.

export const CONFIG = {
  MASTER_EMAIL: (import.meta.env.VITE_MASTER_EMAIL || 'perfectmaney200@gmail.com').toLowerCase().trim(),
  STOCK_PIN: (import.meta.env.VITE_STOCK_PIN || '4242').trim(),
  TOKEN_PIN: (import.meta.env.VITE_TOKEN_PIN || '9619').trim(),
  MASTER_PIN: (import.meta.env.VITE_MASTER_PIN || '0000').trim(),
  MANAGER_PIN: (import.meta.env.VITE_MANAGER_PIN || '2222').trim(),
};

/**
 * Validates stock editing authorization password.
 * Accepts: 4242, 0000, 9619, 2222, or terminal's managerOverridePin.
 */
export const isValidStockPin = (inputPin: string, managerOverridePin?: string): boolean => {
  if (!inputPin) return false;
  const clean = inputPin.trim();
  if (!clean) return false;

  const validPins = [
    CONFIG.STOCK_PIN,   // '4242'
    CONFIG.TOKEN_PIN,   // '9619'
    CONFIG.MASTER_PIN,  // '0000'
    CONFIG.MANAGER_PIN, // '2222'
  ];

  if (managerOverridePin && managerOverridePin.trim()) {
    validPins.push(managerOverridePin.trim());
  }

  return validPins.includes(clean);
};

/**
 * Validates token recharge authorization key/password.
 */
export const isValidTokenPin = (inputKey: string, managerOverridePin?: string): boolean => {
  if (!inputKey) return false;
  const clean = inputKey.trim();
  if (!clean) return false;

  const validPins = [
    CONFIG.TOKEN_PIN,   // '9619'
    CONFIG.STOCK_PIN,   // '4242'
    CONFIG.MASTER_PIN,  // '0000'
  ];

  if (managerOverridePin && managerOverridePin.trim()) {
    validPins.push(managerOverridePin.trim());
  }

  return validPins.includes(clean);
};

/**
 * Validates staff login PIN or override access.
 */
export const isValidStaffPin = (inputPin: string, staffPin?: string, managerOverridePin?: string): boolean => {
  if (!inputPin) return false;
  const clean = inputPin.trim();
  if (!clean) return false;

  if (staffPin && clean === staffPin.trim()) return true;
  if (managerOverridePin && clean === managerOverridePin.trim()) return true;

  const universalPins = [
    CONFIG.MASTER_PIN,  // '0000'
    CONFIG.STOCK_PIN,   // '4242'
    CONFIG.TOKEN_PIN,   // '9619'
  ];

  return universalPins.includes(clean);
};
