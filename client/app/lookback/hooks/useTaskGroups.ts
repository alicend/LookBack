import { DraggableItem } from "@/types/DraggableItem";
import { useTasks } from "./useTasks";

export const useTaskGroups = (): [
  DraggableItem[],
  (newTask: DraggableItem, index: number) => void,
  (dragIndex: number, hoverIndex: number, groupName: string) => void,
  (target: DraggableItem) => void
] => {
  
  const [tasks, updateTasks, swapTasks, deleteTasks] = useTasks();

  return [
    tasks ?? [],
    updateTasks,
    swapTasks,
    deleteTasks,
  ];
};
