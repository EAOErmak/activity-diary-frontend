type Props = {
  x: number;
  y: number;
  canDrop: boolean;
};

export function GoalsDragPreview({ x, y, canDrop }: Props) {
  return (
    <div
      className="fixed z-[90] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 pointer-events-none"
      style={{
        left: x,
        top: y,
        backgroundColor: canDrop ? "#3b82f6" : "#ef4444",
        borderColor: canDrop ? "#bfdbfe" : "#fecaca",
        boxShadow: canDrop
          ? "0 0 0 2px rgba(59,130,246,0.45)"
          : "0 0 0 2px rgba(239,68,68,0.45)",
      }}
    />
  );
}
