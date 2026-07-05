import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useResetPasswordMutation } from '@/redux/api/authApi';
import { resetPasswordSchema, type ResetPasswordFormInput } from '@/validation/auth.schema';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      token: searchParams.get('token') ?? '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Password reset successfully.');
      navigate(ROUTES.home, { replace: true });
    }
    if (error) {
      const message = (error as any)?.data?.message ?? 'Unable to reset password.';
      toast.error(message);
    }
  }, [error, isSuccess, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Reset password | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your new password to finish the reset.
        </p>
        <form
          className="mt-8 grid gap-4"
          onSubmit={handleSubmit((values) => resetPassword(values))}
        >
          <label className="grid gap-2 text-sm">
            <span>Email address</span>
            <input
              type="email"
              {...register('email')}
              readOnly
              className="rounded-xl border border-input bg-muted px-4 py-3 text-sm outline-none"
            />
            {errors.email && (
              <span className="text-sm text-destructive">{errors.email.message}</span>
            )}
          </label>
          <label className="grid gap-2 text-sm">
            <span>New password</span>
            <input
              type="password"
              {...register('password')}
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
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
            Keep me signed in
          </label>
          <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
