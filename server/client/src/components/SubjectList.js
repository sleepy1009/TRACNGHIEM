import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
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
  const [questionSets, setQuestionSets] = useState([]);
  const classId = searchParams.get('classId');
  const subjectId = searchParams.get('subjectId');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) {
      setMessage("Hãy đăng nhập trước... ");
      setTimeout(() => {
        const redirectParams = new URLSearchParams();
        if (classId) redirectParams.set('classId', classId);
        if (subjectId) redirectParams.set('subjectId', subjectId);
        navigate(`/login?redirect=/subjects?${redirectParams.toString()}`);
      }, 2000);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!classId) {
          navigate('/', { replace: true });
          return;
        }

        const classResponse = await fetch(`http://localhost:5000/api/classes/${classId}`);
      if (!classResponse.ok) {
        if (classResponse.status === 404) {
          navigate('/', { replace: true });
          return;
        }
        throw new Error('Failed to fetch class details');
      }
      const classData = await classResponse.json();
      setClassName(classData?.name || 'Unknown Class');

      const subjectsResponse = await fetch(`http://localhost:5000/api/subjects/byClass/${classId}`);
      if (!subjectsResponse.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);

      if (subjectId) {
        const selectedSubject = subjectsData.find(s => s._id === subjectId);
        if (selectedSubject) {
          setSelectedSubject(selectedSubject);
          setDialogOpen(true);
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [classId, subjectId, isAuthenticated, navigate]);

  if (!classId) {
    return (
      <Container maxWidth="md">
        <Box mt={8}>
          <Alert severity="info">
            Vui lòng chọn lớp trước...
          </Alert>
        </Box>
      </Container>
    );
  }

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


  const fetchQuestionSets = async (subjectId, semester) => {
    try {
      setLoading(true);
      setError(null);

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('subjectId', subjectId);
      navigate(`/subjects?${newSearchParams.toString()}`);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching questions for:', { subjectId, semester });

      const response = await fetch(
        `http://localhost:5000/api/questions/bySubject/${subjectId}/${semester}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);

        if (response.status === 404) {
          setError('Không tìm thấy câu hỏi cho học kỳ này');
          setQuestionSets([]);
          setDialogOpen(true);
          return;
        }

        throw new Error(
          `Failed to fetch questions: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Raw data from API:", data); // check base date api

      const processedData = data.map((question) => {
        let correctAnswer = parseInt(question.correctAnswer);
        console.log(`Question ID: ${question._id}, correctAnswer (raw): ${question.correctAnswer}, correctAnswer (parsed): ${correctAnswer}, options:`, question.options);


        if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= (question.options?.length || 0)) {
          console.error(`Invalid correctAnswer for question: ${question._id}, correctAnswer: ${question.correctAnswer}`);
          throw new Error(`Invalid correctAnswer for question ID: ${question._id}`);
        }

        return {
          ...question,
          correctAnswer, 
          points: parseInt(question.points) || 1,
          setNumber: parseInt(question.setNumber) || 1
        };
      });


      const questionsBySet = processedData.reduce((sets, question) => {
        const setNumber = question.setNumber;
        if (!sets[setNumber]) {
          sets[setNumber] = {
            setNumber,
            questionCount: 0,
            questions: []
          };
        }
        sets[setNumber].questionCount++;
        sets[setNumber].questions.push(question);
        return sets;
      }, {});


      const formattedSets = Object.values(questionsBySet)
        .sort((a, b) => a.setNumber - b.setNumber);

      console.log('Formatted sets:', formattedSets);



      setQuestionSets(formattedSets);
      setSelectedSemester(semester);
      setSelectedSubject(subjects.find(s => s._id === subjectId));
      setDialogOpen(true);

    } catch (error) {
      console.error('Error fetching question sets:', error);
      setError(error.message || 'Failed to fetch question sets');
      setQuestionSets([]);
    } finally {
      setLoading(false);
    }
  };

  const QuestionSetsDialog = () => (
    <Dialog 
      open={dialogOpen} 
      onClose={() => {
        setDialogOpen(false);
        setError(null);
        setQuestionSets([]);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontFamily="Roboto Slab">
            {selectedSubject?.name} - Học kỳ {selectedSemester}
          </Typography>
          {!loading && !error && (
            <Chip 
            
              label={`${questionSets.length} bộ câu hỏi`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : questionSets.length > 0 ? (
          <Grid container spacing={2}>
            {questionSets.map((set) => {
              const validQuestions = set.questions.every(q => 
                Number.isInteger(parseInt(q.correctAnswer)) && 
                parseInt(q.correctAnswer) >= 0 && 
                parseInt(q.correctAnswer) < (q.options?.length || 4)
              );
  
              if (!validQuestions) {
                console.warn(`Set ${set.setNumber} contains invalid questions`);
              }
  
              return (
                <Grid item xs={12} sm={6} key={set.setNumber}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                        transition: 'all 0.3s ease'
                      }
                    }}
                    onClick={() => {
                      const validQuestions = set.questions;
                      
                      const hasInvalidAnswer = validQuestions.some(q => 
                        isNaN(q.correctAnswer) || 
                        q.correctAnswer < 0 || 
                        q.correctAnswer >= q.options.length
                      );
                                        
                      if (hasInvalidAnswer) {
                        console.error('Invalid correct answers detected');
                        return;
                      }
                      const timeLimit = 45;
                      navigate(`/test-intro/${selectedSubject?._id}`, {
                        state: { 
                          semester: selectedSemester,
                          setNumber: set.setNumber,
                          questions: validQuestions,
                          questionCount: set.questionCount,
                          timeLimit: timeLimit,  
                          subjectName: selectedSubject?.name 
                        }
                      });
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Bộ đề số {set.setNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={`${set.questionCount} câu hỏi`}
                          size="small"
                          color="primary"
                        />
                        
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        -----
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Không có bộ câu hỏi nào cho học kỳ này
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  const renderSubjectCard = (subject) => (
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
            label="45 phút"
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchQuestionSets(subject._id, 1)}
          startIcon={<SchoolIcon />}
        >
          Học kỳ 1
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => fetchQuestionSets(subject._id, 2)}
          startIcon={<SchoolIcon />}
        >
          Học kỳ 2
        </Button>
      </CardActions>
    </Card>
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
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit"/>
            Trang chủ 
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center'}}>
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
          <Typography variant="h4" gutterBottom fontFamily="Roboto Slab">
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
                {renderSubjectCard(subject)}
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
        <QuestionSetsDialog />
      </Box>
    </Container>
  );
}

export default SubjectList;