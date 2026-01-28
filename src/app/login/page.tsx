import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Guardianship',
  description: 'Sign in to your Guardianship account',
};

export default function LoginPage() {
  return <LoginForm />;
}
