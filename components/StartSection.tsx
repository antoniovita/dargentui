import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const StartSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-medium text-white leading-tight">
          Discover and
          <br />
          create yield funds
        </h1>

        <p className="text-gray-400 text-xl mt-4 max-w-md">
          The investment banking protocol driving
          <br />
          the future of finance.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create a fund now
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg bg-[#121212] hover:bg-[#232323] transition-colors"
          >
            Discover funds
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
