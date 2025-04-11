import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import generateTestReport from './ReportGenerator';
import { formatLatex, renderMathContent, initMathJax } from '../utils/mathUtils';
import DOMPurify from 'dompurify';
import { keyframes } from '@mui/system';

import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

function Results() {
    const { subjectId } = useParams();
    const location = useLocation();
    const { questions, selectedAnswers, timeLeft, score, totalQuestions, timeSpent, semester, setNumber } = location.state || {};
    const [subjectName, setSubjectName] = useState('');
    const [className, setClassName] = useState('');
    const { user } = useAuth();


    useEffect(() => {
        window.scrollTo(0, 0);
        if (questions) {
            initMathJax();
            const validatedQuestions = questions.map(question => ({
                ...question,
                correctAnswer: parseInt(question.correctAnswer),
                userAnswer: parseInt(question.userAnswer)
            }));
            
            console.log('Validated questions:', validatedQuestions);
        }
    }, [questions]);

    useEffect(() => {
        const fetchSubjectName = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/subjects/${subjectId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setSubjectName(data.name);
                setClassName(data.classId?.name || "Unknown Class");
            } catch (error) {
                console.error("Could not fetch subject name:", error);
                setSubjectName('Unknown Subject');
            }
        };

        fetchSubjectName();
    }, [subjectId]);

    if (!questions || !selectedAnswers) {
        return <div>Error: No test data found.</div>;
    }

    

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleSave = () => {
        const displayName = user?.displayName || localStorage.getItem("displayName") || "Unknown User"
        const reportText = generateTestReport(subjectName, className, displayName, semester, setNumber, questions, timeSpent, score, totalQuestions);
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test_report_${subjectName}_${className}_${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    

    const getScoreColor = (score, total) => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 80) return 'success.main';
        if (percentage >= 60) return 'warning.main';
        return 'error.main';
    };

    const getScoreMessage = (score, total) => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 80) return 'Hoàn hảo!';
        if (percentage >= 60) return 'Tốt!';
        return 'Hãy luyện tập thêm!';
    };

    const isAnswerCorrect = (question) => {
        const correctAnswer = parseInt(question.correctAnswer);
        const userAnswer = parseInt(question.userAnswer);
        return !isNaN(correctAnswer) && !isNaN(userAnswer) && correctAnswer === userAnswer;
    };
    
    
    
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mr: 2 ,fontFamily:"Roboto Slab",fontSize:20 }}
                    >
                        Quay lại trang chủ
                    </Button>
                    
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleSave}
                        
                        sx={{ 
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            marginLeft:'735px',
                            fontFamily:"Roboto Slab",
                            fontSize:20,
                        }}
                    >
                        Lưu kết quả
                    </Button>
                </Box>
                <Typography variant="h4" sx={{ flex: 1,padding:1, fontFamily:"Roboto Slab"}}>
                        Kết quả kiểm tra
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ textAlign: 'center', py: 3, minHeight:250, backgroundColor: "#fcfcfc",border:1, borderColor:"#cccccc" }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={(score / totalQuestions) * 100}
                                        size={120}
                                        thickness={4}
                                        sx={{ color: getScoreColor(score, totalQuestions) }}
                                    />
                                    <Box
                                        sx={{
                                            top: 0,
                                            left: 0,
                                            bottom: 0,
                                            right: 0,
                                            position: 'absolute',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="h4" component="div" color="text.secondary">
                                            {Math.round((score / totalQuestions) * 100)}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    {getScoreMessage(score, totalQuestions)}
                                </Typography>
                                <Typography color="text.secondary">
                                    Số câu đúng: {score} / {totalQuestions}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ py: 3, minHeight:250, backgroundColor: "#fcfcfc",border:1, borderColor:"#cccccc"}}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight={"bold"}>
                                        {subjectName} - {className}
                                    </Typography>
                                </Box>
                                
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1" color="text.secondary" >
                                    Học kỳ: {semester} <br></br>
                                    Bộ đề số: {setNumber} <br></br>
                                    Ngày: {new Date().toLocaleDateString()}
                                    
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ py: 3, minHeight:250, backgroundColor: "#fcfcfc",border:1, borderColor:"#cccccc" }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <TimeIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight={"bold"}>
                                        Thống kê thời gian
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1" color="text.secondary">
                                    Thời gian làm bài: {formatTime(timeSpent)}<br></br>
                                    Thời gian còn lại: {formatTime(timeLeft)}
                                </Typography>
                               
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Typography variant="h5" sx={{ mb: 3, fontWeight:"bold" }}>
                    Đánh giá chi tiết
                </Typography>

                {questions && questions.map((question, index) => {
                    const correctAnswer = parseInt(question.correctAnswer);
                    const userAnswer = parseInt(question.userAnswer);
                    const isCorrect = isAnswerCorrect(question);
                    
                    return (
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                p: 3, 
                                mb: 3,
                                borderLeft: '4px solid',
                                borderColor: isCorrect ? 'success.main' : 'error.main'
                            }}
                            key={question.questionId || index}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {isCorrect ? (
                                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                ) : (
                                    <CancelIcon color="error" sx={{ mr: 1 }} />
                                )}
                                <Typography variant="h6">
                                    Câu {index + 1}
                                </Typography>
                            </Box>

                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <div 
                                className="math-tex"
                                dangerouslySetInnerHTML={{ 
                                    __html: renderMathContent(question.questionText, DOMPurify) 
                                }} 
                                />
                            </Typography>

                            <Grid container spacing={1}>
                                {question.options.map((option, optionIndex) => {
                                    const isSelected = userAnswer === optionIndex;
                                    const isCorrectOption = correctAnswer === optionIndex;
                                    
                                    return (
                                        <Grid item xs={12} key={optionIndex}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    backgroundColor: isCorrectOption 
                                                        ? 'success.light'
                                                        : (isSelected && !isCorrectOption)
                                                            ? 'error.light'
                                                            : 'transparent',
                                                    borderColor: isCorrectOption 
                                                        ? 'success.main'
                                                        : (isSelected && !isCorrectOption)
                                                            ? 'error.main'
                                                            : 'grey.300'
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{ 
                                                        flex: 1,
                                                        color: (isCorrectOption || (isSelected && !isCorrectOption)) 
                                                            ? 'white' 
                                                            : 'text.primary'
                                                    }}
                                                >
                                                    <div 
                                                        className="math-tex"
                                                        dangerouslySetInnerHTML={{ 
                                                        __html: renderMathContent(
                                                            `${String.fromCharCode(65 + optionIndex)}. ${option}`,
                                                            DOMPurify
                                                        ) 
                                                        }} 
                                                    />
                                                </Typography>
                                                {isSelected && (
                                                    <Chip 
                                                        label="Bạn chọn" 
                                                        size="small"
                                                        color={isCorrectOption ? "success" : "error"}
                                                        sx={{ ml: 1 }}
                                                    />
                                                )}
                                                {isCorrectOption && !isSelected && (
                                                    <Chip 
                                                        label="Đáp án đúng" 
                                                        size="small"
                                                        color="success"
                                                        sx={{ ml: 1 }}
                                                    />
                                                )}
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Paper>
                    );
                })}
            </Box>
        </Container>
    );
}

export default Results;