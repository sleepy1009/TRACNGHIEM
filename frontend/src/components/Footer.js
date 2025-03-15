import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider 
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import X from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Footer() {
  const currentYear = new Date().getFullYear();

  const quizLinks = [
    {
      name: "Hocmai",
      url: "https://hocmai.vn/",
      description: " "
    },
    {
      name: "Khan Academy",
      url: "https://www.khanacademy.org/",
      description: " "
    },
    {
      name: "Hoc247",
      url: "https://hoc247.vn/",
      description: " "
    },
    {
      name: "Violympic",
      url: "https://violympic.vn/",
      description: " "
    },
    {
      name: "Ebook.edu",
      url: "https://doc.edu.vn/",
      description: " "
    }
  ];

  

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        pt: 8, 
        pb: 4, 
        mt: 'auto',
        position: 'relative', 
        '&::before': { 
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Trang web học tập khác
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quizLinks.map((link, index) => (
                <Box key={index}>
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        opacity: 0.8,
                        transform: 'translateX(5px)'
                      },
                      display: 'block'
                    }}
                  >
                    {link.name}
                  </Link>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {link.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Truy cập nhanh 
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      textDecoration: 'underline',
                      opacity: 0.8,
                      transform: 'translateX(5px)'
                    },
                    display: 'block'
                  }}
                >
                  Trang chủ
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Liên hệ 
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2">support@quizwebsite.com</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Theo dõi 
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="X">
                <X />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <Box sx={{ 
          textAlign: 'center',
          pt: 3,
          pb: 2 
        }}>
          <Typography variant="body2" color="inherit">
            © {currentYear} Quiz Website. All rights reserved.
          </Typography>
          <Box sx={{ mt: 1 }}>
            {/*
            <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
              Terms of Service
            </Link>
            <Link href="/help" color="inherit" sx={{ mx: 1 }}>
              Help Center
            </Link>
            */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;