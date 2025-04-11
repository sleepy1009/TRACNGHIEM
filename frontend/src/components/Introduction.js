import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { keyframes } from '@mui/system';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import educationImage from '../images/photo3.jpg';

// Animation keyframes
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

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const gradientBg = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function Introduction() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/classes');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClasses(data);
        setLoading(false);
      } catch (error) {
        console.error("Could not fetch classes:", error);
        setError("Lỗi dữ liệu, hãy thử lại sau.");
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProgressClick = () => {
    if (!isAuthenticated) {
      setMessage("Hãy đăng nhập trước...");
      setTimeout(() => {
        navigate('/login?redirect=/test-history');
      }, 2000);
      return;
    } else {
      navigate('/test-history');
    }
  };

  const features = [
    {
      icon: <AssessmentIcon fontSize="large" />,
      title: "Kiểm tra trắc nghiệm",
      
      onClick: () => document.getElementById('overview').scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: <TimelineIcon fontSize="large" />,
      title: "Theo dõi tiến trình",
      
      onClick: handleProgressClick
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "Cộng đồng",
      onClick: () => {}
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      {message && (
        <Container maxWidth="md">
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '200px',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            <Alert severity="info" sx={{ width: '100%' }}>
              {message}
            </Alert>
          </Box>
        </Container>
      )}

      <Paper
        sx={{
          position: 'relative',
          background: 'linear-gradient(-45deg, #2196f3, #64b5f6, #01214F, #1976d2)',
          backgroundSize: '400% 400%',
          animation: `${gradientBg} 15s ease infinite`,
          color: 'snow',
          
          borderRadius: 0,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={8} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  animation: `${fadeIn} 1s ease-out`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Chào mừng bạn đến với Hành trình học tập.
              </Typography>
              <Typography 
                variant="h5" 
                color="inherit" 
                paragraph 
                sx={{ 
                  opacity: 0.9,
                  animation: `${fadeIn} 1s ease-out 0.3s`,
                  animationFillMode: 'both',
                }}
              >
                Nâng cao kiến thức của bạn với nền tảng kiểm tra trắc nghiệm toàn diện,
                theo dõi tiến trình và đạt được mục tiêu học tập.
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  document.getElementById('overview').scrollIntoView({ 
                    behavior: 'smooth'
                  });
                }}
                sx={{ 
                  mt: 2,
                  fontSize:20,
                  fontWeight:"bold",
                  fontFamily:"Roboto Slab"
                }}
              >
                Bắt đầu
              </Button>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src={educationImage}
                alt="Education illustration"
                sx={{
                  width: '60%',
                  maxWidth: '500px',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  animation: `${float} 4s ease-in-out infinite`,
                  transform: 'translateY(0)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: 2, 
            fontFamily: "Roboto Slab",
            animation: `${fadeIn} 1s ease-out`,
          }}
        >
          Tổng quan
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: '100px', 
                  maxHeight: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                  transition: 'all 0.3s ease',
                  animation: `${fadeIn} 1s ease-out ${index * 0.2}s`,
                  animationFillMode: 'both',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                    '& .icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  }
                }}
                onClick={feature.onClick}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box 
                    className="icon"
                    sx={{ 
                      color: 'primary.main', 
                      mb: 1,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ mb: 8 }} id="overview">
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom 
          fontFamily="Roboto Slab"
          sx={{
            animation: `${fadeIn} 1s ease-out`,
          }}
        >
          Các lớp hiện có
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="textSecondary" 
          paragraph 
          sx={{ 
            mb: 3,
            animation: `${fadeIn} 1s ease-out 0.2s`,
            animationFillMode: 'both',
          }}
        >
          Chọn một lớp học bên dưới để làm bài
        </Typography>

        {error ? (
          <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            {error}
          </Paper>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              boxShadow: 3,
              animation: `${fadeIn} 1s ease-out`,
              '& .MuiTableRow-root': {
                transition: 'all 0.3s ease',
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'rgba(114, 161, 237, 0.32)',
                transform: 'scale(1.01)',
              }
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontFamily: "Roboto Slab", fontSize: 20 }}>Lớp</TableCell>
                  <TableCell sx={{ color: 'white', fontFamily: "Roboto Slab", fontSize: 20 }}>Miêu tả</TableCell>
                  <TableCell sx={{ color: 'white', fontFamily: "Roboto Slab", fontSize: 20 }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow
                    key={classItem._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="subtitle1">
                          {classItem.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{classItem.description}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Khám phá">
                        <IconButton
                          component={Link}
                          to={`/subjects?classId=${classItem._id}`}
                          color="primary"
                          sx={{
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'rotate(360deg)',
                            }
                          }}
                        >
                          <AutoStoriesIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {showScrollTop && (
        <IconButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            animation: `${fadeIn} 0.3s ease-out`,
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      )}
    </Box>
  );
}

export default Introduction;