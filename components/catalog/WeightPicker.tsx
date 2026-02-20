"use client";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { ArrowDownUp, BarChart3, Scale, Shield, Trash2, Zap } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  onRemoveImplementation: (implementation: Address) => void;
};

export function WeightPicker({
  implementations,
  buffer,
  setBuffer,
  weightsByImplementation,
  strategyInfoByImplementation = {},
  onWeightChange,
  onRemoveImplementation,
}: Props) {
  const [copiedImpl, setCopiedImpl] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Address | null>(null);
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

    function setWeightPercentCapped(impl: Address, nextPercent: number) {
      const key = impl.toLowerCase();
      const currentBps = weightsByImplementation[key] ?? 0;
      const totalWithoutCurrent = totalBps - currentBps;

      const maxForThisBps = 10000 - totalWithoutCurrent;
      const nextBps = Math.round(nextPercent * 100);

      const capped = Math.max(0, Math.min(maxForThisBps, nextBps));
      onWeightChange(impl, capped);
    }

      function buffer10percent() {
      if (implementations.length === 0) return;

      const targetTotalBps = 9000;
      const currentTotalBps = implementations.reduce(
        (sum, impl) => sum + (weightsByImplementation[impl.toLowerCase()] ?? 0),
        0
      );

      if (currentTotalBps <= 0) return;

      const scaled = implementations.map((impl) => {
        const current = weightsByImplementation[impl.toLowerCase()] ?? 0;
        return (current * targetTotalBps) / currentTotalBps;
      });

      const next = scaled.map((v) => Math.floor(v));
      let remainder = targetTotalBps - next.reduce((a, b) => a + b, 0);

      const order = scaled
        .map((v, idx) => ({ idx, frac: v - Math.floor(v) }))
        .sort((a, b) => b.frac - a.frac);

      for (let i = 0; i < order.length && remainder > 0; i += 1) {
        next[order[i].idx] += 1;
        remainder -= 1;
      }

      implementations.forEach((impl, idx) => {
        onWeightChange(impl, next[idx]);
      });
    }

  return (
    <>
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
                  <th className="py-3 px-6" />
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
                          onValueChange={(value) => setWeightPercentCapped(impl, value[0] ?? 0)}
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
                            className="w-[40%] rounded-lg border border-[#262626] focus:shadow-none focus:border-none bg-[#191919] text-sm font-bold text-zinc-300 focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(impl)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] bg-[#1f1f1f] text-zinc-300 transition-colors hover:bg-[#2a2a2a] hover:text-red-300"
                          aria-label="Remove strategy"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {implementations.length > 0 ? (
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

            <button
              onClick={buffer10percent}
              className="whitespace-nowrap flex-row flex gap-2 rounded-xl border border-[#262626] bg-[#1f1f1f] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-[#262626] transition-colors"
            >
              <Shield className="h-4 w-4" />
              10% Buffer
            </button>
          </div>

          <div className="mt-5 flex-row gap-4 flex">
            <h1 className="text-white/80">
              Buffer: <span className="text-white font-bold">{buffer}%</span>
            </h1>

            <h1 className="text-white/80">
              Total: <span className="text-white font-bold">{totalPercent}%</span>
            </h1>          
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center pt-8 p-6 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">No strategy added</p>
            <p className="text-xs text-zinc-500">
              Select one or more strategies
            </p>
          </div>
        </div>
      )}


      </div>
      <AlertDialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="border-[#2a2a2a] bg-[#191919] text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove strategy?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will remove the selected strategy from the weight table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-zinc-200 hover:bg-[#232323]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                if (removeTarget) onRemoveImplementation(removeTarget);
                setRemoveTarget(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
