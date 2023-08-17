import React, { FC, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from "@mui/icons-material/Save";
import { AppDispatch } from '@/store/store';
import { selectUserGroup } from '@/slices/userGroupSlice';

const Adjust = styled('div')`
  height: 22px;
`;

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 240,
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

const UserGroup: FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const userGroups = useSelector(selectUserGroup);
  const [newUserGroup, setNewUserGroup] = useState("");
  const [errors, setErrors] = useState({ new_username: "" });

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value as string;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const update = async () => {
    await dispatch(fetchAsyncUpdateLoginUserGroup(newUsername));
  }

  let userGroupOptions = [{ ID: 0, UserGroup: '' }, ...userGroups].map((userGroup) => (
    <MenuItem key={userGroup.ID} value={userGroup.ID} style={{ minHeight: '36px'}}>
      {userGroup.UserGroup}
    </MenuItem>
  ));
  
  return (
    <>
      <StyledFormControl>
          <InputLabel>User Group</InputLabel>
          <Select
            name="user_group"
            // value={credential.user_group}
            onChange={handleSelectChange}
          >
            {userGroupOptions}
          </Select>
        </StyledFormControl>
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
    </>
  );
});

export default UserGroup;
