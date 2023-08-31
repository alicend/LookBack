import * as React from 'react';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchAsyncLogout } from '@/slices/userSlice';
import { useRouter } from 'next/router';

export const IconMenu: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  // URLの末尾を取得
  const lastPath = router.asPath.split('/').pop();

  const Logout = async () => {
    await dispatch(fetchAsyncLogout());
  };
  
  return (
    <MenuList sx={{ width: 320, maxWidth: '100%' }}>
      <MenuItem onClick={Logout}>
        <ListItemIcon>
          <ExitToAppIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Log out</ListItemText>
      </MenuItem>
      {lastPath !== 'look-back' && (
        <Link href="/look-back">
          <MenuItem>
            <ListItemIcon>
              <CalendarMonthOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Look Back</ListItemText>
          </MenuItem>
        </Link>
      )}
      {lastPath !== 'task-board' && (
        <Link href="/task-board">
          <MenuItem>
            <ListItemIcon>
              <AssignmentOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Task Board</ListItemText>
          </MenuItem>
        </Link>
      )}
      {lastPath !== 'profile' && (
        <Link href="/profile">
          <MenuItem>
            <ListItemIcon>
              <ManageAccountsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile Edit</ListItemText>
          </MenuItem>
        </Link>
      )}
    </MenuList>
  );
}