import React, { useEffect, useState } from 'react';
import { TextField, Button, Modal } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { fetchAsyncCreateUserGroup } from '@/slices/userGroupSlice';

const CategorySaveButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
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
  modalStyle: React.CSSProperties;
}

const NewUserGroupModal: React.FC<NewUserGroupModalModalProps> = React.memo(({ open, onClose, modalStyle }) => {
  
  const dispatch: AppDispatch = useDispatch();

  const [inputText, setInputText] = useState("");
  const isDisabled = inputText.length === 0;

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  useEffect(() => {
    if (!open) {
      setInputText("");
    }
  }, [open]);
  
  return (
    <Modal open={open} onClose={onClose}>
      <StyledPaper style={modalStyle}>
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="New User Group"
          type="text"
          value={inputText}
          onChange={handleInputTextChange}
          inputProps={{
            maxLength: 30
          }}
        />
        <CategorySaveButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          disabled={isDisabled}
          onClick={() => {
            dispatch(fetchAsyncCreateUserGroup(inputText));
            onClose();
          }}
        >
          SAVE
        </CategorySaveButton>
      </StyledPaper>
    </Modal>
  );
});

export default NewUserGroupModal;