import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useResendVerificationMutation, useVerifyEmailMutation } from '@/redux/api/authApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current || !token || !email) return;
    hasRequested.current = true;
    verifyEmail({ token, email });
  }, [token, email, verifyEmail]);

  const handleResend = async () => {
    try {
      await resendVerification({ email }).unwrap();
    } catch {
      // Error toast not needed here — the page below already shows the failure state.
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Verify your email | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        {!token || !email ? (
          <>
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black">Missing verification link</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link is incomplete. Please open the verification link from your email again.
            </p>
          </>
        ) : isLoading ? (
          <>
            <Mail className="mx-auto h-12 w-12 animate-pulse text-primary" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black">Verifying your email…</h1>
            <p className="mt-2 text-sm text-muted-foreground">This will only take a moment.</p>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black">Email verified!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your email address is confirmed. You're all set to start ordering.
            </p>
            <Button asChild className="mt-6">
              <Link to={ROUTES.home}>Continue to SnackCo</Link>
            </Button>
          </>
        ) : isError ? (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {getErrorMessage(error, 'This link is invalid or has expired.')}
            </p>
            <Button className="mt-6" onClick={handleResend} disabled={isResending}>
              {isResending ? 'Sending…' : 'Resend verification email'}
            </Button>
          </>
        ) : null}
      </section>
    </main>
  );
}
