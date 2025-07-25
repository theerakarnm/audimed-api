import { useNavigate } from '@remix-run/react';
import { useToast } from '~/components/ui/use-toast';
import { LoginForm } from '~/components/login-form';
import { apiPost } from '~/libs/http';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async ({ username, password }: {
    username: string;
    password: string;
  }) => {
    try {
      const response = await apiPost<{
        accessToken: string;
        refreshToken: string;
      }>('/api/auth/login', { username, password });

      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast({ title: 'Login Successful' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Login Failed', description: 'Invalid credentials', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}
