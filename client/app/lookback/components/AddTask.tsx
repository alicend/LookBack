import React, { useState, useCallback } from "react";
import { DraggableItem } from "@/types/DraggableItem";
import { ItemTypes } from "@/types/ItemTypes";
import { v4 as uuidv4 } from "uuid";

type AddTaskProps = {
  closeAddTaskForm: () => void;
  updateTasks: (arg: DraggableItem, index: number) => void;
  groupName: string;
  index: number;
};

export const AddTask: React.FC<AddTaskProps> = ({
  closeAddTaskForm,
  updateTasks,
  groupName,
  index,
}) => {
  const [text, setText] = useState("");

  const handleOnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleOnSubmit = useCallback(() => {
    if (!text) return;
    updateTasks(
      {
        key: uuidv4(),
        groupName: groupName,
        contents: text,
        type: ItemTypes.card,
      },
      index
    );
    setText("");
    closeAddTaskForm();
  }, [text, updateTasks, groupName, index, closeAddTaskForm]);

  const handleCancel = useCallback(() => {
    setText("");
    closeAddTaskForm();
  }, [closeAddTaskForm]);

  return (
    <div>
      <textarea
        value={text}
        onChange={handleOnChange}
        className="w-full p-2 text-sm"
      ></textarea>
      <div className="flex gap-2">
        <button
          onClick={handleOnSubmit}
          className={`flex-1 text-sm ${
            text ? "bg-green-500" : "bg-green-200"
          } rounded py-1 px-4 text-white`}
        >
          Add
        </button>
        <button
          className="flex-1 rounded bg-gray-200 py-1 px-4 text-sm"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
