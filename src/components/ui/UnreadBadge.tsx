interface UnreadBadgeProps {
  count: number;
  className?: string;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, className = "" }) => {
  if (count <= 0) return null;

  return (
    <div className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 leading-none z-10 ${className}`}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default UnreadBadge;