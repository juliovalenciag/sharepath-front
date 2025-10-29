export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-background">{children}</div>
  );
}
