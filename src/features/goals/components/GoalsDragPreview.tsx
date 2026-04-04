export function GoalsDragPreview() {
  return (
    <div
      className="fixed z-[90] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 pointer-events-none"
      style={{
        left: "var(--goals-drag-x, -9999px)",
        top: "var(--goals-drag-y, -9999px)",
        backgroundColor: "var(--goals-drag-bg, #ef4444)",
        borderColor: "var(--goals-drag-border, #fecaca)",
        boxShadow: "var(--goals-drag-shadow, 0 0 0 2px rgba(239,68,68,0.45))",
      }}
    />
  );
}
