const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Minimal schemas for common categories. Keep them permissive but with useful constraints.
const laptopSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    cpu: { type: 'string', minLength: 1 },
    ram: { type: 'string', minLength: 1 },
    disco_duro: { type: 'string', minLength: 1 },
    service_tag: { type: 'string' },
    // We explicitly do NOT include bitlocker_recovery_key here
  },
  required: ['cpu', 'ram']
};

const switchSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    numero_puertos: { type: ['number', 'integer', 'string'] },
    modelo: { type: 'string' }
  },
  required: ['numero_puertos']
};

const yubikeySchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    gid: { type: 'string', minLength: 1 }
  },
  required: ['gid']
};

const desktopSchema = Object.assign({}, laptopSchema);

const monitorSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    resolution: { type: 'string' },
    size_inches: { type: ['number', 'string'] },
    modelo: { type: 'string' }
  },
  required: []
};

const routerSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    firmware: { type: 'string' },
    numero_puertos: { type: ['number', 'integer', 'string'] },
    mac: { type: 'string' }
  },
  required: []
};

const phoneSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    imei: { type: 'string' },
    mac: { type: 'string' },
    modelo: { type: 'string' }
  },
  required: []
};

const printerSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    ppm: { type: ['number', 'string'] },
    modelo: { type: 'string' }
  },
  required: []
};

const validateLaptop = ajv.compile(laptopSchema);
const validateSwitch = ajv.compile(switchSchema);
const validateYubi = ajv.compile(yubikeySchema);
const validateDesktop = ajv.compile(desktopSchema);
const validateMonitor = ajv.compile(monitorSchema);
const validateRouter = ajv.compile(routerSchema);
const validatePhone = ajv.compile(phoneSchema);
const validatePrinter = ajv.compile(printerSchema);

// Heuristic to pick a schema based on common keys
function pickAndValidate(obj, categoriaNombre = null) {
  if (!obj || typeof obj !== 'object') return null;

  // If category name provided, try to match exact schema names (case-insensitive)
  if (categoriaNombre && typeof categoriaNombre === 'string') {
    const nombre = categoriaNombre.toLowerCase();
    if (nombre.includes('laptop') || nombre.includes('pc') || nombre.includes('servidor')) {
      const valid = validateLaptop(obj);
      return valid ? null : { schema: 'Laptop/PC', errors: validateLaptop.errors };
    }
    if (nombre.includes('escritorio') || nombre.includes('desktop')) {
      const valid = validateDesktop(obj);
      return valid ? null : { schema: 'Desktop', errors: validateDesktop.errors };
    }
    if (nombre.includes('switch')) {
      const valid = validateSwitch(obj);
      return valid ? null : { schema: 'Switch', errors: validateSwitch.errors };
    }
    if (nombre.includes('yubikey')) {
      const valid = validateYubi(obj);
      return valid ? null : { schema: 'YubiKey', errors: validateYubi.errors };
    }
    if (nombre.includes('monitor')) {
      const valid = validateMonitor(obj);
      return valid ? null : { schema: 'Monitor', errors: validateMonitor.errors };
    }
    if (nombre.includes('router') || nombre.includes('enrutador')) {
      const valid = validateRouter(obj);
      return valid ? null : { schema: 'Router', errors: validateRouter.errors };
    }
    if (nombre.includes('phone') || nombre.includes('teléfono') || nombre.includes('telefono')) {
      const valid = validatePhone(obj);
      return valid ? null : { schema: 'Phone', errors: validatePhone.errors };
    }
    if (nombre.includes('printer') || nombre.includes('impresora')) {
      const valid = validatePrinter(obj);
      return valid ? null : { schema: 'Printer', errors: validatePrinter.errors };
    }
  }

  // Fallback to heuristic by keys
  if (obj.cpu || obj.ram || obj.disco_duro || obj.service_tag) {
    const valid = validateLaptop(obj);
    return valid ? null : { schema: 'Laptop/PC', errors: validateLaptop.errors };
  }

  if (obj.imei) {
    const valid = validatePhone(obj);
    return valid ? null : { schema: 'Phone', errors: validatePhone.errors };
  }

  if (obj.resolution || obj.size_inches) {
    const valid = validateMonitor(obj);
    return valid ? null : { schema: 'Monitor', errors: validateMonitor.errors };
  }

  if (obj.numero_puertos) {
    const valid = validateSwitch(obj);
    return valid ? null : { schema: 'Switch', errors: validateSwitch.errors };
  }

  if (obj.gid) {
    const valid = validateYubi(obj);
    return valid ? null : { schema: 'YubiKey', errors: validateYubi.errors };
  }

  // Unknown shape: accept but do not run schema validation
  return null;
}

module.exports = {
  pickAndValidate
};
