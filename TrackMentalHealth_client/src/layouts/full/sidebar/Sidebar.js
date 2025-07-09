import { useMediaQuery, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import logo from '../../../assets/images/logos/TrackMentalHealthLogoAdmin1.svg';
import SidebarItems from './SidebarItems';
import { Upgrade } from './Updrade';

const MSidebar = (props) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const sidebarWidth = '270px';

  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '7px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#eff2f7',
      borderRadius: '15px',
    },
  };

  const SidebarContent = (
    <Box
      sx={{
        width: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        ...scrollbarStyles,
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <img src={logo} alt="logo" width="150" />
      </Box>

      <Divider />

      {/* Sidebar Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <SidebarItems />
      </Box>

      {/* Upgrade section at bottom (only for mobile or always if you want) */}
      <Box sx={{ p: 2 }}>
        {/* <Upgrade /> */}
      </Box>
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        variant="permanent"
        open={props.isSidebarOpen}
        PaperProps={{
          sx: {
            width: sidebarWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            ...scrollbarStyles,
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={props.isMobileSidebarOpen}
      onClose={props.onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      {SidebarContent}
    </Drawer>
  );
};

export default MSidebar;
