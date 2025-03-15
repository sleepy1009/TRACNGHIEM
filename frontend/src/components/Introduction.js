import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
} from '@mui/icons-material';
import educationImage from '../images/photo3.jpg';


function Introduction() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError("Failed to load classes. Please try again later.");
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const features = [
    {
      icon: <AssessmentIcon fontSize="large" />,
      title: "Kiểm tra trắc nghiệm",
      description: ""
    },
    {
      icon: <TimelineIcon fontSize="large" />,
      title: "Theo dõi tiến trình",
      description: ""
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "Cộng đồng",
      description: ""
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
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'primary.main',
          color: 'white',
          mb: -7,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: 0,
        }}
      >
        <Container maxWidth="lg" >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
                sx={{
                  fontWeight: 200,
                  fontSize: { xs: '2.5rem', md: '2.5rem' },
                  fontWeight:"bold",
                  fontFamily:"Roboto Slab"
                }}
              >
                Chào mừng bạn đến với Hành trình học tập.
              </Typography>
              <Typography variant="h5" color="inherit" paragraph sx={{ opacity: 0.8 }}>
              Nâng cao kiến ​​thức của bạn với nền tảng kiểm tra trắc nghiệm toàn diện,
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
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)' 
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 3, fontFamily:"Roboto Slab" }}>
          Tổng quan
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
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

      <Container maxWidth="lg" sx={{ mb: 8 }}  id="overview">
        <Typography variant="h3" align="center" gutterBottom fontFamily="Roboto Slab">
          Các lớp hiện có 
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
          Chọn một lớp học bên dưới để làm bài 
        </Typography>
        
        {error ? (
          <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            {error}
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white',fontFamily:"Roboto Slab",fontSize:20 }}>Lớp </TableCell>
                  <TableCell sx={{ color: 'white',fontFamily:"Roboto Slab",fontSize:20 }}>Miêu tả </TableCell>
                  <TableCell sx={{ color: 'white',fontFamily:"Roboto Slab",fontSize:20 }} align="center">Hành động </TableCell>
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
                      <Tooltip title="View Subjects">
                        <IconButton
                          component={Link}
                          to={`/subjects?classId=${classItem._id}`}
                          color="primary"
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
    </Box>
  );
}

export default Introduction;