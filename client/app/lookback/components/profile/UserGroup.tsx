import React, { FC, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, Fab, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { AppDispatch } from '@/store/store';
import { selectUserGroup } from '@/slices/userGroupSlice';
import { fetchAsyncUpdateLoginUserGroup } from '@/slices/userSlice';
import NewUserGroupModal from '../NewUserGroupModal';
import EditUserGroupModal from './EditUserGroupModal';

const Adjust = styled('div')`
  width: 1px;
  height: 79px;
`;

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 240,
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(2),
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
}));

const UpdateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
  margin: theme.spacing(2),
}));

interface Props {
  loginUserGroupID: number;
}  

const UserGroup: FC<Props> = React.memo(({ loginUserGroupID }) => {

  const dispatch = useDispatch<AppDispatch>();
  const userGroups = useSelector(selectUserGroup);
  const [selectedUserGroup, setSelectedUserGroup] = useState(loginUserGroupID);
  const [newUserGroupOpen, setNewUserGroupOpen] = useState(false);
  const [editUserGroupOpen, setEditUserGroupOpen] = useState(false);

  const isLoginUserGroup = selectedUserGroup === loginUserGroupID;

  const handleNewUserGroupOpen = () => {
    setNewUserGroupOpen(true);
  };
  const handleNewUserGroupClose = () => {
    setNewUserGroupOpen(false);
  };

  const handleEditUserGroupOpen = () => {
    setEditUserGroupOpen(true);
  };
  const handleEditUserGroupClose = () => {
    setEditUserGroupOpen(false);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    setSelectedUserGroup(Number(e.target.value));
  };

  const update = async () => {
    await dispatch(fetchAsyncUpdateLoginUserGroup(selectedUserGroup));
  }

  let userGroupOptions = [{ ID: 0, UserGroup: '' }, ...(Array.isArray(userGroups) ? userGroups : [])].map((userGroup) => (
    <MenuItem key={userGroup.ID} value={userGroup.ID} style={{ minHeight: '36px'}}>
      {userGroup.UserGroup}
    </MenuItem>
  ));

  const matchingUserGroup = (userGroups?.find(userGroup => userGroup.ID === selectedUserGroup)) || null;
  
  return (
    <>
      <Grid>
        <StyledFormControl>
          <InputLabel>User Group</InputLabel>
          <Select
            name="user_group"
            value={selectedUserGroup}
            onChange={handleSelectChange}
          >
            {userGroupOptions}
          </Select>
        </StyledFormControl>

        <StyledFab
          size="small"
          color="primary"
          onClick={selectedUserGroup !== 0 ? handleEditUserGroupOpen : handleNewUserGroupOpen }
        >
          {selectedUserGroup !== 0 ? <EditOutlinedIcon /> : <AddIcon />}
        </StyledFab>

      </Grid>
      <br />
      <Grid>
        <UpdateButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          onClick={update}
        >
          UPDATE
        </UpdateButton>
      </Grid>
      
      <Adjust/>
      
      {
        matchingUserGroup ?
          <EditUserGroupModal 
            open={editUserGroupOpen}
            onClose={handleEditUserGroupClose}
            originalUserGroup={matchingUserGroup}
            isLoginUserGroup={isLoginUserGroup}
          />
        :
          <NewUserGroupModal 
            open={newUserGroupOpen}
            onClose={handleNewUserGroupClose}
          />
      }
    </>
  );
});

export default UserGroup;
