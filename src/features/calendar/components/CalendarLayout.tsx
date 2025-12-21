export function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page py-10">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="rounded-[28px] bg-surface p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
