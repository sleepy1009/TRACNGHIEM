import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';
import { formatLatex, renderMathJax } from '../utils/mathUtils';
import DOMPurify from 'dompurify';
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
  // 1. Hook 
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const API = process.env.REACT_APP_API_URL;

  // 2. state 
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  // 3. get from?
  const semester = location.state?.semester;
  const setNumber = location.state?.setNumber;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState(null);

  // display error 
  {submitError && (
    <Alert 
      severity="error" 
      sx={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 9999 
      }}
      onClose={() => setSubmitError(null)}
    >
      {submitError}
    </Alert>
  )}

  // 4. fuction 
  const handleAnswerChange = useCallback((questionIndex, value) => {
    const numValue = parseInt(value, 10);
    const question = questions[questionIndex];
    
    console.log('Answer change:', {
      questionIndex,
      value,
      parsedValue: numValue,
      correctAnswer: question.correctAnswer,
      optionsLength: question.options.length
    });
  
    if (isNaN(numValue) || numValue < 0 || numValue >= question.options.length) {
      console.error('Invalid answer value:', {
        value,
        parsed: numValue,
        questionIndex,
        optionsLength: question.options.length
      });
      return;
    }
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: numValue,
    }));
  }, [questions]);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => 
      Math.min(prevIndex + 1, questions.length - 1)
    );
  }, [questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, []);

  const formatTime = useCallback((timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  

  // 5. submit handler
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);
  
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const timeSpent = (45 * 60) - timeLeft;
  
      
      let calculatedScore = 0;
      const questionSet = questions.map((question, index) => {
        const userAnswer = selectedAnswers[index];
        console.log(`Question ${index + 1}: userAnswer=${userAnswer}, correctAnswer=${question.correctAnswer}`);
        
        if (userAnswer === question.correctAnswer) {
          calculatedScore += 0.25;
          console.log(`Question ${index + 1} is correct.  Current score: ${calculatedScore}`);
        } else { 
            console.log(`Question ${index + 1} is incorrect.`);
        }

        return {
          questionId: question._id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer !== undefined ? userAnswer : null,
          isCorrect: userAnswer === question.correctAnswer,
          semester: parseInt(semester),
          setNumber: parseInt(setNumber)
        };
      });
      console.log("Total calculatedScore (frontend):", calculatedScore);
  
      const submissionData = {
        subjectId,
        answers: selectedAnswers,
        timeSpent,
        questionSet,
        semester: parseInt(semester),
        setNumber: parseInt(setNumber),
        score: calculatedScore,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString()
      };
  
      const response = await fetch('${API}/api/questions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit test');
      }
  
      navigate(`/results/${subjectId}`, { 
        state: {
          questions: questionSet,        
          selectedAnswers,
          timeLeft,
          timeSpent,
          score: calculatedScore,
          totalQuestions: questions.length,
          semester,
          setNumber,
          submittedAt: new Date().toISOString()
        }
      });
  
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'Failed to submit test');
      setIsSubmitting(false);
    }
  }, [
    questions,
    selectedAnswers,
    timeLeft,
    subjectId,
    navigate,
    semester,
    setNumber,
    setSubmitError,
    setIsSubmitting
  ]);

  <Button
    variant="contained"
    color="secondary"
    fullWidth
    size="large"
    startIcon={<SendIcon />}
    onClick={handleSubmit}
    disabled={isSubmitting}
    sx={{
      mt: 2,
      py: 1.5,
      fontSize: '1.1rem',
    }}
  >
    {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
  </Button>

  {error && (
    <Alert 
      severity="error" 
      sx={{ mt: 2 }}
      onClose={() => setError(null)}
    >
      {error}
    </Alert>
  )}

  // 6. Effect hooks
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        if (location.state?.questions) {
          const questionsWithCorrectAnswer = location.state.questions.map(q => {
              console.log(`Processing question from location.state:`, q); 
              const parsedCorrectAnswer = parseInt(q.correctAnswer);
               console.log(`Parsed correctAnswer: ${parsedCorrectAnswer}, options length: ${q.options.length}`); 

              if (isNaN(parsedCorrectAnswer) || parsedCorrectAnswer < 0 || parsedCorrectAnswer >= q.options.length) {
                console.error(`Invalid correctAnswer for question ID ${q._id}:`, q.correctAnswer);
                throw new Error(`Invalid correctAnswer in question data for ID ${q._id}.`);
              }
            return {
                ...q,
                correctAnswer: parsedCorrectAnswer 
            }
            });
          setQuestions(questionsWithCorrectAnswer);
          setLoading(false);
          return;
        }

        if (!subjectId || !semester || !setNumber) {
          throw new Error('Missing required parameters');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API}/api/questions/bySubject/${subjectId}/${semester}?setNumber=${setNumber}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw data from API in TestTaking:", data); // check dữ liệu thô

        const filteredQuestions = data
          .filter(q => q.setNumber === parseInt(setNumber))
          .map(q => {
            const parsedCorrectAnswer = parseInt(q.correctAnswer);
             console.log(`Question ID: ${q._id}, correctAnswer (raw): ${q.correctAnswer}, correctAnswer (parsed): ${parsedCorrectAnswer}, options:`, q.options);

            if (isNaN(parsedCorrectAnswer) || parsedCorrectAnswer < 0 || parsedCorrectAnswer >= q.options.length)
            {
                console.error(`Invalid correctAnswer for question ID ${q._id}:`, q.correctAnswer);
                throw new Error(`Invalid correctAnswer for question ID ${q._id}.`);
            }


            return {
              ...q,
              correctAnswer: parsedCorrectAnswer, // use parse
              options: q.options || [], // 
            };
          });

        if (filteredQuestions.length === 0) {
          throw new Error('No questions found for this set');
        }


      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
    };

    fetchQuestions();
  }, [subjectId, semester, setNumber, location.state]);

  useEffect(() => {
    renderMathJax();
  }, [currentQuestionIndex, questions]);

  const renderQuestionText = (text) => {
    const formattedText = formatLatex(text);
    return DOMPurify.sanitize(formattedText);
  };

  useEffect(() => {
    let timerId;
    if (timeLeft > 0 && !loading && questions.length > 0) {
      timerId = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && !loading && questions.length > 0) {
      handleSubmit();
    }
    return () => timerId && clearTimeout(timerId);
  }, [timeLeft, loading, questions.length, handleSubmit]);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  if (loading) {
    return (
      <Container>
        <LoadingView />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorView error={error} onBack={() => navigate(-1)} />
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container>
        <EmptyView onBack={() => navigate(-1)} />
      </Container>
    );
  }
  const formattedText = currentQuestion.questionText.replace(/\\/g, '\\\\');
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1, 
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
              <Typography variant="body1" fontFamily="Roboto Slab" fontSize={25}>
                Câu {currentQuestionIndex + 1} / {questions.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(answeredCount / questions.length) * 100}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Typography variant="body1" fontFamily={"Roboto Slab"}>
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
                fontFamily:"Roboto Slab",
                borderBottom: '2px solid',
                borderColor: 'primary.main'
              }}
            >
              Câu {currentQuestionIndex + 1}
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 4 }}>
              <div 
                className="math-tex" 
                dangerouslySetInnerHTML={{ 
                  __html: renderQuestionText(currentQuestion.questionText) 
                }} 
              />
            </Typography>

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={
                  selectedAnswers[currentQuestionIndex] !== undefined
                    ? selectedAnswers[currentQuestionIndex].toString()
                    : ''
                }
                onChange={(event) => {
                  const value = parseInt(event.target.value);
                  if (!isNaN(value)) {
                    handleAnswerChange(currentQuestionIndex, value);
                  }
                }}
              >
                <Grid container spacing={2}>
                  {currentQuestion.options.map((option, index) => (
                    <Grid item xs={12} key={index}>
                    <Paper
                        elevation={selectedAnswers[currentQuestionIndex] === index ? 3 : 1}
                        sx={{
                          p: 1.5,
                        transition: 'all 0.3s ease',
                          borderRadius: 2,
                        border: '1px solid',
                        borderColor:
                            selectedAnswers[currentQuestionIndex] === index
                              ? 'primary.main'
                              : 'grey.300',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box
                          onClick={() => handleAnswerChange(currentQuestionIndex, index)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            cursor: 'pointer',
                          }}
                        >   
                          <Typography
                            sx={{ marginRight: '8px', fontWeight: 'bold' }}
                            component="span"
                          >
                            {String.fromCharCode(65 + index)}
                              </Typography>

                          <Radio
                            checked={selectedAnswers[currentQuestionIndex] === index}
                            value={index.toString()} 
                            sx={{
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                          />

                          <Typography
                            component="div"
                            className="math-tex"
                            sx={{ marginLeft: '8px' }}
                            dangerouslySetInnerHTML={{
                              __html: renderQuestionText(option),
                            }}
                          />
                        </Box>
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
                sx={{ 
                  fontFamily:"Roboto Slab",
                }}
              >
                Trước đó
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                sx={{ 
                  fontFamily:"Roboto Slab",
                }}
              >
                Tiếp
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontFamily="Roboto Slab">
                Tổng quan bài làm
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  {questions.map((_, index) => (
                    <Grid item key={index}>
                      <Tooltip title={`Câu ${index + 1}`}>
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
                <Typography variant="subtitle2" gutterBottom fontSize={15} fontFamily={"Roboto Slab"} marginBottom={2}>
                  Chú thích
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
                    <Typography variant="body2" fontFamily={"Roboto Slab"}>Chưa làm</Typography>
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
                  fontFamily:"Roboto Slab",
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

const LoadingView = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress />
    <Typography>Đang tạo câu hỏi...</Typography>
  </Box>
);

const ErrorView = ({ error, onBack }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
      {error}
    </Alert>
    <Button
      variant="contained"
      onClick={onBack}
      startIcon={<ArrowBackIcon />}
    >
      Go Back
    </Button>
  </Box>
);

const EmptyView = ({ onBack }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh',
    flexDirection: 'column',
    gap: 2
  }}>
    <Alert severity="info" sx={{ width: '100%', maxWidth: 500 }}>
      No questions found for this subject and semester.
    </Alert>
    <Button
      variant="contained"
      onClick={onBack}
      startIcon={<ArrowBackIcon />}
    >
      Go Back
    </Button>
  </Box>
);

export default TestTaking;