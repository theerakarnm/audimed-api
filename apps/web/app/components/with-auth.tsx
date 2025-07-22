import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';

export function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const navigate = useNavigate();

    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
      }
    }, [navigate]);

    return <Component {...props} />;
  };
}
