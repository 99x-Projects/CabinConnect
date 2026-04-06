'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: number;
}

interface SidebarProps {
  pendingSuppliers?: number;
}

export default function Sidebar({ pendingSuppliers = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/suppliers', icon: '🏭', label: 'Suppliers', badge: pendingSuppliers || undefined },
    { href: '/events', icon: '📅', label: 'Events' },
    { href: '/users', icon: '👥', label: 'Users' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Cabin<span>Connect</span>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 400 }}>Admin Panel</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
