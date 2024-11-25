import { render, screen } from '@testing-library/react';
import Recording from '../components/Recording';

test('renders the recording button', () => {
  render(<Recording />);
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});
