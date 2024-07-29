import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="relative w-[500px] p-7">
        <div className="relative bg-base-300 border border-base-200 rounded-lg p-7 h-[500px] overflow-y-auto">
          {children}
          <XMarkIcon className="absolute top-4 right-4 w-10 h-10 hover:cursor-pointer" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default Modal;
