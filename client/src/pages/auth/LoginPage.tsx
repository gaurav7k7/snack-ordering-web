import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useLoginMutation } from '@/redux/api/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { loginSchema, type LoginInput } from '@/validation/auth.schema';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  const [login, { data, error, isLoading, isSuccess }] = useLoginMutation();
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
      toast.error(getErrorMessage(error, 'Login failed.'));
    }
  }, [data, dispatch, error, isSuccess, navigate]);

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
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit((values) => login(values))}>
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
