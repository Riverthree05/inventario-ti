// Minimal axios mock for Jest environment (commonjs)
module.exports = {
  create: function() {
    return {
      get: () => Promise.resolve({ data: {} }),
      post: () => Promise.resolve({ data: {} }),
      put: () => Promise.resolve({ data: {} }),
      delete: () => Promise.resolve({ data: {} }),
      interceptors: {
        request: { use: () => {} },
        response: { use: () => {} }
      }
    };
  },
};
