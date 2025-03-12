import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
} from '@mui/material';
import {
  Timer as TimerIcon,
  QuestionAnswer as QuestionIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function TestInstructions({ subjectName, questionCount, timeLimit }) {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = React.useState('');
  const [acceptedRules, setAcceptedRules] = React.useState(false);

  const testSteps = [
    'Đọc hướng dẫn',
    'Tuân thủ quy tắc',
    'Làm bài',
    'Nộp bài'
  ];

  const testRules = [
    'Không làm mới trang trong khi đang kiểm tra.',
    'Trả lời tất cả các câu hỏi trước khi thời gian kết thúc.',
    'Mỗi câu hỏi chỉ có một câu trả lời đúng.',
    'Có thể làm các câu hỏi với thứ tự bất kỳ',
    'Đảm bảo kết nối Internet ổn định trước khi bắt đầu.'
  ];

  const startTest = () => {
    if (!acceptedRules) {
      setMessage('Vui lòng chấp nhận các quy tắc kiểm tra trước khi bắt đầu.');
      return;
    }
    navigate(`/test/${subjectId}`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" gutterBottom>
            {subjectName}
          </Typography>
          <Typography variant="h5">
            Giới thiệu tổng quan 
          </Typography>
        </Paper>

        {message && <Alert severity="info" sx={{ mb: 4 }}>{message}</Alert>}

        <Stepper activeStep={0} sx={{ mb: 4 }}>
          {testSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QuestionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tổng quan bài kiểm tra</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <QuestionIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Số lượng câu hỏi" 
                    secondary={`${questionCount} câu`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimerIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Thời gian" 
                    secondary={`${timeLimit} phút`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Điều kiện đạt" 
                    secondary="60% hoặc cao hơn" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Quy tắc</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {testRules.map((rule, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={rule} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Checkbox
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
                color="primary"
              />
              <Typography>
                Tôi đã đọc và chấp nhận tất cả các quy tắc và hướng dẫn kiểm tra.
              </Typography>
            </Box>
          </Box>

          {isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={startTest}
              disabled={!acceptedRules}
              startIcon={<PlayArrowIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              Làm bài
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default TestInstructions;