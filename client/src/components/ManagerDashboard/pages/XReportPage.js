import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function XReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentHourRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    const end = new Date(now);
    end.setMinutes(59, 59, 999);
    
    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const isZReportGenerated = window.isZReportGenerated || window.isXReportReset || false;

  const getCurrentDate = () => {
    return new Date().toLocaleDateString();
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reports/x-report`);
        if (!response.ok) {
          throw new Error('Failed to fetch X Report');
        }
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching X Report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isZReportGenerated) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [isZReportGenerated]);

  const StatCard = ({ title, value, subtext }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
        {subtext && (
          <Typography variant="body2" color="text.secondary">
            {subtext}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const data = (isZReportGenerated ? null : reportData) || {
    revenue: 0,
    taxes: 0,
    profit: 0,
    orderCount: 0,
    topEmployee: "N/A",
    mostPopularItem: "N/A",
    lowStockItem: "N/A"
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DescriptionRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1">
            X Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Report Date: {getCurrentDate()} (Since Midnight) | Current Hour: {getCurrentHourRange()}
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Revenue" value={`$${data.revenue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Taxes" value={`$${data.taxes.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Profit (Est.)" value={`$${data.profit.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Orders" value={data.orderCount} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Top Employee" value={data.topEmployee} subtext={isZReportGenerated ? "" : "Based on orders handled"} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Most Popular Item" value={data.mostPopularItem} subtext={isZReportGenerated ? "" : "Highest quantity sold"} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Low Stock Item" value={data.lowStockItem} subtext={isZReportGenerated ? "" : "Needs restocking soon"} />
        </Grid>
      </Grid>
    </Box>
  );
}
