import React from 'react';
import { Modal } from "@mui/material";
import { styled } from '@mui/system';
import CalendarTaskDisplay from './CalendarTaskDisplay';

const StyledPaper = styled('div')(({ theme }) => ({
  position: "absolute",
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(2, 4, 3),
  overflow: 'auto',
  maxHeight: '90vh',
  maxWidth: '90vh',
}));

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  modalStyle: React.CSSProperties;
}

const CalenderModal: React.FC<EditCategoryModalProps> = React.memo(({ open, onClose, modalStyle }) => {
  
  return (
    <Modal open={open} onClose={onClose} >
      <StyledPaper style={modalStyle}>
        <CalendarTaskDisplay onClose={onClose}/>
      </StyledPaper>
    </Modal>
  );
});

export default CalenderModal;