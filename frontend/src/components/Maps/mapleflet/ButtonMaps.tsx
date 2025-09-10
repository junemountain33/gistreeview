import React from "react";

interface ButtonMapsProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ButtonMaps: React.FC<ButtonMapsProps> = ({
  onClick,
  disabled,
  title,
  children,
  style,
}) => (
  <button
    style={style}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`group/button relative inline-flex items-center justify-center overflow-hidden rounded-4xl
      bg-gray-800/30 backdrop-blur-lg px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out
      hover:scale-110 hover:shadow-xl hover:shadow-gray-600/50 border border-white/20 dark:bg-gray-900/40 dark:text-gray-100`}
  >
    <span className="text-lg">{children}</span>
    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-10deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-10deg)_translateX(100%)]">
      <div className="relative h-full w-10 bg-white/20"></div>
    </div>
  </button>
);

export default ButtonMaps;
