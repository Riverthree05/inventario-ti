const { sanitizeObject } = require('../src/utils/specsUtils');

describe('specsUtils.sanitizeObject', () => {
  test('removes sensitive keys and normalizes keys to snake_case', () => {
    const input = {
      CPU: 'Intel',
      Ram: '16GB',
      bitlocker_recovery_key: 'SECRET-KEY-1234',
      nested: { SomeKey: 'value' }
    };

    const warnings = [];
    const out = sanitizeObject(input, warnings);

    expect(out).toHaveProperty('cpu', 'Intel');
    expect(out).toHaveProperty('ram', '16GB');
    expect(out).toHaveProperty('nested');
    expect(out.nested).toHaveProperty('some_key', 'value');
    expect(out).not.toHaveProperty('bitlocker_recovery_key');
    // warnings should include dropped_sensitive_key
    const hasDropped = warnings.some(w => w.type === 'dropped_sensitive_key');
    expect(hasDropped).toBe(true);
  });

  test('truncates long strings and records warnings', () => {
    const long = 'a'.repeat(2000);
    const input = { comment: long };
    const warnings = [];
    const out = sanitizeObject(input, warnings);
    expect(out.comment.length).toBeLessThanOrEqual(1024);
    const hasTrunc = warnings.some(w => w.type === 'truncated_string');
    expect(hasTrunc).toBe(true);
  });
});
