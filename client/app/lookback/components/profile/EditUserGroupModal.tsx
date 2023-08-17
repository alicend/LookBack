import React, { useEffect, useState } from 'react';
import { TextField, Button, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { fetchAsyncDeleteCategory } from '@/slices/taskSlice';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const UpdateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
}));

const DeleteButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginLeft: theme.spacing(2),
  backgroundColor: '#f6685e !important',
  '&:hover': {
    backgroundColor: '#aa2e25 !important',
  },
}));

const StyledPaper = styled('div')(({ theme }) => ({
  position: "absolute",
  textAlign: "center",
  width: 400,
  backgroundColor: 'white',
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(2, 4, 3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

interface NewUserGroupModalModalProps {
  open: boolean;
  onClose: () => void;
}

const EditUserGroupModal: React.FC<NewUserGroupModalModalProps> = React.memo(({ open, onClose }) => {
  
  const dispatch: AppDispatch = useDispatch();
  const [modalStyle] = useState(getModalStyle);

  const [inputText, setInputText] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDisabled = inputText.length === 0;

  const handleConfirmClose = (shouldDelete: boolean) => {
    setConfirmOpen(false);
    if (shouldDelete) {
      // dispatch(fetchAsyncDeleteCategory(editCategory.ID));
      onClose();
    }
  };

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  useEffect(() => {
    if (!open) {
      setInputText("");
    }
  }, [open]);
  
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <StyledPaper style={modalStyle}>
          <StyledTextField
            InputLabelProps={{
              shrink: true,
            }}
            label="Edit User Group"
            type="text"
            value={inputText}
            onChange={handleInputTextChange}
            inputProps={{
              maxLength: 30
            }}
          />
          
          <UpdateButton
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SaveIcon />}
            disabled={isDisabled}
            onClick={() => {
              // dispatch(fetchAsyncUpdateCategory(editCategory));
              onClose();
            }}
          >
            UPDATE
          </UpdateButton>
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
        </StyledPaper>
      </Modal>

      <Dialog open={confirmOpen} onClose={() => handleConfirmClose(false)}>
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`ユーザーグループ「${inputText}」に所属するユーザーも削除されますが本当に削除してよろしいですか？`}
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

export default EditUserGroupModal;