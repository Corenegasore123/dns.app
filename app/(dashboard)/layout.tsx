import { getMe, getStats } from '@/lib/api';
import { siteUrl } from '@/lib/config';
import DashboardShell from '../components/DashboardShell';

// Every dashboard page talks to the API with the admin's token: never prerender
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [admin, stats] = await Promise.all([getMe(), getStats()]);

  return (
    <DashboardShell admin={admin} unreadMessages={stats.unreadMessages} siteUrl={siteUrl()}>
      {children}
    </DashboardShell>
  );
}
