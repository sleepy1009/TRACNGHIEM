import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function TestHistory() {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTestHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/test-history', {
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
            <Typography variant="h4" gutterBottom fontFamily="Roboto Slab">
                Lịch sử kiểm tra 
            </Typography>
            {testHistory.length === 0 ? (
                <Typography>No tests taken yet.</Typography>
            ) : (
                <List>
                    {testHistory.map((test) => (
                        <React.Fragment key={test._id}>
                            <ListItem>
                                <ListItemText
                                    primary={`${test.subjectId.name} - ${test.classId.name}`}
                                    secondary={
                                        <>
                                            Học kỳ: {test.semester}, Bộ đề số: {test.setNumber}
                                            <br />
                                            {`Ngày: ${new Date(test.date).toLocaleString()}`}
                                            <br />
                                            {`Điểm: ${test.score} / ${test.totalQuestions}`}
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
                    ))}
                </List>
            )}
        </Box>
    </Container>
);
}

export default TestHistory;