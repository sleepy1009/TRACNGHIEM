import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, TextField, InputAdornment, Menu, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, displayName, logout } = useAuth(); 
  const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login')
    }
  const subjects = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Physics' },
    { id: 3, name: 'Chemistry' },
    { id: 4, name: 'Literature' },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

   
  return (
    <AppBar position="static"  sx={{ marginBottom: 0 }}>
      <Toolbar sx={{ paddingTop: 0, paddingBottom: 0 }}>
        <IconButton edge="start" color="inherit" aria-label="home" component={Link} to="/">
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 2, fontFamily:"Roboto Slab" }}>
          {isAuthenticated ? `Xin chào, ${displayName}!` : 'Trắc nghiệm'} 
        </Typography>

        

        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Tìm kiếm..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'grey.400',
                },
                '&:hover fieldset': {
                  borderColor: 'grey.600',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>

        {isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/account" sx={{ mr: 1,fontFamily:"Roboto Slab" }}>
              Tài khoản 
            </Button>
            <Button color="inherit" sx={{ mr: 1,fontFamily:"Roboto Slab" }} onClick={handleLogout}>
              Đăng xuất 
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login" sx={{ mr: 1,fontFamily:"Roboto Slab" }}>
              Đăng nhập 
            </Button>
            <Button color="inherit" sx={{ mr: 1,fontFamily:"Roboto Slab" }} component={Link} to="/register">
              Đăng ký 
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;