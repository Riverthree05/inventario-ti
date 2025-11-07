import { render } from '@testing-library/react';
import App from './App';

test('renders App without crashing', () => {
  // Basic smoke test: render the App component to ensure it mounts
  render(<App />);
});
