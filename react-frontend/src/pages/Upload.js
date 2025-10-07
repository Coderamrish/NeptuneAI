import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const Upload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        Upload Ocean Data
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Upload NetCDF Files
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              Upload ARGO NetCDF files for processing and analysis. Supported formats: .nc, .netcdf
            </Typography>
            
            <Box sx={{ border: '2px dashed rgba(255,255,255,0.3)', p: 4, textAlign: 'center', mb: 3 }}>
              <CloudUpload sx={{ fontSize: 48, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                Drag and drop files here or click to browse
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleFileUpload}
                disabled={isUploading}
                sx={{ 
                  bgcolor: 'rgba(52, 152, 219, 0.8)',
                  '&:hover': { bgcolor: 'rgba(52, 152, 219, 1)' }
                }}
              >
                {isUploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </Box>

            {isUploading && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                  Upload Progress: {uploadProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#3498db'
                    }
                  }}
                />
              </Box>
            )}

            {uploadProgress === 100 && (
              <Alert severity="success" sx={{ bgcolor: 'rgba(46, 204, 113, 0.2)', color: 'white' }}>
                Upload completed successfully!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Upload Guidelines
            </Typography>
            <Box sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Maximum file size: 100MB per file
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Supported formats: NetCDF (.nc, .netcdf)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Files will be automatically processed and indexed
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Processing time: 2–5 minutes per file
              </Typography>
              <Typography variant="body2">
                • You'll receive a notification when processing is complete
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;
