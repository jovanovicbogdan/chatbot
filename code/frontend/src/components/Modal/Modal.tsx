import { ReactNode } from 'react';
import './Modal.css';

type ModalProps = {
  children: ReactNode;
  onBackdropClickHandler?: () => void;
};

export default function Modal({
  children,
  onBackdropClickHandler,
}: ModalProps) {
  return (
    <>
      <div className="backdrop z-10" onClick={onBackdropClickHandler}></div>
      <div className="absolute flex justify-center">
        <div className="fixed top-20 z-20 bg-lightGray rounded-md p-4 w-[440px] sm:w-[560px] md:w-[660px] dark:bg-dark-background dark:text-lightGray">
          {children}
        </div>
      </div>
    </>
  );
}
