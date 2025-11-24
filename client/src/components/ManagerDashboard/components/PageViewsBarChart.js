import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

/**
 * PageViewsBarChart component that displays the top products by revenue
 * for the last 30 days using real dashboard analytics data when available.
 * Falls back to sample data so the chart still renders without an API.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.topItems] - Top-selling menu items with revenue and names
 * @author Michael Nguyen
 */
export default function PageViewsBarChart({ topItems }) {
  const theme = useTheme();
  const colorPalette = [(theme.vars || theme).palette.primary.main];

  const hasData = topItems && topItems.length > 0;

  const labels = hasData
    ? topItems.map((item) => item.name)
    : ['Milk Tea', 'Fruit Tea', 'Smoothies'];

  const values = hasData
    ? topItems.map((item) => item.totalRevenue)
    : [5000, 3500, 3000];

  const totalSales = hasData
    ? values.reduce((sum, v) => sum + v, 0)
    : 13500;

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Top Products by Revenue
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
                maximumFractionDigits: 0,
              }).format(totalSales)}
            </Typography>
            <Chip size="small" color="default" label={hasData ? 'Live data' : 'Sample'} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Revenue by menu item for the last 30 days
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: labels,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: 'revenue',
              label: 'Revenue',
              data: values,
            },
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}

PageViewsBarChart.propTypes = {
  topItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalRevenue: PropTypes.number.isRequired,
    })
  ),
};
