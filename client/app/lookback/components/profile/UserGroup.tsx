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

interface Props {
  loginUserGroupID: number;
}  

const UserGroup: FC<Props> = React.memo(({ loginUserGroupID }) => {

  const dispatch = useDispatch<AppDispatch>();
  const userGroups = useSelector(selectUserGroup);
  const [selectedUserGroup, setSelectedUserGroup] = useState(loginUserGroupID);

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    setSelectedUserGroup(Number(e.target.value));
  };

  const update = async () => {
    await dispatch(fetchAsyncUpdateLoginUserGroup(selectedUserGroup));
  }

  let userGroupOptions = userGroups.map((userGroup) => (
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
          value={selectedUserGroup}
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
