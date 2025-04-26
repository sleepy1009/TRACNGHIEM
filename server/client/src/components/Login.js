import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, Link as MuiLink } from '@mui/material'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import backgroundImage from '../images/idk22.png';

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
  const API = process.env.REACT_APP_API_URL;

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (searchParams.get('success') === 'registered') {
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
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
    setSuccessMessage(''); 
    if (isBlocked) {
      setError('Đăng nhập thất bại quá nhiều, thử lại sau...');
      return;
    }

    if (!password && !username) {
      setError('Tên đăng nhập và mật khẩu không được để trống!');
      return;
    }


    if (!username) {
      setError('Tên đăng nhập không được để trống!');
      return;
    }
    if (!password) {
      setError('Mật khẩu không được để trống!');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setError('Tên người dùng phải có từ 3 đến 20 ký tự.');
      return;
    }

    if (password.length < 8 || password.length > 32) {
      setError('Mật khẩu phải có từ 8 đến 32 ký tự.');
      return;
    }


    try {
      const response = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const fetchUserResponse = await fetch(`${API}/api/users/me`, {
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
          setError('Sai thông tin đăng nhập hoặc mật khẩu!'); 
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
        const response = await fetch(`${API}/api/auth/google`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: credentialResponse.credential }), 
        });

        const data = await response.json();
        if (response.ok) {
            const fetchUserResponse = await fetch(`${API}/api/users/me`, {
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

  const waterDropAnimation = `
  @keyframes waterDrop {
    0% {
      transform: translateX(-50%) scale(0.85);
      opacity: 1;
    }
    50% {
      transform: translateX(-50%) scale(1.05);
      opacity: 0.5;
    }
    100% {
      transform: translateX(-50%) scale(0.85);
      opacity: 1;
    }
  }

  @keyframes ripple {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 1;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
      opacity: 0.3;
    }
    100% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 1;
    }
  }

  @keyframes float {
    0% {
      transform: translateX(-50%) translateY(0px);
    }
    50% {
      transform: translateX(-50%) translateY(-15px);
    }
    100% {
      transform: translateX(-50%) translateY(0px);
    }
  }
  `;

  const animations = `
  ${waterDropAnimation}

  @keyframes borderAnimation {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes borderGlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  `;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%', 
          backgroundImage: `linear-gradient(rgba(20, 20, 20, 0.6), rgba(20, 20, 20, 0.6)), url(${backgroundImage})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }
      }}
    >
      <style>{animations}</style>

      <Container
        maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'colume',
          padding: { xs: '0 16px 32px', sm: '0 24px 32px' }, 
          backgroundColor: 'white',
          backdropFilter: 'blur(10px)',
          opacity: 0.9,
          minHeight: '10vh',
          width: { xs: '90%', sm: '70%', md: '450px' },
          mt: { xs: 8, sm: 8, md: 10 }, 
          mb: { xs: 4, md: 0 },
          borderRadius: '25px',
          position: 'relative',
          paddingTop: { xs: '80px', sm: '90px' } ,
          
          overflow: 'hidden', 
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'linear-gradient(90deg,	#91d7ff,	#a6dfff,	#734afb,	#c6eeff)',
            backgroundSize: '400% 400%',
            animation: 'borderGlow 4s ease infinite, borderAnimation 8s linear infinite',
            borderRadius: '25px', 
            zIndex: -1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '3px', 
            background: 'snow',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px', 
            zIndex: -1,
          },
          '& .MuiTextField-root': {
            borderRadius: '8px', 
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',  
            }
          },
          '& .MuiButton-contained': {
            borderRadius: '8px', 
          }
        }}
      >
        {/* Animated title box */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 15, sm: 25 },
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '		#f6fafd',
            padding: { xs: '10px 25px', sm: '15px 40px' },
            borderRadius: '50px',
            boxShadow: '0 10px 20px rgba(180, 200, 211, 0.48)',
            animation: 'float 3s ease-in-out infinite',
            zIndex: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '100%',
              left: '50%',
              width: '70%',
              height: '15px',
              background: 'rgba(178, 207, 236, 0.67)',
              filter: 'blur(8px)',
              borderRadius: '50%',
              animation: 'ripple 2s ease-in-out infinite',
            },
            // Water drop effect circles
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '115%',
              left: '55%',
              width: '25px',
              height: '25px',
              background: 'rgba(119, 203, 255, 0.53)',
              borderRadius: '50%',
              animation: 'waterDrop 2s ease-in-out infinite',
            },
            // Additional water circles
            '& .water-circle': {
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(119, 203, 255, 0.53)',
              animation: 'ripple 1.5s ease-in-out infinite',
            }
          }}
        >
          {/* Water effect circles */}
          <Box
            className="water-circle"
            sx={{
              width: '20px',
              height: '20px',
              top: '110%',
              left: '30%',
              animationDelay: '0.5s',
            }}
          />
          <Box
            className="water-circle"
            sx={{
              width: '15px',
              height: '15px',
              top: '115%',
              left: '70%',
              animationDelay: '0.7s',
            }}
          />

          <Typography 
            variant="h4" 
            sx={{ 
              color: '	#5e789d',
              fontFamily: "Roboto Slab",
              fontWeight: 'bold',
              fontSize:25,
              textAlign: 'center',
              textShadow: '0 5px 4px rgba(115, 114, 114, 0.2)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Đăng nhập
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            position: 'relative', 
            zIndex: 1,
          }}
        >
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>} 
          {successMessage && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{successMessage}</Alert>}
          
          <Box component="form" sx={{ width: '100%', mt: 1 }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 1,width: '90%', ml:2.5 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mt: 1, mb: 2 ,width: '90%', ml:2.5}}
            />
            <Button
              type="button"
              
              variant="contained"
              color="primary"
              sx={{ 
                mt: 3, 
                mb: 2,
                fontFamily: "Roboto Slab",
                width: 'auto', 
                minWidth: '120px', 
                height: '40px',
                borderRadius: '50px !important',
                margin: '16px auto', 
                display: 'block', 
                padding: '0 24px',
              }}
              onClick={handleLogin}
            >
              Đăng nhập 
            </Button>

            <Box sx={{ 
              display: 'flex', 
              
              justifyContent: 'center', 
              width: '100%', 
              mt: 1,
              mb: 3,
              
            }}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => {
                  console.log('Login Failed');
                  setError('Google login failed.');
                }}
                shape="circle"
                theme="snow" 
                size="large" 
                width="250" 
                useOneTap 
              />
            </Box>

            <Box textAlign="center" sx={{ mb:0}}>
              <MuiLink component={Link} to="" variant="body2" x={{ display: 'block', mb: 1 }}>
                Quên mật khẩu?
              </MuiLink>
              <p></p>
              <MuiLink component={Link} to="/register" variant="body2" sx={{ display: 'block' }}>
                Chưa có tài khoản? Đăng ký tại đây.
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );

}

export default Login;