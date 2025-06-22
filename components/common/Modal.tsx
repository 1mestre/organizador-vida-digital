
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  id?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, id }) => {
  if (!isOpen) return null;

  return (
    <div 
      id={id}
      className="fixed inset-0 bg-bg-dark/75 backdrop-blur-sm flex justify-center items-center z-[2000] animate-modalFadeIn"
      onClick={onClose} // Close on overlay click
    >
      <div
        className="bg-bg-card p-6 md:p-8 rounded-2xl shadow-glow-blue border border-white/20 w-[90%] max-w-lg animate-popInModal"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <h3 className="text-accent-blue-info text-2xl mb-5 text-center font-semibold text-shadow-glow-blue">{title}</h3>
        {children}
      </div>
      <style>{`
        @keyframes modalFadeIn { from {opacity: 0;} to {opacity: 1;} }
        .animate-modalFadeIn { animation: modalFadeIn 0.3s ease-out forwards; }
        @keyframes popInModal { 
          from { opacity:0; transform: scale(0.9) translateY(10px); } 
          to { opacity:1; transform: scale(1) translateY(0); } 
        }
        .animate-popInModal { animation: popInModal 0.3s ease-out forwards; }
        .text-shadow-glow-blue { text-shadow: 0 0 5px rgba(139, 233, 253, 0.3); }
      `}</style>
    </div>
  );
};

export default Modal;
