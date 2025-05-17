import React from "react";

interface IconButtonProps {
  title?: string;
  onClick: () => void;
  icon: React.ElementType;
  color?: string;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  title,
  onClick,
  icon: Icon,
  color = "text-gray-600",
  className = "",
}) => {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-lg p-2 ${color} ${className}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

export default IconButton;
