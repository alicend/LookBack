import React, { useState, FC } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy} from "@dnd-kit/sortable";
import { Card, CardType } from "./Card";


export const Sidebar: FC = () => {

  // 仮データを定義
  const cards_sample: CardType[] = [
    { id: "card1", title: "Card 1" },
    { id: "card2", title: "Card 2" },
    { id: "card3", title: "Card 3" }
  ];

  const [open, setOpen] = useState(true);
  const [cards, setCards] = useState(cards_sample);
  
  return (
    <section className="flex gap-6">
      <div
        className={`bg-black min-h-screen ${
          open ? "w-72" : "w-16"
        } duration-500 text-gray-100 px-4`}
      >
        <div className="py-3 flex justify-end">
          <HiMenuAlt3
            size={26}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="p-3">
            <h3>TODO</h3>
            <SortableContext
              items={cards}
              strategy={verticalListSortingStrategy}
            >
              {/* We need components that use the useSortable hook */}
              {cards.map(card => <Card key={card.id} id={card.id} title={card.title}/>)}
            </SortableContext>
          </div>
        </DndContext>
      </div>
    </section>
  );

  // D&G終了後に配列の順番を変更する
  function handleDragEnd(event: { active: any; over: any; }) {
    console.log("Drag end called");
    const {active, over} = event;

    if (active.id !== over.id) {
      setCards((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id);
        const overIndex = items.findIndex((item) => item.id === over.id);
        console.log(arrayMove(items, activeIndex, overIndex));
        return arrayMove(items, activeIndex, overIndex);
      });
    }
  }
};
