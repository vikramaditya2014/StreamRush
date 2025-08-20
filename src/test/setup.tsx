import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock React Player
vi.mock('react-player', () => ({
  default: ({ url, ...props }: any) => (
    <div data-testid="react-player" data-url={url} {...props}>
      Mock Video Player
    </div>
  ),
}));