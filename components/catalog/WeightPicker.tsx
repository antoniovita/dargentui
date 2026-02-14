"use client";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { ArrowDownUp, BarChart3, Scale, Zap } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

type Props = {
  implementations: Address[];
  buffer: number;
  setBuffer: Dispatch<SetStateAction<number>>;
  weightsByImplementation: Record<string, number>;
  strategyInfoByImplementation?: Record<
    string,
    { riskTier: number | null; liquidity: boolean | null }
  >;
  onWeightChange: (implementation: Address, value: number) => void;
};

export function WeightPicker({
  implementations,
  buffer,
  setBuffer,
  weightsByImplementation,
  strategyInfoByImplementation = {},
  onWeightChange,
}: Props) {
  const [copiedImpl, setCopiedImpl] = useState<string | null>(null);
  const totalBps = useMemo(
    () =>
      implementations.reduce(
        (sum, impl) => sum + (weightsByImplementation[impl.toLowerCase()] ?? 0),
        0
      ),
    [implementations, weightsByImplementation]
  );
  const totalPercent = totalBps / 100;

  useEffect(() => {
    const nextBuffer = Number(Math.max(0, 100 - totalPercent).toFixed(2));
    setBuffer((current) => (current === nextBuffer ? current : nextBuffer));
  }, [totalPercent, setBuffer]);

  const toBps = (percent: number) => Math.round(percent * 100);
  const toPercent = (bps: number) => bps / 100;

  function setWeightPercent(impl: Address, percent: number) {
    const safe = Math.max(0, Math.min(100, percent));
    onWeightChange(impl, toBps(safe));
  }

  function distributeEqually() {
    const equal = Math.floor(10000 / implementations.length);
    const remainder = 10000 - equal * implementations.length;

    implementations.forEach((impl, idx) => {
      onWeightChange(impl, idx === 0 ? equal + remainder : equal);
    });
  }

  function applyWeights(nextWeights: number[]) {
    implementations.forEach((impl, idx) => {
      onWeightChange(impl, Math.max(0, nextWeights[idx] ?? 0));
    });
  }

  function normalizeWeights() {
    if (implementations.length === 0) return;
    if (totalBps <= 0) {
      distributeEqually();
      return;
    }

    const raw = implementations.map(
      (impl) => weightsByImplementation[impl.toLowerCase()] ?? 0
    );
    const scaled = raw.map((value) => (value * 10000) / totalBps);
    const next = scaled.map((value) => Math.floor(value));
    let remainder = 10000 - next.reduce((sum, value) => sum + value, 0);

    const order = scaled
      .map((value, idx) => ({ idx, frac: value - Math.floor(value) }))
      .sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < order.length && remainder > 0; i += 1) {
      next[order[i].idx] += 1;
      remainder -= 1;
    }

    applyWeights(next);
  }

  function prioritizeFirst() {
    if (implementations.length === 0) return;
    if (implementations.length === 1) {
      applyWeights([10000]);
      return;
    }

    const primary = 6000;
    const restCount = implementations.length - 1;
    const restBase = Math.floor((10000 - primary) / restCount);
    const restRemainder = 10000 - primary - restBase * restCount;
    const next = implementations.map((_, idx) => {
      if (idx === 0) return primary;
      if (idx === 1) return restBase + restRemainder;
      return restBase;
    });

    applyWeights(next);
  }

  function progressiveSplit() {
    if (implementations.length === 0) return;
    const totalRank = (implementations.length * (implementations.length + 1)) / 2;
    const scaled = implementations.map(
      (_, idx) => ((implementations.length - idx) * 10000) / totalRank
    );
    const next = scaled.map((value) => Math.floor(value));
    const remainder = 10000 - next.reduce((sum, value) => sum + value, 0);
    next[0] += remainder;
    applyWeights(next);
  }

  function shortAddress(address: Address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async function copyAddress(address: Address) {
    await navigator.clipboard.writeText(address);
    const key = address.toLowerCase();
    setCopiedImpl(key);
    window.setTimeout(() => {
      setCopiedImpl((current) => (current === key ? null : current));
    }, 1200);
  }

  return (
    <div className="rounded-2xl w-full bg-[#191919] border py-6 border-[#292929]">
      
        <ScrollArea className="w-full" type="hover">
          <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Strategy</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Address</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Risk</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Liquidity</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Weight Slider</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Information</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
              {implementations.map((impl, idx) => {
                const weightPercent = toPercent(weightsByImplementation[impl.toLowerCase()] ?? 0);
                const strategyInfo = strategyInfoByImplementation[impl.toLowerCase()];
                const riskTier = strategyInfo?.riskTier ?? null;
                const liquidity = strategyInfo?.liquidity ?? null;

                return (
                  <tr key={`${impl}-${idx}`} className="hover:bg-[#121212] transition-colors">
                    <td className="py-4 px-6 text-white text-sm">Strategy {idx + 1}</td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => copyAddress(impl)}
                        title={impl}
                        className="inline-flex items-center rounded-md border border-[#262626] px-2 py-1 text-xs font-mono text-zinc-300 hover:bg-[#232323] transition-colors"
                      >
                        {copiedImpl === impl.toLowerCase() ? "Copiado" : shortAddress(impl)}
                      </button>
                    </td>
                      <td className="py-4 px-6 text-zinc-300 text-sm">{riskTier ?? "-"}</td>
                      <td className="py-4 px-6 text-zinc-300 text-sm">
                        {liquidity === null ? "-" : liquidity ? "Liquid" : "Illiquid"}
                      </td>
                      <td className="py-4 px-6">
                        <Slider
                          min={0}
                          max={100}
                          step={0.01}
                          value={[weightPercent]}
                          onValueChange={(value) => setWeightPercent(impl, value[0] ?? 0)}
                        />
                      </td>

                      <td className="py-4 px-6">
                        <button
                          type="button"
                          className="rounded-lg border border-[#262626] bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
                        >
                          View
                        </button>
                      </td>


                      <td className="py-4 px-6">
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={weightPercent}
                            onChange={(e) => setWeightPercent(impl, Number(e.target.value))}
                            className="w-[40%] rounded-lg border-[#262626] bg-[#191919] text-sm text-zinc-300"
                          />
                        </div>
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {implementations.length > 1 && (
        <div className="px-6 pt-6 border-t flex-row flex justify-between border-[#262626]">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={distributeEqually}
              className="whitespace-nowrap flex-row flex gap-2 rounded-xl border border-[#262626] bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-colors"
            >
              <Zap className="h-4 w-4" />
              Distribute Equally
            </button>
            <button
              onClick={normalizeWeights}
              className="whitespace-nowrap flex-row flex gap-2 rounded-xl border border-[#262626] bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-colors"
            >
              <Scale className="h-4 w-4" />
              Normalize to 100%
            </button>
            <button
              onClick={prioritizeFirst}
              className="whitespace-nowrap flex-row flex gap-2 rounded-xl border border-[#262626] bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Prioritize First
            </button>
            <button
              onClick={progressiveSplit}
              className="whitespace-nowrap flex-row flex gap-2 rounded-xl border border-[#262626] bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-colors"
            >
              <ArrowDownUp className="h-4 w-4" />
              Progressive Split
            </button>
          </div>

          <div className="mt-5">
            <h1 className="text-white/80">
              Buffer: <span className="text-white font-bold">{buffer}%</span>
            </h1>
          </div>
        </div>
      )}

    </div>
  );
}
