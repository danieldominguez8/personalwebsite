import { render, screen } from '@testing-library/react';
import App from './App';

test('renders intro heading and contact email', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /hello, i'm danny dominguez/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /dominguezdanieldev@gmail.com/i })).toBeInTheDocument();
});
