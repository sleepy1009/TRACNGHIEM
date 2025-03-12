import React, { useState, useEffect } from 'react';
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';

function Account() {
    const { logout, updateDisplayName } = useAuth();
    const [userData, setUserData] = useState({ displayName: '', email: '', level: '' });
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
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
            setMessage('Login successful!');
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
                setMessage('Changes saved successfully!');
                setEditMode(false);
          
                try { 
                  const refetchResponse = await fetch('http://localhost:5000/api/users/me', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
          
                  if (refetchResponse.ok) {
                    const refetchedData = await refetchResponse.json();
                    setUserData(refetchedData);
                    localStorage.setItem('displayName', refetchedData.displayName);
                    updateDisplayName(refetchedData.displayName); 
                  } else {
                    console.error("Failed to refetch user data:", refetchResponse.status);
                    setError("Changes saved, but display may not be up-to-date. Please refresh."); 
                  }
                } catch (refetchError) { 
                  console.error("Error refetching user data:", refetchError);
                  setError("Changes saved, but display may not be up-to-date. Please refresh.");
                }
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
        setError('');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'primary.main',
                                    fontSize: '2.5rem',
                                    mr: 3
                                }}
                            >
                                {getInitials(userData.displayName || 'User')}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    {userData.displayName}
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Thành viên kể từ {new Date().getFullYear()}
                                </Typography>
                            </Box>
                        </Box>
                        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" component="div">
                                        Thông tin cá nhân
                                    </Typography>
                                    {!editMode ? (
                                        <Tooltip title="Edit Information">
                                            <IconButton onClick={handleEdit} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Box>
                                            <Tooltip title="Save Changes">
                                                <IconButton onClick={handleSave} color="primary" sx={{ mr: 1 }}>
                                                    <SaveIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel">
                                                <IconButton onClick={handleCancel} color="error">
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
                                            InputProps={{
                                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            }}
                                        />
                                        <TextField
                                            label="Email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            fullWidth
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            }}
                                        />
                                        <TextField
                                            label="Level"
                                            name="level"
                                            value={userData.level}
                                            onChange={handleChange}
                                            fullWidth
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <GradeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ '& > div': { mb: 2 } }}>
                                        <Box display="flex" alignItems="center">
                                            <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
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
                                            <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
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
                                            <GradeIcon sx={{ mr: 2, color: 'text.secondary' }} />
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
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" component="div">
                                        Thông kê
                                    </Typography>
                                    <HistoryIcon color="primary" />
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Hoạt động gần đây
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Số bài đã làm: XX
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Điểm trung bình: XX%
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Lần kiểm tra cuối: XX/XX/XXXX
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to="/test-history"
                                    startIcon={<HistoryIcon />}
                                    fullWidth
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