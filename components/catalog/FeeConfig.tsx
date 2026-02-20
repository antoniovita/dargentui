import { Slider } from "@/components/ui/slider";

type Props = {
  managementFeePercent: number;
  performanceFeePercent: number;
  isFeeRecipientSelf: boolean;
  feeRecipientInput: string;
  onManagementFeeChange: (value: number) => void;
  onPerformanceFeeChange: (value: number) => void;
  onFeeRecipientSelfChange: (value: boolean) => void;
  onFeeRecipientInputChange: (value: string) => void;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

const FeeConfig = ({
  managementFeePercent,
  performanceFeePercent,
  isFeeRecipientSelf,
  feeRecipientInput,
  onManagementFeeChange,
  onPerformanceFeeChange,
  onFeeRecipientSelfChange,
  onFeeRecipientInputChange,
}: Props) => {
  return (
    <div className="w-[50%] rounded-xl border border-[#292929] bg-[#191919]">
      <div className="border-b border-[#292929] px-6 py-3">
        <h1 className="text-sm">Fee Setup</h1>
      </div>

      <div className="border-b border-[#292929] px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm text-zinc-200">Management Fee</h1>
          <span className="text-sm font-semibold text-zinc-100">
            {managementFeePercent.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={100}
            step={0.01}
            value={[managementFeePercent]}
            onValueChange={(value) => onManagementFeeChange(clampPercent(value[0] ?? 0))}
          />
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={managementFeePercent}
            onChange={(e) => onManagementFeeChange(clampPercent(Number(e.target.value)))}
            className="w-28 rounded-lg border border-[#262626] bg-[#191919] px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="border-b border-[#292929] px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm text-zinc-200">Performance Fee</h1>
          <span className="text-sm font-semibold text-zinc-100">
            {performanceFeePercent.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={100}
            step={0.01}
            value={[performanceFeePercent]}
            onValueChange={(value) => onPerformanceFeeChange(clampPercent(value[0] ?? 0))}
          />
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={performanceFeePercent}
            onChange={(e) => onPerformanceFeeChange(clampPercent(Number(e.target.value)))}
            className="w-28 rounded-lg border border-[#262626] bg-[#191919] px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={isFeeRecipientSelf}
            onChange={(e) => onFeeRecipientSelfChange(e.target.checked)}
            className="h-4 w-4 rounded border-[#3a3a3a] accent-white focus:outline-none focus:ring-0"
          />
          I am the fee recipient
        </label>

        <div className="space-y-2">
          <label className="block text-xs text-zinc-400">Fee recipient address</label>
          <input
            type="text"
            disabled={isFeeRecipientSelf}
            placeholder="0x..."
            value={feeRecipientInput}
            onChange={(e) => onFeeRecipientInputChange(e.target.value)}
            className="w-full rounded-lg border border-[#262626] bg-[#191919] px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default FeeConfig;
