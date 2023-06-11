import { FC } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

export type CardType = {
  id: string;
  title: string;
};

export const Card: FC<CardType> = ({ id, title }) => {
  // const { attributes, listeners, setNodeRef, transform } = useSortable({
  //   id: id
  // });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
} = useSortable({id: id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    // attributes、listenersはDOMイベントを検知するために利用します。
    // listenersを任意の領域に付与することで、ドラッグするためのハンドルを作ることもできます。
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-white shadow p-4 rounded-md my-1"
    >
      <div id={id}>
        <p className="text-black">{title}</p>
      </div>
    </div>
  );
};