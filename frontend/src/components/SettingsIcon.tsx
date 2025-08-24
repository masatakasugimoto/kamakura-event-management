interface SettingsIconProps {
  size?: number;
  color?: string;
  className?: string;
}

const SettingsIcon: React.FC<SettingsIconProps> = ({ 
  size = 18, 
  color = "currentColor", 
  className = "" 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      {/* Simple 8-tooth gear */}
      <path d="M10.8 2h2.4l0.4 2.4 1.8 0.6 2-1.2 1.7 1.7-1.2 2 0.6 1.8 2.4 0.4v2.4l-2.4 0.4-0.6 1.8 1.2 2-1.7 1.7-2-1.2-1.8 0.6-0.4 2.4h-2.4l-0.4-2.4-1.8-0.6-2 1.2-1.7-1.7 1.2-2-0.6-1.8-2.4-0.4v-2.4l2.4-0.4 0.6-1.8-1.2-2 1.7-1.7 2 1.2 1.8-0.6L10.8 2z"/>
      <circle cx="12" cy="12" r="3" fill="white" />
    </svg>
  );
};

export default SettingsIcon;