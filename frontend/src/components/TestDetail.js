import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  useEffect(() => {
    const fetchTestDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/users/test-history/${testId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/test-history/${testId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${testId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Could not download test report:", error);
    }
  };

  if (loading) return <div>Loading test details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!testResult) return <div>Test result not found.</div>;

  return (
    <Container maxWidth="md">
      <Box mt={8}>
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h4" gutterBottom>
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
          <Typography variant="h6">
            Môn: {testResult.subjectId.name} - {testResult.classId.name}
          </Typography>
          <Typography variant="body1">
            Ngày: {new Date(testResult.date).toLocaleString()}
          </Typography>
          <Typography variant="body1">
            Score: {testResult.score} / {testResult.totalQuestions}
          </Typography>
          <Typography variant="body1">
            Thời gian làm bài: {Math.floor(testResult.timeSpent / 60)}:{(testResult.timeSpent % 60).toString().padStart(2, '0')}
          </Typography>
        </Paper>

        {testResult.questionSet && testResult.questionSet.map((question, index) => (
          <Paper elevation={1} sx={{ p: 2, mb: 2 }} key={index}>
            <Typography variant="h6">
              Câu {index + 1}: {question.questionText}
            </Typography>
            <Box mt={1}>
              {question.options.map((option, optionIndex) => {
                const isSelected = question.userAnswer === optionIndex;
                const isCorrect = optionIndex === question.correctAnswer;
                return (
                  <Box key={optionIndex} sx={{ mb: 0.5 }}>
                    <Chip
                      label={`${String.fromCharCode(65 + optionIndex)}. ${option}`}
                      color={isSelected ? (isCorrect ? "success" : "error") : "default"}
                      variant={isSelected ? "default" : "outlined"}
                    />
                    {isSelected && isCorrect && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
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