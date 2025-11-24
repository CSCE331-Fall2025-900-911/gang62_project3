import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        color="hsl(210, 98%, 42%)"
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

function renderStatus(status) {
  const colors = {
    Online: 'success',
    Offline: 'default',
  };

  return <Chip label={status} color={colors[status]} size="small" />;
}

export function renderAvatar(params) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns = [
  { field: 'itemName', headerName: 'Item Name', flex: 1.5, minWidth: 200 },
  {
    field: 'status',
    headerName: 'Stock Status',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value),
  },
  {
    field: 'sales',
    headerName: 'Sales',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'stockCount',
    headerName: 'Stock Count',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'price',
    headerName: 'Price',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
    valueFormatter: (value) => {
      if (value == null) {
        return '';
      }
      return `$${Number(value).toFixed(2)}`;
    },
  },
  {
    field: 'category',
    headerName: 'Category',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'trend',
    headerName: 'Sales Trend',
    flex: 1,
    minWidth: 150,
    renderCell: renderSparklineCell,
  },
];

export const rows = [
  {
    id: 1,
    itemName: 'Classic Milk Tea',
    status: 'Online',
    stockCount: 150,
    sales: 12423,
    price: 5.50,
    category: 'Milk Tea',
    trend: [
      469172, 488506, 592287, 617401, 640374, 632751, 668638, 807246, 749198, 944863,
      911787, 844815, 992022, 1143838, 1446926, 1267886, 1362511, 1348746, 1560533,
      1670690, 1695142, 1916613, 1823306, 1683646, 2025965, 2529989, 3263473,
      3296541, 3041524, 2599497,
    ],
  },
  {
    id: 2,
    itemName: 'Taro Milk Tea',
    status: 'Online',
    stockCount: 85,
    sales: 8240,
    price: 5.75,
    category: 'Milk Tea',
    trend: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      557488, 1341471, 2044561, 2206438,
    ],
  },
  {
    id: 3,
    itemName: 'Matcha Latte',
    status: 'Offline',
    stockCount: 0,
    sales: 5240,
    price: 6.00,
    category: 'Milk Tea',
    trend: [
      166896, 190041, 248686, 226746, 261744, 271890, 332176, 381123, 396435, 495620,
      520278, 460839, 704158, 559134, 681089, 712384, 765381, 771374, 851314, 907947,
      903675, 1049642, 1003160, 881573, 1072283, 1139115, 1382701, 1395655, 1355040,
      1381571,
    ],
  },
  {
    id: 4,
    itemName: 'Mango Green Tea',
    status: 'Online',
    stockCount: 200,
    sales: 9624,
    price: 5.25,
    category: 'Fruit Tea',
    trend: [
      264651, 311845, 436558, 439385, 520413, 533380, 562363, 533793, 558029, 791126,
      649082, 566792, 723451, 737827, 890859, 935554, 1044397, 1022973, 1129827,
      1145309, 1195630, 1358925, 1373160, 1172679, 1340106, 1396974, 1623641,
      1687545, 1581634, 1550291,
    ],
  },
  {
    id: 5,
    itemName: 'Passion Fruit Tea',
    status: 'Offline',
    stockCount: 10,
    sales: 4240,
    price: 5.25,
    category: 'Fruit Tea',
    trend: [
      251871, 262216, 402383, 396459, 378793, 406720, 447538, 451451, 457111, 589821,
      640744, 504879, 626099, 662007, 754576, 768231, 833019, 851537, 972306,
      1014831, 1027570, 1189068, 1119099, 987244, 1197954, 1310721, 1480816, 1577547,
      1854053, 1791831,
    ],
  },
  {
    id: 6,
    itemName: 'Strawberry Smoothie',
    status: 'Online',
    stockCount: 50,
    sales: 1524,
    price: 6.50,
    category: 'Smoothie',
    trend: [
      13671, 16918, 27272, 34315, 42212, 56369, 64241, 77857, 70680, 91093, 108306,
      94734, 132289, 133860, 147706, 158504, 192578, 207173, 220052, 233496, 250091,
      285557, 268555, 259482, 274019, 321648, 359801, 399502, 447249, 497403,
    ],
  },
  {
    id: 7,
    itemName: 'Brown Sugar Boba',
    status: 'Offline',
    stockCount: 5,
    sales: 3224,
    price: 6.25,
    category: 'Milk Tea',
    trend: [
      93682, 107901, 144919, 151769, 170804, 183736, 201752, 219792, 227887, 295382,
      309600, 278050, 331964, 356826, 404896, 428090, 470245, 485582, 539056, 582112,
      594289, 671915, 649510, 574911, 713843, 754965, 853020, 916793, 960158, 984265,
    ],
  },
  {
    id: 8,
    itemName: 'Thai Tea',
    status: 'Online',
    stockCount: 120,
    sales: 4824,
    price: 5.50,
    category: 'Milk Tea',
    trend: [
      52394, 63357, 82800, 105466, 128729, 144472, 172148, 197919, 212302, 278153,
      290499, 249824, 317499, 333024, 388925, 410576, 462099, 488477, 533956, 572307,
      591019, 681506, 653332, 581234, 719038, 783496, 911609, 973328, 1056071,
      1112940,
    ],
  },
  {
    id: 9,
    itemName: 'Oolong Milk Tea',
    status: 'Offline',
    stockCount: 0,
    sales: 1824,
    price: 5.50,
    category: 'Milk Tea',
    trend: [
      15372, 16901, 25489, 30148, 40857, 51136, 64627, 75804, 89633, 100407, 114908,
      129957, 143568, 158509, 174822, 192488, 211512, 234702, 258812, 284328, 310431,
      338186, 366582, 396749, 428788, 462880, 499125, 537723, 578884, 622825,
    ],
  },
  {
    id: 10,
    itemName: 'Lychee Jelly Tea',
    status: 'Online',
    stockCount: 90,
    sales: 2824,
    price: 5.75,
    category: 'Fruit Tea',
    trend: [
      70211, 89234, 115676, 136021, 158744, 174682, 192890, 218073, 240926, 308190,
      317552, 279834, 334072, 354955, 422153, 443911, 501486, 538091, 593724, 642882,
      686539, 788615, 754813, 687955, 883645, 978347, 1142551, 1233074, 1278155,
      1356724,
    ],
  },
  {
    id: 11,
    itemName: 'Black Tea Leaves (Bulk)',
    status: 'Online',
    stockCount: 500,
    sales: 0,
    price: 15.00,
    category: 'Tea Leaves',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 12,
    itemName: 'Green Tea Leaves (Bulk)',
    status: 'Online',
    stockCount: 450,
    sales: 0,
    price: 16.50,
    category: 'Tea Leaves',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 13,
    itemName: 'Brown Sugar Syrup',
    status: 'Online',
    stockCount: 200,
    sales: 0,
    price: 12.00,
    category: 'Syrups',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 14,
    itemName: 'Mango Syrup',
    status: 'Online',
    stockCount: 150,
    sales: 0,
    price: 11.50,
    category: 'Syrups',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 15,
    itemName: 'Whole Milk (Gallon)',
    status: 'Online',
    stockCount: 50,
    sales: 0,
    price: 4.50,
    category: 'Milk',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 16,
    itemName: 'Oat Milk (Carton)',
    status: 'Online',
    stockCount: 40,
    sales: 0,
    price: 5.50,
    category: 'Milk',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 17,
    itemName: 'Plastic Cups (16oz)',
    status: 'Online',
    stockCount: 1000,
    sales: 0,
    price: 0.10,
    category: 'Cups & Lids',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: 18,
    itemName: 'Dome Lids',
    status: 'Online',
    stockCount: 1200,
    sales: 0,
    price: 0.05,
    category: 'Cups & Lids',
    trend: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
];
