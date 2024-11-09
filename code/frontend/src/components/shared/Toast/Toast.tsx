import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faExclamationTriangle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

export const ToastStatusEnum = {
  Success: 'success',
  Error: 'error',
  Info: 'info',
  Warning: 'warning',
} as const;

export type ToastStatus =
  (typeof ToastStatusEnum)[keyof typeof ToastStatusEnum];

type ToastProps = {
  children: React.ReactNode;
  title: string;
  status: (typeof ToastStatusEnum)[keyof typeof ToastStatusEnum];
  duration?: number;
  isVisible: boolean;
  onClose: () => void;
};

function Toast({
  children,
  title,
  status,
  duration,
  isVisible,
  onClose,
}: ToastProps) {
  let bgColorClassName = '';
  let icon;
  switch (status) {
    case ToastStatusEnum.Success:
      bgColorClassName = 'bg-green-500';
      icon = <FontAwesomeIcon icon={faCircleCheck} size="lg" color="#ffffff" />;
      break;
    case ToastStatusEnum.Error:
      bgColorClassName = 'bg-red-500';
      icon = (
        <FontAwesomeIcon icon={faCircleExclamation} size="lg" color="#ffffff" />
      );
      break;
    case ToastStatusEnum.Info:
      bgColorClassName = 'bg-blue-500';
      icon = <FontAwesomeIcon icon={faCircleInfo} size="lg" color="#ffffff" />;
      break;
    case ToastStatusEnum.Warning:
      bgColorClassName = 'bg-orange-500';
      icon = (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          size="lg"
          color="#ffffff"
        />
      );
      break;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration || 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-5 right-5 z-50 w-[340px] p-4 ${bgColorClassName} rounded-lg shadow-lg text-white`}
    >
      <button
        onClick={onClose}
        className="absolute top-1 right-2 text-lg"
        aria-label="Close"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <div className="flex gap-3">
        <span>{icon}</span>
        <div className="flex flex-col w-full">
          <strong className="font-bold">{title}</strong>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}

export default Toast;
