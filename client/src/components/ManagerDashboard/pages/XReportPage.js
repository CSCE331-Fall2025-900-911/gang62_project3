import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

export default function XReportPage() {
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

  const fakeData = isZReportGenerated ? {
    revenue: 0,
    taxes: 0,
    profit: 0,
    orderCount: 0,
    topEmployee: "N/A",
    mostPopularItem: "N/A",
    lowStockItem: "N/A"
  } : {
    revenue: 1250.50,
    taxes: 103.17,
    profit: 850.25,
    orderCount: 45,
    topEmployee: "Sarah Jenkins",
    mostPopularItem: "Double Cheeseburger",
    lowStockItem: "Napkins (Pack)"
  };

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DescriptionRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1">
            X Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Current Hour Period: {getCurrentHourRange()}
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Recent Revenue" value={`$${fakeData.revenue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Recent Taxes" value={`$${fakeData.taxes.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Recent Profit" value={`$${fakeData.profit.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Recent Orders" value={fakeData.orderCount} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Top Employee" value={fakeData.topEmployee} subtext={isZReportGenerated ? "" : "Based on orders handled"} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Most Popular Item" value={fakeData.mostPopularItem} subtext={isZReportGenerated ? "" : "Highest quantity sold"} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Low Stock Item" value={fakeData.lowStockItem} subtext={isZReportGenerated ? "" : "Needs restocking soon"} />
        </Grid>
      </Grid>
    </Box>
  );
}
