import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { TextField, Button, Modal } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { AppDispatch } from '@/store/store';
import { useDispatch } from 'react-redux';
import { fetchAsyncUpdateCategory, fetchAsyncDeleteCategory } from '@/slices/taskSlice';
import { CATEGORY } from '@/types/CategoryType';

const CategoryUpdateButton = styled(Button)(({ theme }) => ({
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

const CategoryDeleteButton = styled(Button)(({ theme }) => ({
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
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(2, 4, 3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  modalStyle: React.CSSProperties;
  originalCategory: CATEGORY
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = React.memo(({ open, onClose, modalStyle, originalCategory }) => {
  
  const dispatch: AppDispatch = useDispatch();

  const [editCategory, setEditCategory] = useState(originalCategory);
  const isDisabled = editCategory.Category.length === 0;

  useEffect(() => {
    setEditCategory(originalCategory);
  }, [originalCategory]);
  
  console.log(editCategory);

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCategory({...editCategory, Category: e.target.value});
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <StyledPaper style={modalStyle}>
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Edit category"
          type="text"
          value={editCategory.Category}
          onChange={handleInputTextChange}
        />
        <CategoryUpdateButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          disabled={isDisabled}
          onClick={() => {
            dispatch(fetchAsyncUpdateCategory(editCategory));
            onClose();
          }}
        >
          UPDATE
        </CategoryUpdateButton>
        <CategoryDeleteButton
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => {
              dispatch(fetchAsyncDeleteCategory(editCategory.ID));
              onClose();
            }}
          >
            DELETE
          </CategoryDeleteButton>
      </StyledPaper>
    </Modal>
  );
});

export default EditCategoryModal;