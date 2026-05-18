import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const { signOut } = useAuth();

  return (
    <header className="bg-header text-header-foreground px-6 py-4 flex items-center justify-between shadow-md">
      <Link
        to="/"
        className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity text-header-foreground"
      >
        Cabin Connect
      </Link>
      <Button
        variant="ghost"
        onClick={signOut}
        className="text-header-foreground hover:bg-header-foreground/10 hover:text-header-foreground font-medium"
      >
        Sign out
      </Button>
    </header>
  );
}
