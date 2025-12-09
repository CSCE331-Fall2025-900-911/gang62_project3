import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Copyright from '../internals/components/Copyright';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import { rows as initialRows } from '../internals/data/gridData';

const API_BASE_URL =  process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Manager dashboard home grid component.
 * Fetches analytics data (summary metrics and top items) from the API and
 * renders overview statistic cards, charts, and a detailed data grid.
 *
 * Falls back to local demo data if the API is unavailable.
 *
 * @component
 * @author Michael Nguyen
 */
export default function MainGrid() {
  const [allRows, setAllRows] = React.useState(initialRows);
  const [filteredRows, setFilteredRows] = React.useState(initialRows);
  const [summary, setSummary] = React.useState(null);
  const [topItems, setTopItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    /**
     * Fetches dashboard summary statistics and top-selling items from the backend.
     * Populates local state used to render the overview cards, charts, and data grid.
     *
     * Falls back to static demo rows if the API request fails.
     *
     * @returns {Promise<void>} Promise that resolves when dashboard data is loaded
     * @throws {Error} Logged and stored in state if the API request fails
     * @author Michael Nguyen
     */
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, topItemsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/summary`),
          fetch(`${API_BASE_URL}/api/dashboard/top-items`),
        ]);

        if (!summaryRes.ok) {
          throw new Error('Failed to fetch dashboard summary');
        }
        if (!topItemsRes.ok) {
          throw new Error('Failed to fetch top items');
        }

        const summaryData = await summaryRes.json();
        const topItemsData = await topItemsRes.json();

        setSummary(summaryData);
        setTopItems(topItemsData.items || []);

        const rowsFromApi = (topItemsData.items || []).map((item) => {
          return {
            id: item.id,
            itemName: item.name,
            status: 'Online',
            sales: item.totalRevenue,
            stockCount: item.quantitySold,
            price: item.basePrice,
            category: item.drinkType ? item.drinkType.trim() : 'Other',
          };
        });

        const effectiveRows = rowsFromApi.length > 0 ? rowsFromApi : initialRows;
        setAllRows(effectiveRows);
        setFilteredRows(effectiveRows);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
        setAllRows(initialRows);
        setFilteredRows(initialRows);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /**
   * Builds configuration objects for the overview `StatCard` components
   * derived from the loaded dashboard summary data.
   *
   * If no summary is available yet, returns neutral, zero-valued cards.
   *
   * @returns {Array<Object>} Array of card configuration objects for `StatCard`
   * @author Michael Nguyen
   */
  const buildCardsData = () => {
    if (!summary) {
      return [
        {
          title: 'Total Sales',
          value: '$0.00',
          interval: 'Last 30 days',
          trend: 'neutral',
          data: [],
        },
        {
          title: 'Orders',
          value: '0',
          interval: 'Last 30 days',
          trend: 'neutral',
          data: [],
        },
        {
          title: 'Avg. Order Value',
          value: '$0.00',
          interval: 'Last 30 days',
          trend: 'neutral',
          data: [],
        },
      ];
    }

    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });

    return [
      {
        title: 'Total Sales',
        value: currencyFormatter.format(summary.totalSales || 0),
        interval: 'Last 30 days',
        trend: 'neutral',
        data: summary.dailyRevenue || [],
      },
      {
        title: 'Orders',
        value: String(summary.orderCount || 0),
        interval: 'Last 30 days',
        trend: 'neutral',
        data: summary.dailyOrders || [],
      },
      {
        title: 'Avg. Order Value',
        value: currencyFormatter.format(summary.avgOrderValue || 0),
        interval: 'Last 30 days',
        trend: 'neutral',
        data: summary.dailyAvgOrderValue || [],
      },
    ];
  };

  /**
   * Handles selection changes from the side tree view and filters the
   * data grid rows by the corresponding mapped category group.
   *
   * @param {string} selectedLabel - The label of the selected tree node
   * @author Michael Nguyen
   */
  const handleTreeSelection = (selectedLabel) => {
    if (!selectedLabel) {
      setFilteredRows(allRows);
      return;
    }

    // Map tree labels to data categories
    const categoryMap = {
      'Milk Tea': 'milk tea',
      'Coffee': 'coffee',
      'Blended': 'blended',
      'Matcha': 'matcha',
      'Fruit': 'fruit',
      'Toppings': 'extras',
      'Boba': 'extras',
      'Jelly': 'extras',
      'Pudding': 'extras',
      'Tea Leaves': 'Tea Leaves',
      'Syrups': 'Syrups',
      'Milk': 'Milk',
      'Cups & Lids': 'Cups & Lids',
    };

    const mappedCategory = categoryMap[selectedLabel];

    if (mappedCategory) {
      const newRows = allRows.filter((row) => {
        const match = row.category?.toLowerCase().trim() === mappedCategory.toLowerCase().trim();
        return match;
      });
      setFilteredRows(newRows);
    } else if (selectedLabel === 'Menu') {
      const menuCategories = ['flavored tea', 'milk tea', 'coffee', 'blended', 'matcha', 'fruit', 'extras'];
      const newRows = allRows.filter((row) => menuCategories.includes(row.category?.toLowerCase().trim()));
      setFilteredRows(newRows);
    } else if (selectedLabel === 'Inventory') {
      const inventoryCategories = ['Tea Leaves', 'Syrups', 'Milk', 'Cups & Lids'];
      const newRows = allRows.filter((row) => inventoryCategories.includes(row.category));
      setFilteredRows(newRows);
    } else if (selectedLabel === 'All Items') {
      setFilteredRows(allRows);
    } else {
      setFilteredRows(allRows);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data: {error}
        </Alert>
      </Box>
    );
  }

  const cardsData = buildCardsData();

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {cardsData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart summary={summary} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart topItems={topItems} />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Details
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid rows={filteredRows} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <CustomizedTreeView onSelectionChange={handleTreeSelection} />
          </Stack>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
