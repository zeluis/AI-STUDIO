import React from 'react';

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number | string;
  filled?: boolean;
  style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  className = '',
  size = 18,
  filled = false,
  style = {},
}) => {
  const fontSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center leading-none align-middle ${className}`}
      style={{
        fontSize,
        width: fontSize,
        height: fontSize,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
