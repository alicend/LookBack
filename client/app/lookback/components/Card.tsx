import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FC, useState, useCallback } from "react";
import { DraggableItem } from "@/types/DraggableItem"; 

type CardProps = {
  task: DraggableItem;
  deleteTasks: (target: DraggableItem) => void;
};

export const Card: FC<CardProps> = ({ task, deleteTasks }) => {
  const [show, setShow] = useState<boolean>(false);

  const toggleShow = useCallback(() => {
    setShow(prevShow => !prevShow);
  }, []);

  const handleDelete = useCallback(() => {
    deleteTasks(task);
    setShow(false);
  }, [deleteTasks, task]);

  return (
    <div className="flex cursor-move content-start items-start rounded-md border bg-white p-4">
      <p className="flex-1 px-4 text-sm break-words overflow-auto text-overflow-ellipsis -webkit-line-clamp-2 -webkit-box-orient-vertical">
        {task.contents}
      </p>

      <button onClick={toggleShow}>
        <BiDotsHorizontalRounded className="h-4 w-4" />
        {show && (
          <div className="absolute z-50 list-none rounded border bg-white text-left text-sm">
            <ul>
              <li className="py-1 px-4 hover:bg-gray-100">
                <div onClick={() => {}}>
                  Edit
                </div>
              </li>
              <li className="py-1 px-4 hover:bg-gray-100">
                <div onClick={handleDelete}>
                  Delete
                </div>
              </li>
            </ul>
          </div>
        )}
      </button>
    </div>
  );
};
