"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const Loading = () => {
  const [value, setValue] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((current) => (current >= 92 ? 24 : current + 8));
    }, 260);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#202020] px-6 text-white">
      <div className="w-full max-w-md space-y-3">
        <p className="text-center text-sm text-zinc-300">Carregando...</p>
        <Progress value={value} className="h-2 bg-zinc-700" />
      </div>
    </main>
  );
};

export default Loading;
