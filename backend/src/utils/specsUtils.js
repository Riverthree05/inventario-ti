// Utilities para saneamiento y normalización de 'especificaciones'
// Convert to snake_case while handling all-caps acronyms correctly
const toSnake = (s = '') => {
  const str = String(s).trim();
  // Insert underscore between lower-to-upper transitions
  const withSep = str.replace(/([a-z0-9])([A-Z])/g, '$1_$2');
  // Replace non-alphanumeric with underscore
  const cleaned = withSep.replace(/[^0-9a-zA-Z]+/g, '_');
  return cleaned.replace(/^_+|_+$/g, '').toLowerCase();
};

const isSensitiveKey = (k) => {
  if (!k) return false;
  const lk = String(k).toLowerCase();
  return lk.includes('bitlocker_recovery_key') || lk.includes('recovery_key') || lk.includes('password') || lk.includes('secret');
};

const MAX_KEY_LENGTH = 64;
const MAX_STRING_LENGTH = 1024; // reasonable upper bound for spec values
const MAX_ARRAY_ITEMS = 200;

// Returns { value, warnings } structure for nested sanitation
function sanitizeValue(value, warnings = [], path = '') {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > MAX_STRING_LENGTH) {
      const truncated = trimmed.slice(0, MAX_STRING_LENGTH);
      const msg = { type: 'truncated_string', path, originalLength: trimmed.length, limit: MAX_STRING_LENGTH };
      warnings.push(msg);
      const logger = require('./logger');
      logger.warn(msg);
      return truncated;
    }
    return trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const arr = value.slice(0, MAX_ARRAY_ITEMS).map((v, i) => sanitizeValue(v, warnings, `${path}[${i}]`));
    if (value.length > MAX_ARRAY_ITEMS) {
      const msg = { type: 'array_truncated', path, originalLength: value.length, limit: MAX_ARRAY_ITEMS };
      warnings.push(msg);
      const logger = require('./logger');
      logger.warn(msg);
    }
    return arr;
  }
  if (typeof value === 'object') {
    return sanitizeObject(value, warnings, path);
  }
  // fallback to string
  const s = String(value);
  if (s.length > MAX_STRING_LENGTH) {
    const truncated = s.slice(0, MAX_STRING_LENGTH);
    const msg = { type: 'truncated_string', path, originalLength: s.length, limit: MAX_STRING_LENGTH };
    warnings.push(msg);
    console.warn(JSON.stringify(msg));
    return truncated;
  }
  return s;
}

function sanitizeObject(obj, warnings = [], path = '') {
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map((v, i) => sanitizeValue(v, warnings, `${path}[${i}]`)).slice(0, MAX_ARRAY_ITEMS);
  if (typeof obj !== 'object') return sanitizeValue(obj, warnings, path);

  const out = {};
  Object.keys(obj).forEach(k => {
    if (isSensitiveKey(k)) {
      const msg = { type: 'dropped_sensitive_key', path: path ? `${path}.${k}` : k };
      warnings.push(msg);
      const logger = require('./logger');
      logger.warn(msg);
      return; // drop sensitive keys entirely
    }
    const nk = toSnake(k).slice(0, MAX_KEY_LENGTH);
    if (nk.length < 1) return;
    out[nk] = sanitizeValue(obj[k], warnings, path ? `${path}.${nk}` : nk);
  });
  return out;
}

module.exports = {
  toSnake,
  isSensitiveKey,
  sanitizeValue,
  sanitizeObject,
  MAX_STRING_LENGTH,
  MAX_KEY_LENGTH
};
