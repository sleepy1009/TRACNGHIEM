import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  Paper,
  Button,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Timer as TimerIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Send as SendIcon,
  Circle as CircleIcon 
} from '@mui/icons-material';


function TestTaking() {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const navigate = useNavigate();

  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/questions/bySubject/${subjectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Could not fetch questions:", error);
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subjectId]);

const handleSubmit = React.useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    
    const timeSpent = (45 * 60) - timeLeft;
    
    const formattedAnswers = {};
    questions.forEach((question) => {
      if (selectedAnswers.hasOwnProperty(questions.indexOf(question))) {
        formattedAnswers[question._id] = selectedAnswers[questions.indexOf(question)];
      }
    });

    const questionSet = questions.map((question, index) => ({
      questionId: question._id,
      questionText: question.questionText,
      options: question.options,
      userAnswer: selectedAnswers[index]
    }));

    const response = await fetch('http://localhost:5000/api/questions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        subjectId, 
        answers: formattedAnswers,
        timeSpent,
        questionSet
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit answers.');
    }

    const resultsData = await response.json();
    
    navigate(`/results/${subjectId}`, { 
      state: { 
        questions: resultsData.questions,
        selectedAnswers: formattedAnswers,
        timeLeft,
        timeSpent,
        score: resultsData.score,
        totalQuestions: resultsData.totalQuestions
      }
    });

  } catch (error) {
    console.error("Submission error:", error);
    setError(error.message);
  }
}, [subjectId, selectedAnswers, timeLeft, questions, navigate]);
  
  useEffect(() => {
    let timerId;
    if (timeLeft > 0 && !loading && questions.length > 0) {
      timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft <= 0 && !loading && questions.length > 0) {
      handleSubmit();
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timeLeft, loading, questions.length, handleSubmit]);
  

  const handleAnswerChange = (questionIndex, value) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: parseInt(value, 10),
    });
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.min(prevIndex + 1, questions.length - 1));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (questions.length === 0) {
    return <div>No questions found for this subject.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon color={timeLeft < 300 ? 'error' : 'primary'} sx={{ mr: 1 }} />
              <Typography variant="h6" color={timeLeft < 300 ? 'error' : 'primary'}>
                Thời gian còn lại: {formatTime(timeLeft)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1">
                Câu {currentQuestionIndex + 1} trên {questions.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(answeredCount / questions.length) * 100}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Typography variant="body1">
              Đã làm: {answeredCount}/{questions.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'primary.main'
              }}
            >
              Câu {currentQuestionIndex + 1}
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 4 }}>
              {currentQuestion.questionText}
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={selectedAnswers[currentQuestionIndex] ?? ''}
                onChange={(event) => handleAnswerChange(currentQuestionIndex, event.target.value)}
              >
                <Grid container spacing={2}>
                  {currentQuestion.options.map((option, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper
                        elevation={selectedAnswers[currentQuestionIndex] === index ? 3 : 1}
                        sx={{
                          p: 2,
                          transition: 'all 0.3s ease',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: selectedAnswers[currentQuestionIndex] === index 
                            ? 'primary.main' 
                            : 'grey.300',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            transform: 'translateY(-2px)',
                          }
                        }}
                      >
                        <FormControlLabel
                          value={index}
                          control={
                            <Radio 
                              checked={selectedAnswers[currentQuestionIndex] === index}
                              sx={{
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                },
                              }}
                            />
                          }
                          label={option}
                          sx={{ 
                            m: 0,
                            width: '100%',
                          }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </FormControl>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Trước đó
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Tiếp
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tổng quan bài làm
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  {questions.map((_, index) => (
                    <Grid item key={index}>
                      <Tooltip title={`Question ${index + 1}`}>
                        <Button
                          variant={currentQuestionIndex === index ? "contained" : "outlined"}
                          color={selectedAnswers.hasOwnProperty(index) ? "success" : "primary"}
                          sx={{
                            minWidth: '40px',
                            height: '40px',
                            p: 0,
                            borderRadius: 1,
                          }}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          {index + 1}
                        </Button>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chú thích:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'success.main' 
                  }}>
                    <CheckIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Đã làm</Typography>
                  </Box>
                </Grid>
                  <Grid item xs={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main' 
                  }}>
                    <CircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Chưa làm</Typography>
                  </Box>
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Nộp bài
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TestTaking;