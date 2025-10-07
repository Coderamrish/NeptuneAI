import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';

const Datasets = () => {
  const datasets = [
    { id: 1, name: 'Indian Ocean ARGO', region: 'Indian Ocean', profiles: 5420, lastUpdate: '2024-01-15' },
    { id: 2, name: 'Pacific Deep Profiles', region: 'Pacific Ocean', profiles: 8230, lastUpdate: '2024-01-14' },
    { id: 3, name: 'Atlantic Currents', region: 'Atlantic Ocean', profiles: 4560, lastUpdate: '2024-01-13' },
    { id: 4, name: 'Southern Ocean Data', region: 'Southern Ocean', profiles: 3120, lastUpdate: '2024-01-12' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        Ocean Datasets
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Available Datasets
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dataset Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Region</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Profiles</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Update</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datasets.map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>{dataset.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={dataset.region} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(52, 152, 219, 0.2)',
                              color: 'white',
                              border: '1px solid rgba(52, 152, 219, 0.5)'
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>{dataset.profiles.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>{dataset.lastUpdate}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            sx={{ 
                              color: 'white',
                              borderColor: 'rgba(255,255,255,0.3)',
                              '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)'
                              }
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Datasets;
