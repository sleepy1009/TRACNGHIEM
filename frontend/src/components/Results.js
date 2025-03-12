import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
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
    const { questions, selectedAnswers, timeLeft, score, totalQuestions, timeSpent } = location.state || {};
    const [subjectName, setSubjectName] = useState('');
    const [className, setClassName] = useState('');

    useEffect(() => {
        console.log('Questions:', questions);
        console.log('Selected Answers:', selectedAnswers);
    }, [questions, selectedAnswers]);

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
        const reportText = generateTestReport();
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

    const generateTestReport = () => {
        if (!questions || !Array.isArray(questions)) {
            console.error("Invalid questions data:", questions);
            return "Error: Invalid question data.";
        }
    
        let report = `Kết quả kiểm tra môn: ${subjectName} - ${className}\n`;
        report += `Ngày: ${new Date().toLocaleString()}\n`;
        report += `Số câu trả lời: ${questions.length} / ${questions.length}\n`;
        report += `Thời gian làm bài: ${formatTime(timeSpent)}\n`;
        report += `Score: ${score} / ${totalQuestions}\n\n`;
        report += `Đáp án và câu hỏi:\n\n`;
    
        questions.forEach((question, index) => {
            report += `Câu ${index + 1}: ${question.questionText}\n`;
            question.options.forEach((option, optionIndex) => {
                const isSelected = question.userAnswer === optionIndex;
                const isCorrect = question.correctAnswer === optionIndex;
                const prefix = isSelected ? '[X]' : '[ ]';
                const suffix = isCorrect ? ' [Đáp án đúng]' : '';
                report += `${prefix} ${String.fromCharCode(65 + optionIndex)}. ${option}${suffix}\n`;
            });
            report += '\n';
        });
    
        return report;
    };  

    const getScoreColor = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return 'success.main';
        if (percentage >= 60) return 'warning.main';
        return 'error.main';
    };

    const getScoreMessage = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return 'Hoàn hảo!';
        if (percentage >= 60) return 'Tốt!';
        return 'Hãy luyện tập thêm!';
    };

    const isAnswerCorrect = (question) => {
        return question.userAnswer === question.correctAnswer;
    };
    
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mr: 2 }}
                    >
                        Quay lại trang chủ
                    </Button>
                    <Typography variant="h4" sx={{ flex: 1 }}>
                        Kết quả kiểm tra
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleSave}
                        sx={{ 
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        }}
                    >
                        Lưu kết quả
                    </Button>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={(score / totalQuestions) * 100}
                                        size={100}
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
                                    Score: {score} / {totalQuestions}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ py: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">
                                        {subjectName}
                                    </Typography>
                                </Box>
                                <Typography color="text.secondary" gutterBottom>
                                    {className}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Ngày: {new Date().toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ py: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <TimeIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">
                                        Thống kê thời gian
                                    </Typography>
                                </Box>
                                <Typography variant="body1" gutterBottom>
                                    Thời gian làm bài: {formatTime(timeSpent)}
                                </Typography>
                                <Typography variant="body1">
                                    Thời gian còn lại: {formatTime(timeLeft)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Typography variant="h5" sx={{ mb: 3 }}>
                    Đánh giá chi tiết
                </Typography>

                {questions && questions.map((question, index) => {
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
                                {question.questionText}
                            </Typography>

                            <Grid container spacing={1}>
                                {question.options.map((option, optionIndex) => {
                                    const isSelected = question.userAnswer === optionIndex;
                                    const isCorrectOption = question.correctAnswer === optionIndex;
                                    
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
                                                    {String.fromCharCode(65 + optionIndex)}. {option}
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