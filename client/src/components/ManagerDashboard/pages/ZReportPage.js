import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

// Global variable to track Z-Report status across component mounts (simulating daily session)
if (window.isZReportGenerated === undefined) {
  window.isZReportGenerated = false;
}

export default function ZReportPage() {
  const [message, setMessage] = useState("");
  const [reportData, setReportData] = useState({
    revenue: 5430.25,
    taxes: 447.99,
    profit: 3801.15,
    orderCount: 215,
    topEmployee: "Sarah Jenkins",
    mostPopularItem: "Double Cheeseburger",
    lowStockItem: "Napkins (Pack)"
  });

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
    if (window.isZReportGenerated) {
      // Already generated
      setReportData(zeroData);
      setMessage("The Z-report has already been generated today.");
    } else {
      const now = Date.now();
      const lastView = window.lastZReportViewTime;

      // If visited before (and more than 1 second ago to avoid strict mode double-mount), generate report
      if (lastView && (now - lastView > 1000)) {
        window.isZReportGenerated = true;
        setReportData(zeroData);
        setMessage("The Z-report has been generated for today. All daily totals have been reset to 0.");
      } else {
        // First visit (or rapid re-mount)
        window.lastZReportViewTime = now;
        window.isXReportReset = true;
        // Show default data
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
              Daily Closing Report
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
          <StatCard title="Total Revenue" value={`$${reportData.revenue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Taxes" value={`$${reportData.taxes.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Profit" value={`$${reportData.profit.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Orders" value={reportData.orderCount} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Top Employee" value={reportData.topEmployee} subtext={window.isZReportGenerated ? "" : "Based on orders handled"} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Most Popular Item" value={reportData.mostPopularItem} subtext={window.isZReportGenerated ? "" : "Highest quantity sold"} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Low Stock Item" value={reportData.lowStockItem} subtext={window.isZReportGenerated ? "" : "Needs restocking soon"} />
        </Grid>
      </Grid>
    </Box>
  );
}
