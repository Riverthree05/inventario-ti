const request = require('supertest');

// Mock auth middleware before requiring the app
jest.mock('../src/middleware/autenticacion', () => ({
  verificarToken: (req, res, next) => next(),
  verificarAdmin: (req, res, next) => next()
}));

// Mock DB pool
const mockQuery = jest.fn();
jest.mock('../src/config/database', () => {
  return {
    query: (...args) => mockQuery(...args)
  };
});

const app = require('../server');

describe('POST /api/activos', () => {
  beforeEach(() => mockQuery.mockReset());

  test('rejects payloads that include bitlocker_recovery_key at validation layer', async () => {
    const payload = {
      nombre: 'Laptop Test',
      numero_serie: 'SN123',
      especificaciones: {
        cpu: 'Intel',
        ram: '8GB',
        bitlocker_recovery_key: 'SECRET-KEY-XYZ'
      }
    };

    const res = await request(app).post('/api/activos').send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    const err = res.body.errors.find(e => e.param === 'especificaciones' || e.path === 'especificaciones');
    expect(err).toBeTruthy();
  });

  test('accepts payload without recovery key and inserts', async () => {
    // Mock insert result
    mockQuery.mockImplementationOnce((sql, data) => Promise.resolve([{ insertId: 123 }]));

    const payload = {
      nombre: 'Laptop Test',
      numero_serie: 'SN124',
      especificaciones: {
        cpu: 'Intel',
        ram: '8GB'
      }
    };

    const res = await request(app).post('/api/activos').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 123);
    const insertCall = mockQuery.mock.calls[0];
    const dataSent = insertCall[1];
    const specsStored = JSON.parse(dataSent.especificaciones);
    expect(specsStored).toHaveProperty('cpu', 'Intel');
  });
});
