import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background p-6 lg:block">
        <p className="text-lg font-semibold">Snack Admin</p>
      </aside>
      <main className="min-h-screen p-6 lg:pl-72">
        <Outlet />
      </main>
    </div>
  );
}
