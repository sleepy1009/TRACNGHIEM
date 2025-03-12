import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Link as MuiLink} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(''); 

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
        let errorMessage = "Password must contain at least:";
        if (!hasUpperCase) errorMessage += " one uppercase letter,";
        if (!hasLowerCase) errorMessage += " one lowercase letter,";
        if (!hasNumber) errorMessage += " one number,";
        if (!hasSpecialChar) errorMessage += " one special character,";

        errorMessage = errorMessage.slice(0, -1) + ".";
        setError(errorMessage);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('displayName', username);
        navigate('/login?success=registered'); 
      } else {
        if (data.errors) {
          setError(data.errors.join(' ')); 
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4">Đăng ký</Typography>
        {error && <Alert severity="error">{error}</Alert>}
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRegister}
          >
            Đăng ký 
          </Button>
          <Box mt={2} textAlign="center">
            <MuiLink component={Link} to="/login" variant="body2">
              Đã có tài khoản? Đăng nhập tại đây.
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;