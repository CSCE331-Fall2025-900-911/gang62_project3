import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default function SessionsChart({ summary }) {
  const theme = useTheme();

  const fallbackData = Array.from({ length: 30 }, (_, i) => (i + 1) * 100);
  const days =
    summary && summary.days && summary.days.length > 0
      ? summary.days.map((d) => d.slice(5)) // show MM-DD
      : Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  const revenueSeries =
    summary && summary.dailyRevenue && summary.dailyRevenue.length > 0
      ? summary.dailyRevenue
      : fallbackData;

  const totalRevenue =
    summary && typeof summary.totalSales === 'number'
      ? summary.totalSales
      : revenueSeries.reduce((sum, v) => sum + v, 0);

  const first = revenueSeries[0] || 0;
  const last = revenueSeries[revenueSeries.length - 1] || 0;
  const changePercent =
    first > 0 ? (((last - first) / first) * 100).toFixed(0) : '0';

  const chipColor =
    Number(changePercent) > 0
      ? 'success'
      : Number(changePercent) < 0
      ? 'error'
      : 'default';

  const colorPalette = [theme.palette.primary.main];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Daily Revenue
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2,
              }).format(totalRevenue || 0)}
            </Typography>
            <Chip
              size="small"
              color={chipColor}
              label={`${Number(changePercent) >= 0 ? '+' : ''}${changePercent}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Revenue per day for the last 30 days
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: days,
              tickInterval: (index, i) => (i + 1) % 5 === 0,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: 'revenue',
              label: 'Revenue',
              showMark: false,
              curve: 'linear',
              area: true,
              data: revenueSeries,
            },
          ]}
          height={250}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-revenue': {
              fill: "url('#revenue-gradient')",
            },
          }}
          hideLegend
        >
          <AreaGradient color={theme.palette.primary.main} id="revenue-gradient" />
        </LineChart>
      </CardContent>
    </Card>
  );
}

SessionsChart.propTypes = {
  summary: PropTypes.shape({
    totalSales: PropTypes.number,
    days: PropTypes.arrayOf(PropTypes.string),
    dailyRevenue: PropTypes.arrayOf(PropTypes.number),
  }),
};
