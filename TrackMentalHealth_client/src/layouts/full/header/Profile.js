import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
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
import axios from 'axios';
const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const navigate = useNavigate();

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };
  const userRole = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(null);


  useEffect(() => {
    if (!userRole?.userId) return;

    axios.get(`http://localhost:9999/api/users/profile/${userRole.userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, [userRole?.userId]);

  if (!user) return <CircularProgress />;

  return (
    <Box>
      <IconButton size="large" color="inherit" onClick={handleClick2}>
        <Avatar src={user.avatar} sx={{ width: 35, height: 35 }} />
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
            navigate(`/admin/users/edit-profile/${userRole.userId}`);
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
