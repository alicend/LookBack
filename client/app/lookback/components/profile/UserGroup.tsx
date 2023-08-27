import React, { FC, useState } from 'react';
import { useDispatch } from "react-redux";
import { Button, Fab, Grid, TextField } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from "@mui/icons-material/Save";
import { AppDispatch } from '@/store/store';
import { fetchAsyncUpdateUserGroup } from '@/slices/userGroupSlice';
import { USER_GROUP } from '@/types/UserGroupType';

const Adjust = styled('div')`
  width: 1px;
  height: 79px;
`;

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    marginBottom: theme.spacing(1),
  },
  "& .MuiInput-root": {
    marginBottom: theme.spacing(2),
  },
  width: '300px',
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
  userGroup: USER_GROUP;
}  

const UserGroup: FC<Props> = React.memo(({ userGroup }) => {

  const dispatch = useDispatch<AppDispatch>();
  const [newUserGroup, setNewUserGroup] = useState("");

  const isDisabled = newUserGroup.length === 0;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserGroup(event.target.value);
  };

  const update = async () => {
    await dispatch(fetchAsyncUpdateUserGroup({ id: userGroup.ID, userGroup: newUserGroup }));
  }
  
  return (
    <>
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="Current User Group"
        type="text"
        name="current_user_group"
        value={userGroup.UserGroup}
        disabled={true}
      />
      <br />
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="New User Group"
        type="text"
        name="new_user_group"
        value={newUserGroup}
        onChange={handleInputChange}
        inputProps={{
          maxLength: 30
        }}
      />
      <Grid>
        <UpdateButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          disabled={isDisabled}
          onClick={update}
        >
          UPDATE
        </UpdateButton>
      </Grid>
    </>
  );
});

export default UserGroup;
