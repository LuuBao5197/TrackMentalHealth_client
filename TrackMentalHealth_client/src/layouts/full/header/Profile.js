import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { IconListCheck, IconMail, IconUser } from '@tabler/icons-react';
import ProfileImg from 'src/assets/images/profile/user-1.jpg';

const Profile = () => {
  const userRole = useSelector((state) => state.auth.user);

  const [anchorEl2, setAnchorEl2] = useState(null);
  const navigate = useNavigate();

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  // const handleMyProfile = () => {
  //   const user = JSON.parse(localStorage.getItem('user'));
  //   console.log("User object: ", user); // Kiểm tra ID
  //   if (user && user.id) {
  //     navigate(`/admin/users/profile/${user.id}`); // ✅ Không có console.log() ở đây
  //   } else {
  //     alert("User ID not found in localStorage");
  //   }
  //   handleClose2();
  // };

  return (
    <Box>
      <IconButton size="large" color="inherit" onClick={handleClick2}>
        <Avatar src={ProfileImg} alt="Profile" sx={{ width: 35, height: 35 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl2}
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          console.log("User object:", userRole);
          if (userRole && userRole.userId) {
            navigate(`/admin/users/profile/${userRole.userId}`);
          } else {
            alert("User ID not found in localStorage");
          }
          handleClose2();
        }}>
          <ListItemIcon><IconUser width={20} /></ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><IconMail width={20} /></ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><IconListCheck width={20} /></ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button to="/auth/login" variant="outlined" color="primary" component={Link} fullWidth>
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
