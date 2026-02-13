"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import { Zap } from "lucide-react";

type Props = {
  implementations: Address[];
  weightsByImplementation: Record<string, number>;
  onWeightChange: (implementation: Address, value: number) => void;
};

export function WeightPicker({
  implementations,
  weightsByImplementation,
  onWeightChange,
}: Props) {
  const totalBps = useMemo(
    () =>
      implementations.reduce(
        (sum, impl) => sum + (weightsByImplementation[impl.toLowerCase()] ?? 0),
        0
      ),
    [implementations, weightsByImplementation]
  );

  const totalPercent = totalBps / 100;
  const isValidTotal = totalBps === 10000;
  const progressPercent = Math.min(Math.max(totalPercent, 0), 100);
  const circleRadius = 28;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference * (1 - progressPercent / 100);

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

  return (
    <div className="rounded-2xl w-[70%] bg-[#191919] border py-6 border-[#292929]">
      
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Strategy</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Weight Slider</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Weight (%)</th>
                  <th className="text-left py-3 px-6 text-gray-300 font-normal text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
              {implementations.map((impl, idx) => {
                const weightPercent = toPercent(weightsByImplementation[impl.toLowerCase()] ?? 0);

                return (
                  <tr key={`${impl}-${idx}`} className="hover:bg-[#2a2a2a] transition-colors">
                    <td className="py-4 px-6 text-white text-sm">Strategy {idx + 1}</td>
                      <td className="py-4 px-6">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.01"
                          value={weightPercent}
                          onChange={(e) => setWeightPercent(impl, Number(e.target.value))}
                          className="w-full accent-zinc-300"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative max-w-[140px]">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={weightPercent}
                            onChange={(e) => setWeightPercent(impl, Number(e.target.value))}
                            className="w-full rounded-lg border border-[#262626] bg-[#191919] px-3 py-2 pr-8 text-sm text-zinc-300 focus:outline-none focus:border-[#3a3a3a]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          className="rounded-lg border border-[#262626] bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
                        >
                          View
                        </button>
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        {implementations.length > 1 && (
        <div className="px-6 pt-6 border-t border-[#262626]">
          <button
            onClick={distributeEqually}
            className="w-full rounded-xl border border-[#262626] bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Distribute Equally
          </button>
        </div>
      )}

      </div>
    </div>
  );
}
