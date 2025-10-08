import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Error,
  FileUpload,
  Description,
  TableChart,
  BarChart,
  Map,
  Download,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${selectedFiles.length} file(s) selected`);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading' } : f
        ));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(progress);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }

        // Simulate successful upload
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
        ));

        // Add to uploaded files
        setUploadedFiles(prev => [...prev, {
          id: file.id,
          name: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          status: 'success',
        }]);

        toast.success(`${file.name} uploaded successfully`);
      }

      setUploadStatus('success');
      setFiles([]);
      toast.success('All files uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setUploadProgress(0);
    setUploadStatus('idle');
    toast.success('All files cleared');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('csv') || fileType.includes('excel')) {
      return <TableChart />;
    } else if (fileType.includes('json')) {
      return <BarChart />;
    } else if (fileType.includes('geojson') || fileType.includes('kml')) {
      return <Map />;
    } else {
      return <Description />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'uploading': return <CircularProgress size={16} />;
      default: return <FileUpload />;
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
              Upload Ocean Data 📁
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload your ocean data files for analysis and visualization
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Upload Area */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUpload color="primary" />
                  Upload Files
                </Typography>
                
                {/* Drop Zone */}
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed #1976d2',
                    borderRadius: 2,
                    bgcolor: 'rgba(25, 118, 210, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      borderColor: '#1565c0',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>
                    Drop files here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Support CSV, JSON, Excel, GeoJSON, and other data formats
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FileUpload />}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.json,.xlsx,.xls,.geojson,.kml,.txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </Paper>

                {/* Upload Progress */}
                {uploading && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Uploading files... {uploadProgress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                {/* Upload Status */}
                {uploadStatus === 'success' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    All files uploaded successfully!
                  </Alert>
                )}
                {uploadStatus === 'error' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Upload failed. Please try again.
                  </Alert>
                )}

                {/* File List */}
                {files.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Selected Files ({files.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleClearAll}
                      >
                        Clear All
                      </Button>
                    </Box>
                    <List>
                      {files.map((file) => (
                        <ListItem key={file.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <ListItemIcon>
                            {getFileIcon(file.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={file.name}
                            secondary={`${formatFileSize(file.size)} • ${file.type}`}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {file.status === 'uploading' && (
                              <Box sx={{ width: 100 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={file.progress} 
                                  size="small"
                                />
                              </Box>
                            )}
                            <Chip
                              icon={getStatusIcon(file.status)}
                              label={file.status}
                              color={getStatusColor(file.status)}
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(file.id)}
                              disabled={file.status === 'uploading'}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Upload Button */}
                {files.length > 0 && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                      sx={{ flexGrow: 1 }}
                    >
                      {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Uploaded Files & Info */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Uploaded Files */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" />
                  Recently Uploaded
                </Typography>
                {uploadedFiles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No files uploaded yet
                  </Typography>
                ) : (
                  <List dense>
                    {uploadedFiles.slice(0, 5).map((file) => (
                      <ListItem key={file.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getFileIcon(file.type || 'text/plain')}
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleDateString()}`}
                        />
                        <Chip
                          icon={<CheckCircle />}
                          label="Uploaded"
                          color="success"
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" />
                  Supported Formats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { format: 'CSV', description: 'Comma-separated values', icon: <TableChart /> },
                    { format: 'JSON', description: 'JavaScript Object Notation', icon: <BarChart /> },
                    { format: 'Excel', description: 'Microsoft Excel files', icon: <TableChart /> },
                    { format: 'GeoJSON', description: 'Geographic data format', icon: <Map /> },
                    { format: 'KML', description: 'Keyhole Markup Language', icon: <Map /> },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.format}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Upload;