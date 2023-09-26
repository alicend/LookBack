import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { fetchAsyncLogout } from "@/slices/userSlice";
import { AppDispatch } from "@/store/store";

export const IconMenu: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  // URLの末尾を取得
  const lastPath = router.asPath.split("/").pop();

  const Logout = async () => {
    await dispatch(fetchAsyncLogout());
  };

  return (
    <MenuList sx={{ width: 320, maxWidth: "100%" }}>
      <MenuItem onClick={Logout}>
        <ListItemIcon>
          <ExitToAppIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Log out</ListItemText>
      </MenuItem>
      {lastPath !== "look-back" && (
        <Link href="/look-back">
          <MenuItem>
            <ListItemIcon>
              <CalendarMonthOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Look Back</ListItemText>
          </MenuItem>
        </Link>
      )}
      {lastPath !== "task-board" && (
        <Link href="/task-board">
          <MenuItem>
            <ListItemIcon>
              <AssignmentOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Task Board</ListItemText>
          </MenuItem>
        </Link>
      )}
      {lastPath !== "profile" && (
        <Link href="/profile">
          <MenuItem>
            <ListItemIcon>
              <ManageAccountsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile Edit</ListItemText>
          </MenuItem>
        </Link>
      )}
      {lastPath !== "invite" && (
        <Link href="/invite">
          <MenuItem>
            <ListItemIcon>
              <ContactMailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Invite to User Group</ListItemText>
          </MenuItem>
        </Link>
      )}
    </MenuList>
  );
};
