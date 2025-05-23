import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import generateTestReport from './ReportGenerator';
import {renderMathContent, initMathJax } from '../utils/mathUtils';
import DOMPurify from 'dompurify';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Chip, 
  Button,
  Grid 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

function TestDetail() {
  const { testId } = useParams();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (testResult?.questionSet) {
      initMathJax();
    }
  }, [testResult]);

  useEffect(() => {
    const fetchTestDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/api/users/test-history/${testId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched testResult:", data);
        setTestResult(data);
      } catch (error) {
        console.error("Could not fetch test detail:", error);
        setError('Failed to load test detail.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetail();
  }, [testId]);

  const calculateScores = (questionSet) => {
    const correctAnswers = questionSet.filter(q => q.userAnswer === q.correctAnswer).length;
    const actualScore = correctAnswers * 0.25;
    const maxScore = questionSet.length * 0.25;
    return { correctAnswers, actualScore, maxScore };
  };

  const formatScore = (score) => {
    return score % 1 === 0 ? Math.floor(score) : score.toFixed(2);
  };

  const handleDownload = async () => {
    if (!testResult) return;

    try {
      const displayName = testResult.displayName;
      const { actualScore } = calculateScores(testResult.questionSet || []);

      const reportText = generateTestReport(
        testResult.subjectId?.name,
        testResult.classId?.name,
        displayName, 
        testResult.semester,
        testResult.setNumber,
        testResult.questionSet || [],
        testResult.timeSpent,
        actualScore, 
        testResult.totalQuestions
      );
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url;

      const subjectName = testResult.subjectId?.name || 'UnknownSubject';
      const className = testResult.classId?.name || 'UnknownClass';
      const dateString = testResult.date ? new Date(testResult.date).toISOString() : new Date().toISOString();
      a.download = `test_report_${subjectName}_${className}_${dateString}.txt`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Could not download test report:", error);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!testResult) return <div>Không tìm thấy lịch sử kiểm tra.</div>;

  const { correctAnswers, actualScore, maxScore } = calculateScores(testResult.questionSet || []);

  return (
    <Container maxWidth="md">
      <Box mt={8}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h4" gutterBottom fontFamily="Roboto Slab">
              Chi tiết kiểm tra
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Lưu kết quả
            </Button>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontFamily="Roboto Slab">
            Môn: {testResult.subjectId?.name} - {testResult.classId?.name}
          </Typography>
          <Typography variant="body1">
            Học kỳ: {testResult.semester}, Bộ đề số: {testResult.setNumber}
          </Typography>
          <Typography variant="body1">
            Ngày và giờ: {new Date(testResult.date).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            Điểm: {formatScore(actualScore)}
          </Typography>
          <Typography variant="body1">
            Thời gian làm bài: {Math.floor(testResult.timeSpent / 60)}:{(testResult.timeSpent % 60).toString().padStart(2, '0')}
          </Typography>
        </Paper>

        {testResult.questionSet && testResult.questionSet.map((question, index) => (
          <Paper elevation={1} sx={{ p: 2, mb: 2 }} key={index}>
            <Typography variant="h6">
              <div 
                className="math-tex"
                dangerouslySetInnerHTML={{ 
                  __html: renderMathContent(
                    `Câu ${index + 1}: ${question.questionText}`,
                    DOMPurify
                  ) 
                }} 
              />
            </Typography>
            <Box mt={1}>
              {question.options.map((option, optionIndex) => {
                const isSelected = question.userAnswer === optionIndex;
                const isCorrect = optionIndex === question.correctAnswer;
                return (
                  <Box key={optionIndex} sx={{ mb: 0.5 }}>
                    <Chip
                      label={
                        <div 
                          className="math-tex"
                          dangerouslySetInnerHTML={{ 
                            __html: renderMathContent(
                              `${String.fromCharCode(65 + optionIndex)}. ${option}`,
                              DOMPurify
                            ) 
                          }} 
                        />
                      }
                      color={isSelected ? (isCorrect ? "success" : "error") : "default"}
                      variant={isSelected ? "default" : "outlined"}
                    />
                    {isSelected && isCorrect && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 1, background:"success.main" }} >
                        Đáp án đúng
                      </Typography>
                    )}
                    {isSelected && !isCorrect && (
                      <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                        Bạn chọn
                      </Typography>
                    )}
                    {!isSelected && isCorrect && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                        Đáp án đúng
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}

export default TestDetail;