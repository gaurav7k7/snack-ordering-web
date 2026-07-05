import { Helmet } from 'react-helmet-async';

export default function AdminDashboardPage() {
  return (
    <section>
      <Helmet>
        <title>Admin Dashboard | SnackCo</title>
      </Helmet>
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </section>
  );
}
