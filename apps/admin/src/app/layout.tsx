import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';
import { getDashboardStats } from '../lib/api';

export const metadata: Metadata = {
  title: 'CabinConnect Admin',
  description: 'Admin panel for CabinConnect',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stats = await getDashboardStats().catch(() => ({ pendingSuppliers: 0, upcomingEvents: 0, totalUsers: 0, pendingBorrows: 0 }));

  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar pendingSuppliers={stats.pendingSuppliers} />
          <div className="main">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
