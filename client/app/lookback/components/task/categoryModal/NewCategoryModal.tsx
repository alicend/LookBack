import SaveIcon from "@mui/icons-material/Save";
import { TextField, Button, Modal, Grid } from "@mui/material";
import { styled } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchAsyncCreateCategory } from "@/slices/taskSlice";
import { AppDispatch } from "@/store/store";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const CategorySaveButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginLeft: theme.spacing(2),
  backgroundColor: "#4dabf5 !important",
  "&:hover": {
    backgroundColor: "#1769aa !important",
  },
  "&:disabled": {
    backgroundColor: "#ccc !important",
    cursor: "not-allowed",
  },
}));

const StyledPaper = styled("div")(({ theme }) => ({
  position: "absolute",
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(2, 4, 3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

interface NewCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

const NewCategoryModal: React.FC<NewCategoryModalProps> = React.memo(
  ({ open, onClose }) => {
    const dispatch: AppDispatch = useDispatch();

    const [inputText, setInputText] = useState("");
    const [modalStyle] = useState(getModalStyle);

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
          <Grid>
            <StyledTextField
              InputLabelProps={{
                shrink: true,
              }}
              label="New category"
              type="text"
              value={inputText}
              onChange={handleInputTextChange}
              inputProps={{
                maxLength: 30,
              }}
            />
          </Grid>
          <Grid>
            <CategorySaveButton
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              disabled={isDisabled}
              onClick={() => {
                dispatch(fetchAsyncCreateCategory(inputText));
                onClose();
              }}
            >
              SAVE
            </CategorySaveButton>
          </Grid>
        </StyledPaper>
      </Modal>
    );
  },
);

export default NewCategoryModal;
