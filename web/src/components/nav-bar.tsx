import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function NavBar() {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/cabins" className="text-lg font-semibold text-emerald-700 hover:text-emerald-800">
        CabinConnect
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/cabins/new"
          className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
        >
          + Register Cabin
        </Link>
        <button
          onClick={() => void handleSignOut()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
