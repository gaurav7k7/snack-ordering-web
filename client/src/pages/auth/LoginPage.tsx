import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { OtpLoginForm } from '@/components/auth/OtpLoginForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useLoginMutation } from '@/redux/api/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { getErrorCode, getErrorMessage } from '@/utils/getErrorMessage';
import { loginSchema, type LoginInput } from '@/validation/auth.schema';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authState = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [login, { data, error, isLoading, isSuccess }] = useLoginMutation();
  const loginEmailRef = useRef('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (isSuccess && data?.data?.user) {
      dispatch(setUser(data.data.user));
      toast.success('Welcome back!');
      navigate(ROUTES.home, { replace: true });
    }
    if (error) {
      if (getErrorCode(error) === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email to continue.');
        navigate(ROUTES.verifyRegistration, { state: { email: loginEmailRef.current } });
        return;
      }
      toast.error(getErrorMessage(error, 'Login failed.'));
    }
  }, [data, dispatch, error, isSuccess, navigate]);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'account-blocked') {
      toast.error('Your account has been blocked. Contact support if you believe this is a mistake.');
    } else if (oauthError === 'google-not-configured') {
      toast.error('Google sign-in is not available right now. Please use your email and password.');
    } else if (oauthError === 'google') {
      toast.error('Google sign-in failed. Please try again or use your email and password.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Sign in | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black">Sign in to SnackCo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your cart, orders, and saved favorites.
        </p>

        <div className="mt-6 grid gap-3">
          <GoogleSignInButton />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-6 inline-flex w-full rounded-lg border border-input p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 rounded-md py-2 font-semibold transition ${
              mode === 'password' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`flex-1 rounded-md py-2 font-semibold transition ${
              mode === 'otp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Email code
          </button>
        </div>

        {mode === 'password' ? (
          <form
            className="grid gap-4"
            onSubmit={handleSubmit((values) => {
              loginEmailRef.current = values.email;
              login(values);
            })}
          >
            <label className="grid gap-2 text-sm">
              <span>Email address</span>
              <Input type="email" {...register('email')} />
              {errors.email && (
                <span className="text-sm text-destructive">{errors.email.message}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm">
              <span>Password</span>
              <Input type="password" {...register('password')} />
              {errors.password && (
                <span className="text-sm text-destructive">{errors.password.message}</span>
              )}
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              Remember me
            </label>
            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <OtpLoginForm />
        )}

        <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Link to={ROUTES.forgotPassword} className="font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
          <span>
            New here?{' '}
            <Link to={ROUTES.register} className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </span>
        </div>
      </section>
    </main>
  );
}
