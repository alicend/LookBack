import React, { useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import jaLocale from 'dayjs/locale/ja';
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

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

const TaskSaveButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3),
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1976d2 !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
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

const CategorySaveButton = styled(Button)(({ theme }) => ({
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
  console.log(editedTask);

  const [open, setOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);
  const [inputText, setInputText] = useState("");

  // if (editedTask.start_date === "") {
  //   dispatch(editTask({ ...editedTask, start_date: dayjs().toISOString() }));
  // }

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const isDisabled =
    editedTask.Task.length === 0 ||
    editedTask.Description.length === 0 ||
    editedTask.Responsible === 0 ||
    editedTask.Category === 0;

  const isCatDisabled = inputText.length === 0;

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    const name = e.target.name;
    if (name === "Estimate") {
      value = Number(value);
    }
    dispatch(editTask({ ...editedTask, [name]: value }));
  };
  
  const handleSelectDate = (date: Date) => {
    dispatch(editTask({ ...editedTask, StartDate: date.toISOString() }));
  };

  const handleSelectRespChange = (e: SelectChangeEvent<string | number>) => {
    const value = Number(e.target.value);
    dispatch(editTask({ ...editedTask, Responsible: value }));
  };
  
  const handleSelectStatusChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    dispatch(editTask({ ...editedTask, Status: value }));
  };
  
  const handleSelectCatChange = (e: SelectChangeEvent<string | number>) => {
    const value = Number(e.target.value);
    dispatch(editTask({ ...editedTask, Category: value }));
  };
  
  let userOptions = [{ ID: 0, Name: '' }, ...users].map((user) => (
    <MenuItem key={user.ID} value={user.ID} style={{ minHeight: '36px'}}>
      {user.Name}
    </MenuItem>
  ));
  let categoryOptions = [{ ID: 0, Category: '' }, ...category].map((cat) => (
    <MenuItem key={cat.ID} value={cat.ID} style={{ minHeight: '36px'}}>
      {cat.Category}
    </MenuItem>
  ));
  return (
    <div>
      <h2>{editedTask.ID ? "Update Task" : "New Task"}</h2>
      <form>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={jaLocale}>
          <StyledDatePicker
            label="Start Date"
            value={dayjs(editedTask.StartDate)}
            onChange={handleSelectDate}
            format="YYYY/MM/DD"
          />
        </LocalizationProvider>
        <StyledTextField
          label="Estimate [days]"
          type="number"
          name="Estimate"
          InputProps={{ inputProps: { min: 0, max: 1000 } }}
          InputLabelProps={{
            shrink: true,
          }}
          value={editedTask.Estimate}
          onChange={handleInputChange}
        />
        <br />
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Task"
          type="text"
          name="Task"
          value={editedTask.Task}
          onChange={handleInputChange}
        />
        <StyledTextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Description"
          type="text"
          name="Description"
          value={editedTask.Description}
          onChange={handleInputChange}
        />
        <br />
        <StyledFormControl>
          <InputLabel>Responsible</InputLabel>
          <Select
            name="Responsible"
            onChange={handleSelectRespChange}
            value={editedTask.Responsible}
          >
            {userOptions}
          </Select>
        </StyledFormControl>
        <StyledFormControl>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={editedTask.Status}
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
            name="Category"
            value={editedTask.Category}
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
            <CategorySaveButton
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
            </CategorySaveButton>
          </StyledPaper>
        </Modal>
        <br />
        <TaskSaveButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          disabled={isDisabled}
          onClick={
            editedTask.ID !== 0
              ? () => dispatch(fetchAsyncUpdateTask(editedTask))
              : () => dispatch(fetchAsyncCreateTask(editedTask))
          }
        >
          {editedTask.ID !== 0 ? "Update" : "Save"}
        </TaskSaveButton>

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