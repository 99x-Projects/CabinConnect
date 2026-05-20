import { CabinProfile } from './pages/CabinProfile';

// CabinConnect root component.
// For Bolt 1, the app mounts straight to the CabinProfile demonstrable.
// Routing arrives in Bolt 2+ when there's more than one screen.

export default function App() {
  return <CabinProfile />;
}
