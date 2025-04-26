import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material'; 
import Introduction from './components/Introduction';
import Login from './components/Login';
import TestHistory from './components/TestHistory';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import SubjectList from './components/SubjectList';
import SubjectDetail from './components/SubjectDetail'; 
import Account from './components/Account';
import SubjectQuestions from './components/SubjectQuestions';
import TestInstructions from './components/TestInstructions';
import TestTaking from './components/TestTaking';
import Results from './components/Results';
import TestDetail from './components/TestDetail';
import { useAuth } from './contexts/AuthContext';
import './styles/math.css';
import './styles/mui-overrides.css';
import './styles/main.css';
import './styles/test.css';
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideFooterRoutes = ['/login', '/register'];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <Header />
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        pb: shouldShowFooter ? 8 : 0,
        
      }}> 
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-history" element={<TestHistory />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/test-intro/:subjectId" element={<TestInstructions />} />
          <Route path="/account" element={<Account />} />
          <Route path="/questions/:subjectId" element={<SubjectQuestions />} />
          <Route path="/test/:subjectId" element={<TestTaking />} />
          <Route path="/results/:subjectId" element={<Results />} />
          <Route path="/test-history/:testId" element={<TestDetail />} />
          <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </Box>
      {shouldShowFooter && <Footer />}
    </Box>
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;