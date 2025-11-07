const React = require('react');

// Minimal manual mock for react-router-dom used in tests
module.exports = {
  BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  MemoryRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  Routes: ({ children }) => React.createElement(React.Fragment, null, children),
  Route: () => null,
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
  NavLink: ({ children }) => React.createElement(React.Fragment, null, children),
  Navigate: () => null,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => () => {},
  useParams: () => ({}),
};
