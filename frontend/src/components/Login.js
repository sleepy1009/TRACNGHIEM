import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Link as MuiLink } from '@mui/material'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0); 
  const [isBlocked, setIsBlocked] = useState(false); 
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (searchParams.get('success') === 'registered') {
      setSuccessMessage('Registration successful! Please log in.');
      searchParams.delete('success');
      setSearchParams(searchParams);

    }
  }, [searchParams, setSearchParams]);
    useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const blockedUntil = localStorage.getItem('blockedUntil');

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }

    if (blockedUntil) {
      const now = new Date().getTime();
      if (now < parseInt(blockedUntil, 10)) {
        setIsBlocked(true);
      } else {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('blockedUntil');
        setIsBlocked(false);
        setLoginAttempts(0);
      }
    }
  }, []);

  const handleLogin = async () => {
    setError(''); 
    if (isBlocked) {
      setError('Too many login attempts. Please try again later.');
      return;
    }

    if (!username) {
      setError('Username cannot be blank.');
      return;
    }
    if (!password) {
      setError('Password cannot be blank.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const fetchUserResponse = await fetch('http://localhost:5000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${data.token}`, 
            },
        });
        if (!fetchUserResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchUserResponse.status}`);
        }
        const userData = await fetchUserResponse.json();
        login(data.token, userData.displayName);
        localStorage.setItem('displayName', userData.displayName);
        navigate(redirect);
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
      } else {
        if (data.message === 'Invalid credentials') {
          setError('Incorrect username or password.'); 
        } else {
          setError(data.message || 'Login failed');
        }


        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= 5) {
            setIsBlocked(true);
            const blockUntil = new Date().getTime() + (2 * 60 * 60 * 1000); 
            localStorage.setItem('blockedUntil', blockUntil.toString());
            setError('Too many login attempts. Please try again later.');
        }
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/google', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: credentialResponse.credential }), 
        });

        const data = await response.json();
        if (response.ok) {
            const fetchUserResponse = await fetch('http://localhost:5000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${data.token}`,
            },
        });
        if (!fetchUserResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchUserResponse.status}`);
        }
        const userData = await fetchUserResponse.json();
        login(data.token, userData.displayName); 
        localStorage.setItem('displayName', userData.displayName);
        navigate(redirect);
        } else {
             setError(data.message || 'Google login failed');
        }
    } catch (error) {
        console.error("Google login error:", error);
        setError('An error occurred during Google login');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4">Đăng nhập</Typography>
        {error && <Alert severity="error">{error}</Alert>} 
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        <Box component="form" mt={3} width="100%">
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Đăng nhập 
          </Button>

          <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                  console.log('Login Failed');
                  setError('Google login failed.');
              }}
          />
          <Box mt={2} textAlign="center">
            <MuiLink component={Link} to="/register" variant="body2">
              Chưa có tài khoản? Đăng ký tại đây.
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;