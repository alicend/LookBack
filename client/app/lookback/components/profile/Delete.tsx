import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { editTask, initialState, selectTask } from "@/slices/taskSlice";
import { fetchAsyncDeleteUserGroup } from "@/slices/userGroupSlice";
import { fetchAsyncDeleteLoginUser } from "@/slices/userSlice";
import { AppDispatch } from "@/store/store";
import { USER_GROUP } from "@/types/UserGroupType";

const Adjust = styled("div")`
  width: 1px;
  height: 128px;
`;

const DeleteButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f6685e !important",
  "&:hover": {
    backgroundColor: "#aa2e25 !important",
  },
  margin: theme.spacing(2),
}));

interface Props {
  loginUserName: string;
  userGroup: USER_GROUP;
  loginStatus: boolean;
}

const Delete: React.FC<Props> = React.memo(
  ({ loginUserName, userGroup, loginStatus }) => {
    const dispatch: AppDispatch = useDispatch();

    const [confirmUserOpen, setConfirmUserOpen] = useState(false);
    const [confirmUserGroupOpen, setConfirmUserGroupOpen] = useState(false);

    const handleConfirmUserClose = (shouldDelete: boolean) => {
      setConfirmUserOpen(false);
      if (shouldDelete) {
        dispatch(fetchAsyncDeleteLoginUser());
        dispatch(editTask(initialState.editedTask));
        dispatch(selectTask(initialState.selectedTask));
      }
    };

    const handleConfirmUserGroupClose = (shouldDelete: boolean) => {
      setConfirmUserGroupOpen(false);
      if (shouldDelete) {
        dispatch(fetchAsyncDeleteUserGroup(userGroup.ID));
      }
    };

    return (
      <>
        <Grid>
          <DeleteButton
            variant="contained"
            color="error"
            size="small"
            disabled={loginStatus}
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => {
              setConfirmUserOpen(true);
            }}
          >
            USER DELETE
          </DeleteButton>

          <DeleteButton
            variant="contained"
            color="error"
            size="small"
            disabled={loginStatus}
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => {
              setConfirmUserGroupOpen(true);
            }}
          >
            USER GROUP DELETE
          </DeleteButton>
        </Grid>

        <Adjust />
        <br />

        <Dialog
          open={confirmUserOpen}
          onClose={() => handleConfirmUserClose(false)}
        >
          <DialogTitle>{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`ユーザー「${loginUserName}」に関連するタスクも削除されますが本当に削除してよろしいですか？`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleConfirmUserClose(false)}
              color="primary"
            >
              No
            </Button>
            <Button
              onClick={() => handleConfirmUserClose(true)}
              color="primary"
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmUserGroupOpen}
          onClose={() => handleConfirmUserGroupClose(false)}
        >
          <DialogTitle>{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`ユーザーグループ「${userGroup.UserGroup}」に所属するユーザーも削除されますが本当に削除してよろしいですか？`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleConfirmUserGroupClose(false)}
              color="primary"
            >
              No
            </Button>
            <Button
              onClick={() => handleConfirmUserGroupClose(true)}
              color="primary"
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  },
);

export default Delete;
