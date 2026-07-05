import { Helmet } from 'react-helmet-async';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Sign In | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-md rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
      </section>
    </main>
  );
}
