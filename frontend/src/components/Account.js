import React, { useState, useEffect } from 'react';
import { keyframes } from '@mui/system';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Grade as GradeIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';


const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

function Account() {
    const { logout, updateDisplayName } = useAuth();
    const [userData, setUserData] = useState({ displayName: '', email: '', level: '' });
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No token found");
                logout();
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("Could not fetch user data:", error);
                setError('Failed to load user data.');
            }
        };

        if (searchParams.get('success') === 'loggedin') {
            setMessage('Đăng nhập thành công!');
            searchParams.delete('success');
            setSearchParams(searchParams);
        }

        fetchUserData();
    }, [logout, searchParams, setSearchParams]);

    const handleEdit = () => {
        setEditMode(true);
        setMessage('');
        setError('');
    };

    const handleSave = async () => {
        setMessage('');
        setError('');

        if(!userData.displayName){
            setError('Tên hiển thị không được trống!');
            setMessage('');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
            }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Thay đổi thông tin thành công!');
                setEditMode(false);
                localStorage.setItem('displayName', userData.displayName);
                updateDisplayName(userData.displayName);
            } else {
                setError(data.message || 'Failed to update user data.');
            }
        } catch (error) {
            console.error("Could not save user data:", error);
            setError('Failed to save changes.');
        }
    };

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const handleCancel = () => {
        setEditMode(false);
        setMessage('');
        setError('Đảm bảo tên và email hợp lệ.');
    };

    const cardStyle = {
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: (theme) => theme.shadows[8],
        },
        animation: `${fadeIn} 0.6s ease-out`,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid',
        borderColor: 'divider',
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover': {
                '& fieldset': {
                    borderColor: 'primary.main',
                },
            },
            '&.Mui-focused': {
                '& fieldset': {
                    borderWidth: '2px',
                },
            },
        },
    };

    return (
            
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 4, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg,rgba(244, 251, 255, 0.37) 0%, #f8f9fa 100%)',
                    animation: `${fadeIn} 0.6s ease-out`,
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg,rgb(0, 0, 0),rgb(150, 150, 150))',
                    }
                }}
            >
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'primary.main',
                                    fontSize: '2.5rem',
                                    mr: 3,
                                    animation: `${pulseAnimation} 2s infinite`,
                                    border: '4px solid',
                                    borderColor: 'primary.light',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                }}
                            >
                                {getInitials(userData.displayName || 'User')}
                            </Avatar>
                            <Box sx={{ animation: `${slideIn} 0.6s ease-out` }}>
                                <Typography 
                                    variant="h4" 
                                    gutterBottom 
                                    fontFamily="Roboto Slab" 
                                    fontWeight="bold"
                                    sx={{
                                        background: 'linear-gradient(45deg,rgb(1, 1, 1) 30%,rgb(116, 116, 116) 90%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                    }}
                                >
                                    {userData.displayName}
                                </Typography>
                                <Typography 
                                    variant="subtitle1" 
                                    color="textSecondary"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <TimeIcon fontSize="small" />
                                    Thành viên kể từ {new Date().getFullYear()}
                                </Typography>
                            </Box>
                        </Box>
                        {message && <Alert severity="success" sx={{ mb: 2, animation: `${fadeIn} 0.6s ease-out` }}>{message}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2, animation: `${fadeIn} 0.6s ease-out` }}>{error}</Alert>}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" component="div" fontFamily="Roboto Slab">
                                        Thông tin cá nhân
                                    </Typography>
                                    {!editMode ? (
                                        <Tooltip title="Sửa thông tin">
                                            <IconButton 
                                                onClick={handleEdit} 
                                                color="primary"
                                                sx={{
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'rotate(15deg)',
                                                    },
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Box>
                                            <Tooltip title="Lưu thay đổi">
                                                <IconButton 
                                                    onClick={handleSave} 
                                                    color="primary" 
                                                    sx={{ 
                                                        mr: 1,
                                                        transition: 'transform 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <SaveIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Hủy">
                                                <IconButton 
                                                    onClick={handleCancel} 
                                                    color="error"
                                                    sx={{
                                                        transition: 'transform 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                
                                {editMode ? (
                                    <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
                                        <TextField
                                            label="Tên"
                                            name="displayName"
                                            value={userData.displayName}
                                            onChange={handleChange}
                                            fullWidth
                                            variant="outlined"
                                            sx={textFieldStyle}
                                            InputProps={{
                                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />,
                                            }}
                                        />
                                        <TextField
                                            label="Email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            fullWidth
                                            variant="outlined"
                                            sx={textFieldStyle}
                                            InputProps={{
                                                startAdornment: <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />,
                                            }}
                                        />
                                        <TextField
                                            label="Level"
                                            name="level"
                                            value={userData.level}
                                            onChange={handleChange}
                                            fullWidth
                                            variant="outlined"
                                            sx={textFieldStyle}
                                            InputProps={{
                                                startAdornment: <GradeIcon sx={{ mr: 1, color: 'primary.main' }} />,
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ '& > div': { mb: 2 } }}>
                                        <Box display="flex" alignItems="center">
                                            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    Tên
                                                </Typography>
                                                <Typography variant="body1">
                                                    {userData.displayName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    Email
                                                </Typography>
                                                <Typography variant="body1">
                                                    {userData.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <GradeIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    Level
                                                </Typography>
                                                <Typography variant="body1">
                                                    {userData.level}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" component="div" fontFamily="Roboto Slab">
                                        Thống kê
                                    </Typography>
                                    <HistoryIcon color="primary" />
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Hoạt động gần đây
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: 1, 
                                            bgcolor: 'background.paper',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Box textAlign="center">
                                                    <Typography variant="h4" color="primary" fontWeight="bold">
                                                        ?
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Bài đã làm
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Box textAlign="center">
                                                    <Typography variant="h4" color="primary" fontWeight="bold">
                                                        ?
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Điểm TB
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Box textAlign="center">
                                                    <Typography variant="h4" color="primary" fontWeight="bold">
                                                        ?
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Thời gian TB
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to="/test-history"
                                    startIcon={<HistoryIcon />}
                                    fullWidth
                                    sx={{ 
                                        mt: 2,
                                        fontWeight: "bold",
                                        fontFamily: "Roboto Slab",
                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 15px rgba(33, 150, 243, 0.3)',
                                        },
                                    }}
                                >
                                    Xem lịch sử kiểm tra
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Container>

    );
}

export default Account;