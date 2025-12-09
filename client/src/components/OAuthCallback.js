import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const safeNavigate = (navigate, path) => {
    try {
        navigate(path, { replace: true });
    } catch (e) {
        console.warn('Navigate failed, trying location.replace', e);
        try {
            window.location.replace(path);
        } catch (e2) {
            console.warn('Location.replace failed, trying location.href', e2);
            try {
                window.location.href = path;
            } catch (e3) {
                console.error('All navigation attempts failed', e3);
            }
        }
    }
};

const OAuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processLogin = () => {
        const token = searchParams.get('token');
        if (!token) {
            safeNavigate(navigate, '/');
            return;
        }

        // Try to save token
        try {
            localStorage.setItem('token', token);
        } catch (e) {
            console.warn('LocalStorage access denied:', e);
        }

        // Try to decode and login
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (onLogin) {
                onLogin(payload);
            }
            
            const targetPath = (payload.isAdmin || payload.role === 'admin') ? '/manager' : '/cashier';
            safeNavigate(navigate, targetPath);
        } catch (e) {
            console.error('Error processing token:', e);
            safeNavigate(navigate, '/');
        }
    };

    processLogin();
  }, [searchParams, navigate, onLogin]);

  return <div>Processing login...</div>;
};

export default OAuthCallback;
