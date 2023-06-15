import { BiPlus , BiDotsHorizontalRounded} from "react-icons/bi";
import { useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import { Card } from "./Card";
import { AddTask } from "./AddTask";
import { DraggableItem, DraggableItemWithIndex } from "@/types/DraggableItem";
import { Draggable } from "./Draggable";
import { ItemTypes } from "@/types/ItemTypes";

type ColumnProps = {
  columnName: string;
  firstIndex: number;
  tasks: DraggableItem[];
  updateTasks: (newTask: DraggableItem, index: number) => void;
  deleteTasks: (target: DraggableItem) => void;
  swapTasks: (dragIndex: number, hoverIndex: number, groupName: string) => void;
};

export const Column: React.FC<ColumnProps> = ({
  columnName,
  firstIndex,
  tasks,
  updateTasks,
  deleteTasks,
  swapTasks,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeAddTaskForm = (): void => setIsOpen(false);

  const toggleIsOpen = useCallback(() => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  }, []);

  const handleDrop = useCallback((dragItem: DraggableItemWithIndex) => {
    if (dragItem.groupName === columnName) return;
    
    const dragIndex = dragItem.index;
    const targetIndex = dragIndex < firstIndex
      ? firstIndex + tasks.length - 1  // Forward
      : firstIndex + tasks.length;  // Backward
    
    swapTasks(dragIndex, targetIndex, columnName);
    dragItem.index = targetIndex;
    dragItem.groupName = columnName;
  }, [columnName, firstIndex, swapTasks, tasks.length]);

  const [, ref] = useDrop({
    accept: ItemTypes.card,
    hover: handleDrop
  });

  return (
    <div className="h-[90%] w-[335px] rounded border bg-gray-100 p-2 text-gray-900">
      <div className="m-2 flex items-center">
        <div className="h-6 w-6 rounded-full bg-slate-200 text-center">
          {tasks.length}
        </div>
        <span className="ml-2 flex-1">{columnName}</span>
        <button onClick={toggleIsOpen}>
          <BiPlus className="h-4 w-4"></BiPlus>
        </button>
        <button>
          <BiDotsHorizontalRounded className="ml-2 h-4 w-4"></BiDotsHorizontalRounded>
        </button>
      </div>
      <div className="h-5/6 overflow-y-auto" ref={ref}>
        <div className="mx-2 mt-2 mb-4">
          {isOpen && (
            <AddTask
              closeAddTaskForm={closeAddTaskForm}
              updateTasks={updateTasks}
              groupName={columnName}
              index={firstIndex + tasks.length}
            />
          )}
        </div>
        <ul>
          {tasks?.map((task, index) => (
            <li key={task.key} className="m-2">
              <Draggable
                item={task}
                index={firstIndex + index}
                swapItems={swapTasks}
              >
                <Card task={task} deleteTasks={deleteTasks}></Card>
              </Draggable>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
