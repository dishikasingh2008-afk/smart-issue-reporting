import AdminDashboard from './AdminDashboard';

// The dashboard already contains the full analytics suite (cards + charts).
// This page is kept as a distinct route/nav entry per the sidebar spec while reusing the same view.
export default function AdminAnalyticsPage() {
  return <AdminDashboard />;
}
