import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  BookOutlined as BookIcon,
  TimerOutlined as TimerIcon,
  QuizOutlined as QuizIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState('');
  const classId = searchParams.get('classId');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage("Hãy đăng nhập trước... ");
      setTimeout(() => {
        navigate('/login?redirect=/subjects?classId=' + classId);
      }, 2000);
      return;
    }

    const fetchData = async () => {
      if (!classId) {
        setError("No class selected");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const classResponse = await fetch(`http://localhost:5000/api/classes/${classId}`);
        if (!classResponse.ok) throw new Error('Failed to fetch class details');
        const classData = await classResponse.ok ? await classResponse.json() : null;
        setClassName(classData?.name || 'Unknown Class');

        const subjectsResponse = await fetch(`http://localhost:5000/api/subjects/byClass/${classId}`);
        if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load subjects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Box mt={8}>
          {message && <Alert severity="info">{message}</Alert>}
        </Box>
      </Container>
    );
  }

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card>
            <CardContent>
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </CardContent>
            <CardActions>
              <Skeleton variant="rectangular" width={100} height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink
            component={Link}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {className}
          </Typography>
        </Breadcrumbs>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Môn học hiện có cho {className}
          </Typography>
          <Typography variant="subtitle1">
            Chọn một môn học để bắt đầu thực hành và kiểm tra kiến ​​thức của bạn.
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Grid container spacing={3}>
            {subjects.map((subject) => (
              <Grid item xs={12} sm={6} md={4} key={subject._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BookIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {subject.name}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" paragraph>
                      {subject.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<QuizIcon />}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<TimerIcon />}
                        label="45 mins"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={Link}
                      to={`/questions/${subject._id}`}
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      fullWidth
                    >
                      Làm bài 
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && subjects.length === 0 && !error && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No subjects available for this class yet.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default SubjectList;