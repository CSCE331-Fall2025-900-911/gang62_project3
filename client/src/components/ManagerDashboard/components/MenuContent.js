import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon /> },
  { text: 'Inventory', icon: <InventoryRoundedIcon /> },
  { text: 'Cashier View', icon: <PointOfSaleRoundedIcon /> },
  { text: 'Employees', icon: <PeopleRoundedIcon /> },
  { text: 'X Report', icon: <DescriptionRoundedIcon /> },
  { text: 'Z Report', icon: <SummarizeRoundedIcon /> },
  { text: 'Sales Report', icon: <AssessmentRoundedIcon /> },
];

export default function MenuContent({ activePage, setActivePage }) {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={activePage === item.text}
              onClick={() => setActivePage(item.text)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
