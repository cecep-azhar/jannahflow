import { BottomNav } from "@/components/bottom-nav";

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
