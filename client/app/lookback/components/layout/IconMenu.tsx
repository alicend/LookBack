import * as React from 'react';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export const IconMenu: React.FC = () => {

  const router = useRouter();
  const Logout = async () => {
    try {
      const res = await axios.get(
          `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/logout`,
          { headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      console.log(err);
    }
    router.push("/");
  };
  
  return (
    <MenuList sx={{ width: 320, maxWidth: '100%' }}>
      <MenuItem onClick={Logout}>
        <ListItemIcon>
          <ExitToAppIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Log out</ListItemText>
      </MenuItem>
      <Link href="/profile">
        <MenuItem>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile Edit</ListItemText>
        </MenuItem>
      </Link>
    </MenuList>
  );
}