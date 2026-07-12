import { useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@/redux/api/authApi';
import { setUser } from '@/redux/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function OtpLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [requestOtp, { isLoading: isRequesting }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const handleRequest = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await requestOtp({ email }).unwrap();
      toast.success('Code sent. Check your inbox.');
      setStep('verify');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to send a code right now.'));
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await verifyOtp({ email, otp }).unwrap();
      if (result.data?.user) dispatch(setUser(result.data.user));
      toast.success('Welcome back!');
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'That code is invalid or expired.'));
    }
  };

  if (step === 'request') {
    return (
      <form className="grid gap-4" onSubmit={handleRequest}>
        <label className="grid gap-2 text-sm">
          <span>Email address</span>
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <Button type="submit" className="w-full" disabled={isRequesting}>
          {isRequesting ? 'Sending code…' : 'Send sign-in code'}
        </Button>
      </form>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleVerify}>
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>.
      </p>
      <label className="grid gap-2 text-sm">
        <span>Verification code</span>
        <Input
          inputMode="numeric"
          maxLength={6}
          required
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
          placeholder="123456"
        />
      </label>
      <Button type="submit" className="w-full" disabled={isVerifying || otp.length !== 6}>
        {isVerifying ? 'Verifying…' : 'Verify & sign in'}
      </Button>
      <button
        type="button"
        onClick={() => setStep('request')}
        className="text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Use a different email or resend the code
      </button>
    </form>
  );
}
