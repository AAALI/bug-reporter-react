import { NavHeader } from "@/components/nav-header";
import { HeroSection } from "@/components/landing/hero-section";

export default function Page() {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#F8FAFC]">
      <NavHeader />
      <main className="flex-1 overflow-hidden">
        <HeroSection />
      </main>
    </div>
  );
}
