import React, { useState } from "react";
import { styled } from '@mui/system';
import {
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Fab,
  Modal,
  SelectChangeEvent
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncCreateTask,
  fetchAsyncUpdateTask,
  fetchAsyncCreateCategory,
  selectUsers,
  selectEditedTask,
  selectCategory,
  editTask,
  selectTask,
} from "@/reducer/taskSlice";
import { AppDispatch } from "@/store/store";
import { initialState } from "@/reducer/taskSlice";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3),
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginLeft: theme.spacing(2),
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1976d2 !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginLeft: theme.spacing(2),
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1976d2 !important',
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
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(2, 4, 3),
}));

const TaskForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  const users = useSelector(selectUsers);
  const category = useSelector(selectCategory);
  const editedTask = useSelector(selectEditedTask);

  const [open, setOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);
  const [inputText, setInputText] = useState("");

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const isDisabled =
    editedTask.task.length === 0 ||
    editedTask.description.length === 0 ||
    editedTask.criteria.length === 0;

  const isCatDisabled = inputText.length === 0;

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    const name = e.target.name;
    if (name === "estimate") {
      value = Number(value);
    }
    dispatch(editTask({ ...editedTask, [name]: value }));
  };

  const handleSelectRespChange = (e: SelectChangeEvent<string | number>) => {
    const value = Number(e.target.value);
    dispatch(editTask({ ...editedTask, responsible: value }));
  };
  
  const handleSelectStatusChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    dispatch(editTask({ ...editedTask, status: value }));
  };
  
  const handleSelectCatChange = (e: SelectChangeEvent<string | number>) => {
    const value = Number(e.target.value);
    dispatch(editTask({ ...editedTask, category: value }));
  };
  let userOptions = users.map((user) => (
    <MenuItem key={user.id} value={user.id}>
      {user.username}
    </MenuItem>
  ));
  let categoryOptions = [{ ID: 0, Category: '' }, ...category].map((cat) => (
    <MenuItem key={cat.ID} value={cat.ID} style={{ minHeight: '36px'}}>
      {cat.Category}
    </MenuItem>
  ));
  return (
    <div>
      <h2>{editedTask.id ? "Update Task" : "New Task"}</h2>
      <form>
        <StyledTextField
          label="Estimate [days]"
          type="number"
          name="estimate"
          InputProps={{ inputProps: { min: 0, max: 1000 } }}
          InputLabelProps={{
            shrink: true,
          }}
          value={editedTask.estimate}
          onChange={handleInputChange}
        />
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Task"
          type="text"
          name="task"
          value={editedTask.task}
          onChange={handleInputChange}
        />
        <br />
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Description"
          type="text"
          name="description"
          value={editedTask.description}
          onChange={handleInputChange}
        />
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Criteria"
          type="text"
          name="criteria"
          value={editedTask.criteria}
          onChange={handleInputChange}
        />
        <br />
        <StyledFormControl>
          <InputLabel>Responsible</InputLabel>
          <Select
            name="responsible"
            onChange={handleSelectRespChange}
            value={editedTask.responsible}
          >
            {userOptions}
          </Select>
        </StyledFormControl>
        <StyledFormControl>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={editedTask.status}
            onChange={handleSelectStatusChange}
          >
            <MenuItem value={1}>Not started</MenuItem>
            <MenuItem value={2}>On going</MenuItem>
            <MenuItem value={3}>Done</MenuItem>
          </Select>
        </StyledFormControl>
        <br />
        <StyledFormControl>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={editedTask.category}
            onChange={handleSelectCatChange}
          >
            {categoryOptions}
          </Select>
        </StyledFormControl>

        <StyledFab
          size="small"
          color="primary"
          onClick={handleOpen}
        >
          <AddIcon />
        </StyledFab>

        <Modal open={open} onClose={handleClose}>
          <StyledPaper style={modalStyle}>
            <StyledTextField
              InputLabelProps={{
                shrink: true,
              }}
              label="New category"
              type="text"
              value={inputText}
              onChange={handleInputTextChange}
            />
            <SaveButton
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              disabled={isCatDisabled}
              onClick={() => {
                dispatch(fetchAsyncCreateCategory(inputText));
                handleClose();
              }}
            >
              SAVE
            </SaveButton>
          </StyledPaper>
        </Modal>
        <br />
        <StyledButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          disabled={isDisabled}
          onClick={
            editedTask.id !== 0
              ? () => dispatch(fetchAsyncUpdateTask(editedTask))
              : () => dispatch(fetchAsyncCreateTask(editedTask))
          }
        >
          {editedTask.id !== 0 ? "Update" : "Save"}
        </StyledButton>

        <Button
          variant="contained"
          color="inherit"
          size="small"
          onClick={() => {
            dispatch(editTask(initialState.editedTask));
            dispatch(selectTask(initialState.selectedTask));
          }}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default TaskForm;