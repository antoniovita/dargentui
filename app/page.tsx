"use client";
import { FundCatalog } from "../components/catalog/FundCatalog";
import { StartSection } from "../components/StartSection";

const Page = () => {
  return (
    <main className="min-h-screen bg-[#202020] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <StartSection />

        <FundCatalog />
      </div>
    </main>
  );
}

export default Page;