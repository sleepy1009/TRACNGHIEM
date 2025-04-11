import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, TextField, InputAdornment, useScrollTrigger, Slide } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isAuthenticated, displayName, logout } = useAuth();
  const navigate = useNavigate();
  
  // Hide header on scroll
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Button hover animation styles
  const buttonStyle = {
    mr: 1,
    fontFamily: "Roboto Slab",
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: '2px',
      backgroundColor: 'white',
      transition: 'width 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      '&::before': {
        width: '80%',
      },
    },
  };

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar 
          position="fixed" 
          sx={{ 
            background: 'primary-color',

          }}
        >
          <Toolbar sx={{ 
            paddingTop: 1, 
            paddingBottom: 1,
            transition: 'all 0.3s ease',
          }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="home" 
              component={Link} 
              to="/"
              sx={{
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              }}
            >
              <img 
                src="/myicon.ico" 
                alt="home icon" 
                style={{ width: 35, height: 35 }}
              />
            </IconButton>

            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                ml: 2, 
                fontFamily: "Roboto Slab",
                fontSize: '1.2rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #FFFFFF 30%, #E3F2FD 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {isAuthenticated ? `Xin chào, ${displayName}!` : 'Trắc nghiệm'}
            </Typography>

            <Box sx={{ 
              mr: 2, 
              display: 'flex', 
              alignItems: 'center',
              transform: isSearchFocused ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Tìm kiếm..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        type="button" 
                        sx={{ 
                          p: '4px',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'rotate(90deg)',
                          },
                        }} 
                        aria-label="search"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'snow',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'transparent',
                      transition: 'all 0.3s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 3px rgba(25,118,210,0.2)',
                    },
                  },
                }}
              />
            </Box>

            {isAuthenticated ? (
              <Box sx={{ display: 'flex' }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/account" 
                  sx={buttonStyle}
                >
                  Tài khoản
                </Button>
                <Button 
                  color="inherit" 
                  sx={buttonStyle}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex' }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login" 
                  sx={buttonStyle}
                >
                  Đăng nhập
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/register" 
                  sx={buttonStyle}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Slide>
      <Toolbar />
    </>
  );
}

export default Header;