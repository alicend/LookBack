import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { styled } from '@mui/system';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { editTask, initialState, selectTask } from '@/slices/taskSlice';
import { fetchAsyncDeleteLoginUser } from '@/slices/userSlice';
import { useDispatch } from "react-redux";
import { AppDispatch } from '@/store/store';

const Adjust = styled('div')`
  width: 1px;
  height: 128px;
`;

const DeleteButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#f6685e !important',
  '&:hover': {
    backgroundColor: '#aa2e25 !important',
  },
  margin: theme.spacing(2),
}));

interface Props {
  loginUserName: string;
}  

const Delete: React.FC<Props> = React.memo(({ loginUserName }) => {

  const dispatch: AppDispatch = useDispatch();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmClose = (shouldDelete: boolean) => {
    setConfirmOpen(false);
    if (shouldDelete) {
      dispatch(fetchAsyncDeleteLoginUser());
      dispatch(editTask(initialState.editedTask));
      dispatch(selectTask(initialState.selectedTask));
    }
  };
  
  return (
    <>
      <DeleteButton
        variant="contained"
        color="error"
        size="small"
        startIcon={<DeleteOutlineOutlinedIcon />}
        onClick={() => {
          setConfirmOpen(true)
        }}
      >
        DELETE
      </DeleteButton>

      <Adjust className='aaaa'/>
      <br/>

      <Dialog open={confirmOpen} onClose={() => handleConfirmClose(false)}>
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`ユーザー「${loginUserName}」に関連するタスクも削除されますが本当に削除してよろしいですか？`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmClose(false)} color="primary">
            No
          </Button>
          <Button onClick={() => handleConfirmClose(true)} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default Delete;