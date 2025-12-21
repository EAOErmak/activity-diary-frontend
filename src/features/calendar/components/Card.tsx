export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        rounded-2xl
        bg-surface
        p-4
        text-surfaceForeground
        shadow-card
      "
    >
      {children}
    </div>
  );
}
