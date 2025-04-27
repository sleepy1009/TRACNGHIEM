import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
  ArrowUpward as ArrowUpwardIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  StarBorder as StarBorderIcon,
  History as HistoryIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon
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
  const [statisticsError, setStatisticsError] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [subjectsMap, setSubjectsMap] = useState({});
  const API = process.env.REACT_APP_API_URL;

  

  const [openStatsDialog, setOpenStatsDialog] = useState(false);
  const [openSubjectStats, setOpenSubjectStats] = useState(false);
  const [statistics, setStatistics] = useState({
    totalTests: 0,
    averageScore: 0,
    averageTime: 0,
    subjectStats: {}
  });

  const [openRankingBoard, setOpenRankingBoard] = useState(false);
  const [rankings, setRankings] = useState([]);
  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', 
      '#4ECDC4', 
      '#45B7D1', 
      '#96CEB4', 
      '#FFEEAD', 
      '#D4A5A5', 
      '#9B59B6', 
      '#3498DB', 
      '#E67E22', 
      '#1ABC9C', 
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  const fetchRankings = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`${API}/api/users/rankings`, {
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error("Could not fetch rankings:", error);
      setError("Không thể tải bảng xếp hạng. Vui lòng thử lại sau.");
    }
  };

  const formatScore = (score) => {
    return score % 1 === 0 ? Math.floor(score) : score.toFixed(2);
  };
  
  const formatAverageTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  const fetchUserStatistics = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API}/api/users/test-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const testHistory = await response.json();
      console.log('Test History:', testHistory);
      
      const totalTests = testHistory.length;
      
      const totalScore = testHistory.reduce((acc, test) => {
        const correctAnswers = test.questionSet.filter(q => q.userAnswer === q.correctAnswer).length;
        return acc + (correctAnswers * 0.25);
      }, 0);
      const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
  
      const totalTime = testHistory.reduce((acc, test) => acc + test.timeSpent, 0);
      const averageTime = totalTests > 0 ? Math.round(totalTime / totalTests) : 0;

      const subjectStats = {};
      testHistory.forEach(test => {
        if (!test.subjectId || !test.subjectId.name) {
          console.warn('Test missing subject data:', test);
          return;
        }
        
        const subjectId = test.subjectId._id;
        const subjectName = test.subjectId.name; 
        
        if (!subjectStats[subjectId]) {
          subjectStats[subjectId] = {
            name: subjectName,
            totalTests: 0,
            totalScore: 0,
            totalTime: 0,
            bestScore: 0,
            recentScores: []
          };
        }
        
        const correctAnswers = test.questionSet.filter(q => q.userAnswer === q.correctAnswer).length;
        const score = correctAnswers * 0.25;
        
        subjectStats[subjectId].totalTests++;
        subjectStats[subjectId].totalScore += score;
        subjectStats[subjectId].totalTime += test.timeSpent;
        subjectStats[subjectId].bestScore = Math.max(subjectStats[subjectId].bestScore, score);
        subjectStats[subjectId].recentScores.push({
          score,
          date: test.date || test.completedAt 
        });
      });
  
      Object.keys(subjectStats).forEach(subjectId => {
        const stats = subjectStats[subjectId];
        stats.averageScore = stats.totalScore / stats.totalTests;
        stats.averageTime = Math.round(stats.totalTime / stats.totalTests);
        stats.recentScores = stats.recentScores
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
      });
  
      setStatistics({
        totalTests,
        averageScore,
        averageTime,
        subjectStats
      });
    } catch (error) {
      console.error("Could not fetch test history:", error);
      setStatisticsError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
    }
  };

  const StatisticsDialog = () => (
    <Dialog
      open={openStatsDialog}
      onClose={() => setOpenStatsDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          width: { xs: '95%', sm: '80%', md: '70%' }, 
          margin: { xs: '10px', md: '32px' },  
          '& .MuiDialogTitle-root': {
            padding: { xs: 2, md: 3 }
          },
          '& .MuiDialogContent-root': {
            padding: { xs: 1, md: 2 }
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: "Roboto Slab", 
        borderBottom: 1, 
        borderColor: 'divider',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <StarBorderIcon /> Thống kê học tập
        
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', fontFamily: "Roboto Slab" }}>Thông tin</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontFamily: "Roboto Slab" }}>Giá trị</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontFamily: "Roboto Slab" }}>Mô tả</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                          Bài đã làm
                        </Box>
                      </TableCell>
                      <TableCell align="center">{statistics.totalTests} bài</TableCell>
                      <TableCell>Tổng số bài kiểm tra đã làm.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                          Điểm TB
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {formatScore(statistics.averageScore)}
                      </TableCell>
                      <TableCell>Điểm trung bình các bài kiểm tra.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                          Thời gian TB
                        </Box>
                      </TableCell>
                      <TableCell align="center">{formatAverageTime(statistics.averageTime)}</TableCell>
                      <TableCell>Thời gian trung bình các bài kiểm tra.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{ 
        p: { xs: 1, md: 3 },
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },  
        gap: { xs: 1, sm: 2 },
        '& .MuiButton-root': {
          width: { xs: '100%', sm: 'auto' } 
        }
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          component={Link}
          to="/test-history"
          startIcon={<HistoryIcon />}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
          }}
        >
          Xem lịch sử kiểm tra
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setOpenStatsDialog(false);
            setOpenSubjectStats(true);
          }}
          startIcon={<BarChartIcon />}
          sx={{
            background: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
            color: 'white',
          }}
        >
          Thống kê theo môn
        </Button>
      </Box>

      <Button
        variant="outlined"
        onClick={() => setOpenStatsDialog(false)}
      >
        Đóng
      </Button>
    </DialogActions>
    </Dialog>
  );

  const SubjectStatisticsDialog = () => (
    <Dialog
      open={openSubjectStats}
      onClose={() => setOpenSubjectStats(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: "Roboto Slab", 
        borderBottom: 1, 
        borderColor: 'divider',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <StarBorderIcon />Thống kê theo môn học
        
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            {Object.entries(statistics.subjectStats || {}).map(([subjectId, stats]) => (
              <Grid item xs={12} key={subjectId}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontFamily="Roboto Slab">
                      {stats.name} - THCS
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary">Số bài đã làm</Typography>
                          <Typography variant="h4" color="primary">{stats.totalTests}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary">Điểm trung bình</Typography>
                          <Typography variant="h4" color="primary">{formatScore(stats.averageScore)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary">Thời gian trung bình</Typography>
                          <Typography variant="h4" color="primary">{formatAverageTime(stats.averageTime)}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      5 điểm gần nhất:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {stats.recentScores.map((score, index) => (
                        <Chip
                          key={index}
                          label={`${formatScore(score.score)} (${new Date(score.date).toLocaleDateString()})`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          onClick={() => setOpenSubjectStats(false)}
          sx={{ mr: 1 }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  const RankingBoardDialog = ({ open, onClose, rankings }) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: "Roboto Slab", 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrophyIcon /> Bảng xếp hạng cộng đồng
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Thứ hạng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '25%' }} align="center">Điểm trung bình</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '25%' }} align="center">Số bài đã làm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((user, index) => (
                <TableRow 
                  key={user._id}
                  sx={{
                    backgroundColor: index < 3 ? 'rgba(255, 246, 196, 0.43)' : 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(100, 175, 237, 0.1)',
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {index < 3 ? (
                        <StarIcon sx={{ 
                          color: index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32'
                        }} />
                      ) : null}
                      #{index + 1}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.avatarUrl ? `${API}${user.avatarUrl}` : ''}
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: getRandomColor(),
                          border: index < 3 ? '2.5px solid' : '2px solid',
                          borderColor: index === 0 
                          ? 'gold'
                          : index === 1 
                            ? 'silver'
                            : index === 2 
                              ? '#CD7F32'
                              : 'divider',
                          fontSize: '1rem'
                        }}
                      >
                        {!user.avatarUrl && user.displayName ? user.displayName.split(' ').map(word => word[0]).join('').toUpperCase() : null}
                      </Avatar>
                      <Typography>{user.displayName}</Typography>
                      {user.verified && (
                        <Tooltip title="Đã xác thực">
                          <VerifiedIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{user.averageScore.toFixed(2)}</TableCell>
                  <TableCell align="center">{user.totalTests}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            variant="outlined"
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Đóng
          </Button>
        </DialogActions>

      </Dialog>
    );
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${API}/api/classes`);
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

  const handleProgressClick = async () => { 
    if (!isAuthenticated) {
      setMessage("Hãy đăng nhập trước...");
      setTimeout(() => {
        navigate('/login?redirect=/');
      }, 2000);
      return;
    }
    
    await fetchUserStatistics(); 
    setOpenStatsDialog(true);
  };

  const handlerankClick = async () => { 
    if (!isAuthenticated) {
      setMessage("Hãy đăng nhập trước...");
      setTimeout(() => {
        navigate('/login?redirect=/');
      }, 2000);
      return;
    }
    
    await fetchRankings();
    setOpenRankingBoard(true);
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
      onClick: handlerankClick 
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
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
                sx={{
                  fontSize: { 
                    xs: '1.5rem',  
                    sm: '2rem',    
                    md: '2.5rem'   
                  },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  animation: `${fadeIn} 1s ease-out`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  py: { xs: 2, md: 0 }
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
                  fontSize: { xs: 16, md: 20 },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Bắt đầu
              </Button>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'block', sm: 'block', md: 'block'  }, mt: { xs: 4, md: 0 } }}>
              <Box
                component="img"
                src={educationImage}
                alt="Education illustration"
                sx={{
                  width: { 
                    xs: '80%',    
                    sm: '70%',    
                    md: '60%'     
                  },
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
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: 'auto',
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
                <CardContent sx={{ flexGrow: 1, textAlign: 'center',p: { xs: 1, md: 2 } }}>
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
              overflowX: 'auto',
              '& .MuiTableRow-root': {
                transition: 'all 0.3s ease',
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'rgba(114, 161, 237, 0.32)',
                transform: 'scale(1.01)',
              
              },
              '& .MuiTableCell-root': {
              padding: { xs: 1, md: 2 }, 
              fontSize: { 
                xs: '0.875rem', 
                md: '1rem'       
              }
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
      <StatisticsDialog 
        open={openStatsDialog}
        onClose={() => setOpenStatsDialog(false)}
        statistics={statistics}
        formatScore={formatScore}
        formatAverageTime={formatAverageTime}
        onOpenSubjectStats={() => setOpenSubjectStats(true)}
      />
      <SubjectStatisticsDialog />
      <RankingBoardDialog 
        open={openRankingBoard}
        onClose={() => setOpenRankingBoard(false)}
        rankings={rankings}
      />
    </Box>
  );
}


export default Introduction;