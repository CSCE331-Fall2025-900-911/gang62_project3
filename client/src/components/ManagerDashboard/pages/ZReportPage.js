import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Global variable to track Z-Report status across component mounts (simulating daily session)
if (window.isZReportGenerated === undefined) {
  window.isZReportGenerated = false;
}

export default function ZReportPage() {
  const [message, setMessage] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const zeroData = {
      revenue: 0,
      taxes: 0,
      profit: 0,
      orderCount: 0,
      topEmployee: "N/A",
      mostPopularItem: "N/A",
      lowStockItem: "N/A"
    };

    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reports/z-report`);
        if (!response.ok) {
          throw new Error('Failed to fetch Z Report');
        }
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching Z Report:', error);
        setReportData(zeroData);
      } finally {
        setLoading(false);
      }
    };

    if (window.isZReportGenerated) {
      // Already generated
      setReportData(zeroData);
      setMessage("The Z-report has already been generated today.");
      setLoading(false);
    } else {
      const now = Date.now();
      const lastView = window.lastZReportViewTime;

      // If visited before (and more than 1 second ago to avoid strict mode double-mount), generate report
      if (lastView && (now - lastView > 1000)) {
        window.isZReportGenerated = true;
        setReportData(zeroData);
        setMessage("The Z-report has been generated for today. All daily totals have been reset to 0.");
        setLoading(false);
      } else {
        // First visit (or rapid re-mount)
        window.lastZReportViewTime = now;
        window.isXReportReset = true;
        // Fetch real data
        fetchReport();
      }
    }
  }, []);

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

  const data = reportData || {
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SummarizeRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Z Report
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Daily Closing Report (Since Midnight)
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {message && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Revenue" value={`$${data.revenue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Taxes" value={`$${data.taxes.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Profit (Est.)" value={`$${data.profit.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Orders" value={data.orderCount} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Top Employee" value={data.topEmployee} subtext="Based on orders handled" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Most Popular Item" value={data.mostPopularItem} subtext="Highest quantity sold" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Low Stock Item" value={data.lowStockItem} subtext="Needs restocking soon" />
        </Grid>
      </Grid>
    </Box>
  );
}
