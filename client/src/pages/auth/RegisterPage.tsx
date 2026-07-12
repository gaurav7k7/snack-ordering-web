import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useRegisterMutation } from '@/redux/api/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { registerSchema, type RegisterFormInput } from '@/validation/auth.schema';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  const [register, { data, error, isLoading, isSuccess }] = useRegisterMutation();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isSuccess && data?.data?.user) {
      dispatch(setUser(data.data.user));
      toast.success('Welcome aboard!');
      navigate(ROUTES.home, { replace: true });
    }

    if (error) {
      toast.error(getErrorMessage(error, 'Registration failed.'));
    }
  }, [data, dispatch, error, isSuccess, navigate]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  const onSubmit = async (values: RegisterFormInput) => {
    const { confirmPassword, ...payload } = values;
    await register(payload);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Helmet>
        <title>Create account | SnackCo</title>
      </Helmet>
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-black">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign up to save favorites, order faster, and track your snacks.
        </p>

        <div className="mt-6 grid gap-3">
          <GoogleSignInButton />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2 text-sm">
            <span>Name</span>
            <Input {...registerField('name')} />
            {errors.name && <span className="text-sm text-destructive">{errors.name.message}</span>}
          </label>
          <label className="grid gap-2 text-sm">
            <span>Email address</span>
            <Input type="email" {...registerField('email')} />
            {errors.email && (
              <span className="text-sm text-destructive">{errors.email.message}</span>
            )}
          </label>
          <label className="grid gap-2 text-sm">
            <span>Password</span>
            <Input type="password" {...registerField('password')} />
            {errors.password && (
              <span className="text-sm text-destructive">{errors.password.message}</span>
            )}
          </label>
          <label className="grid gap-2 text-sm">
            <span>Confirm password</span>
            <Input type="password" {...registerField('confirmPassword')} />
            {errors.confirmPassword && (
              <span className="text-sm text-destructive">{errors.confirmPassword.message}</span>
            )}
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              {...registerField('rememberMe')}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            Remember me for 30 days
          </label>
          <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
