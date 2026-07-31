export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">{children}</div>
    </div>
  );
}