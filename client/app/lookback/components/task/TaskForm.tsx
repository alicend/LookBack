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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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
  fetchAsyncDeleteTask,
} from "@/slices/taskSlice";
import { AppDispatch } from "@/store/store";
import { initialState } from "@/slices/taskSlice";

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

const ButtonGroup = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(15),
  marginRight: theme.spacing(15),
  display: 'flex',
  justifyContent: 'space-between',
}));

const TaskSaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
}));

const TaskDeleteButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(2),
  backgroundColor: '#f6685e !important',
  '&:hover': {
    backgroundColor: '#aa2e25 !important',
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  marginTop: theme.spacing(3),
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
    editedTask.Category === 0 ||
    editedTask.StartDate.length === 0;

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

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const value = Number(e.target.value);
    const name = e.target.name;
    dispatch(editTask({ ...editedTask, [name]: value }));
  };
  
  const handleSelectDateChange = (date: any) => {
    if (date.$d instanceof Date && !isNaN(date.$d.getTime())) {
      console.log("Valid Date");
      dispatch(editTask({ ...editedTask, StartDate: date.toISOString() }));
    } else {
      console.log("Invalid Date");
      dispatch(editTask({ ...editedTask, StartDate: "" }));
    }
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
            onChange={handleSelectDateChange}
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
            onChange={handleSelectChange}
            value={editedTask.Responsible}
          >
            {userOptions}
          </Select>
        </StyledFormControl>
        <StyledFormControl>
          <InputLabel>Status</InputLabel>
          <Select
            name="Status"
            value={editedTask.Status}
            onChange={handleSelectChange}
          >
            <MenuItem value={1}>未着</MenuItem>
            <MenuItem value={2}>進行中</MenuItem>
            <MenuItem value={3}>完了</MenuItem>
          </Select>
        </StyledFormControl>
        <br />
        <StyledFormControl>
          <InputLabel>Category</InputLabel>
          <Select
            name="Category"
            value={editedTask.Category}
            onChange={handleSelectChange}
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
        <ButtonGroup>
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
        {editedTask.ID !== 0 ?
          <TaskDeleteButton
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => {
              dispatch(fetchAsyncDeleteTask(editedTask.ID));
              dispatch(selectTask(initialState.selectedTask));
            }}
          >
            DELETE
          </TaskDeleteButton>
          :
          ""
        }
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
        </ButtonGroup>
      </form>
    </div>
  );
};

export default TaskForm;