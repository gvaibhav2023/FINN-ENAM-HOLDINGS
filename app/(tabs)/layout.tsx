import { BottomNav } from "@/components/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 overflow-y-auto px-4 py-4">{children}</main>
      <BottomNav />
    </>
  );
}

