import React from "react";
import { SupportedTokenWeight } from "~~/utils/token-weights";

interface Props {
  items: {
    label: string;
    id: SupportedTokenWeight;
  }[];
  selectedId: SupportedTokenWeight;
  onSelect: (id: SupportedTokenWeight) => void;
}

export const ButtonTabs: React.FC<Props> = ({ items, selectedId, onSelect }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="tabs">
        <div className="flex">
          <div className="flex flex-1 rounded-xl transition-all duration-300 -mb-px overflow-hidden">
            {items.map(({ id, label }) => {
              const isSelected = id === selectedId;

              return (
                <button
                  key={id}
                  className={`text-neutral-700 bg-gradient-to-b from-custom-beige-start to-custom-beige-end to-100% flex-1 py-3 font-medium text-lg front-bold ${
                    isSelected ? "" : "opacity-50 hover:opacity-90"
                  }`}
                  onClick={() => {
                    if (selectedId !== id) {
                      onSelect(id);
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
