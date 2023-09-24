import SaveIcon from "@mui/icons-material/Save";
import { Button, Grid, TextField } from "@mui/material";
import { styled } from "@mui/system";
import React, { FC, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchAsyncUpdateUserGroup } from "@/slices/userGroupSlice";
import { AppDispatch } from "@/store/store";
import { USER_GROUP } from "@/types/UserGroupType";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    marginBottom: theme.spacing(1),
  },
  "& .MuiInput-root": {
    marginBottom: theme.spacing(2),
  },
  width: "300px",
}));

const UpdateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#4dabf5 !important",
  "&:hover": {
    backgroundColor: "#1769aa !important",
  },
  "&:disabled": {
    backgroundColor: "#ccc !important",
    cursor: "not-allowed",
  },
  margin: theme.spacing(2),
}));

interface Props {
  userGroup: USER_GROUP;
  loginStatus: boolean;
}

const UserGroup: FC<Props> = React.memo(({ userGroup, loginStatus }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newUserGroup, setNewUserGroup] = useState("");

  const isDisabled = newUserGroup.length === 0;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserGroup(event.target.value);
  };

  const update = async () => {
    await dispatch(
      fetchAsyncUpdateUserGroup({ id: userGroup.ID, userGroup: newUserGroup }),
    );
  };

  return (
    <>
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="Current User Group"
        type="text"
        name="current_user_group"
        value={userGroup.UserGroup}
        disabled={true}
        inputProps={{
          style: { overflow: "auto" },
        }}
      />
      <br />
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="New User Group"
        type="text"
        name="new_user_group"
        disabled={loginStatus}
        value={newUserGroup}
        onChange={handleInputChange}
        inputProps={{
          maxLength: 30,
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
