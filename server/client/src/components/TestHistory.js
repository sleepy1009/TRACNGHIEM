import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function TestHistory() {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const API = process.env.REACT_APP_API_URL;

  const calculateNewScore = (test) => {
    const correctAnswers = test.questionSet.filter(q => q.userAnswer === q.correctAnswer).length;
    const actualScore = correctAnswers * 0.25;
    const maxPossibleScore = test.totalQuestions * 0.25;
    return { actualScore, maxPossibleScore, correctAnswers };
  };

  const formatScore = (score) => {
    return score % 1 === 0 ? Math.floor(score) : score.toFixed(2);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTestHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('${API}/api/users/test-history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if(response.status === 401){
            logout();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTestHistory(data);
      } catch (error) {
        console.error("Could not fetch test history:", error);
        setError('Failed to load test history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, [logout]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="md">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom fontFamily="Roboto Slab" sx={{ 
          borderRadius: 2,
          border: "1px solid black",
          p: 1,
          display: 'inline-block',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }} >
          Lịch sử kiểm tra 
        </Typography>
        {testHistory.length === 0 ? (
          <Typography>No tests taken yet.</Typography>
        ) : (
          <List>
            {testHistory.map((test) => {
              const { actualScore, maxPossibleScore, correctAnswers } = calculateNewScore(test);
              return (
                <React.Fragment key={test._id}>
                  <ListItem>
                    <ListItemText
                      primary={`${test.subjectId.name} - ${test.classId.name}`}
                      secondary={
                        <>
                          Học kỳ: {test.semester}, Bộ đề số: {test.setNumber}
                          <br />
                          {`Ngày và giờ: ${new Date(test.date).toLocaleString()}`}
                          <br />
                          {`Điểm: ${formatScore(actualScore)}`}
                        </>
                      }
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      component={Link}
                      to={`/test-history/${test._id}`}
                    >
                      Chi tiết
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Container>
  );
}

export default TestHistory;