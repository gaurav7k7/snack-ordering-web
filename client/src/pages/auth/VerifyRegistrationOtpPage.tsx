import { MailCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import { useResendRegistrationOtpMutation, useVerifyRegistrationOtpMutation } from '@/redux/api/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';

const RESEND_COOLDOWN_SECONDS = 30;

type LocationState = { email?: string; rememberMe?: boolean } | null;

export default function VerifyRegistrationOtpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const email = state?.email ?? '';
  const rememberMe = state?.rememberMe ?? false;

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyRegistrationOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendRegistrationOtpMutation();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await verifyOtp({ email, otp, rememberMe }).unwrap();
      if (result.data?.user) dispatch(setUser(result.data.user));
      toast.success('Email verified. Welcome to SnackCo!');
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'That code is invalid or expired.'));
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success('A new code has been sent to your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to resend the code right now.'));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Verify your email | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <MailCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black">Verify your email</h1>

        {!email ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't find a pending verification. Please create an account first.
            </p>
            <Button asChild className="mt-6">
              <Link to={ROUTES.register}>Create account</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. Enter it
              below to activate your account.
            </p>
            <form className="mt-6 grid gap-4 text-left" onSubmit={handleVerify}>
              <label className="grid gap-2 text-sm">
                <span>Verification code</span>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.3em]"
                />
              </label>
              <Button type="submit" className="w-full" disabled={isVerifying || otp.length !== 6}>
                {isVerifying ? 'Verifying…' : 'Verify & continue'}
              </Button>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className="text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
              >
                {cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : isResending
                    ? 'Sending…'
                    : "Didn't get a code? Resend"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
