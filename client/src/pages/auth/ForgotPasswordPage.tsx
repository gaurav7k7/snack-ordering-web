import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useForgotPasswordMutation } from '@/redux/api/authApi';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { forgotPasswordSchema, type ForgotPasswordFormInput } from '@/validation/auth.schema';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading, isSuccess, error }] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Reset instructions sent. Check your inbox.');
      navigate(ROUTES.login, { replace: true });
    }
    if (error) {
      toast.error(getErrorMessage(error, 'Unable to send reset instructions.'));
    }
  }, [error, isSuccess, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Forgot password | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we’ll send a secure reset link.
        </p>
        <form
          className="mt-8 grid gap-4"
          onSubmit={handleSubmit((values) => forgotPassword(values))}
        >
          <label className="grid gap-2 text-sm">
            <span>Email address</span>
            <Input type="email" {...register('email')} />
            {errors.email && (
              <span className="text-sm text-destructive">{errors.email.message}</span>
            )}
          </label>
          <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send reset link'}
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
