import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './button';
import { FcGoogle } from 'react-icons/fc';
import { RouteIndex } from '@/helpers/RouteName';
import { showToast } from '@/helpers/showToast';
import { getEnv } from '@/helpers/getEnv';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/user/user.slice';

const GoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user profile from Google using the access token
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!profileRes.ok) {
          return showToast('error', 'Failed to fetch Google profile.');
        }

        const profile = await profileRes.json();

        // Send name, email, avatar to our backend
        const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            avatar: profile.picture,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return showToast('error', data.message);
        }

        dispatch(setUser(data.user));
        localStorage.setItem('token', data.token);
        navigate(RouteIndex);
        showToast('success', data.message);
      } catch (error) {
        showToast('error', error.message || 'Google login failed.');
      }
    },
    onError: () => {
      showToast('error', 'Google sign-in was cancelled or failed.');
    },
  });

  return (
    <Button
      variant="outline"
      className="w-full cursor-pointer flex items-center gap-2"
      onClick={() => handleLogin()}
      type="button"
    >
      <FcGoogle className="text-xl" />
      Continue with Google
    </Button>
  );
};

export default GoogleLogin;
