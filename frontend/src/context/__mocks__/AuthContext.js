const React = require('react');

// Minimal mock of AuthContext for tests
const AuthProvider = ({ children }) => React.createElement(React.Fragment, null, children);

const useAuth = () => ({ token: null, login: async () => true, logout: () => {} });

module.exports = { AuthProvider, useAuth };
