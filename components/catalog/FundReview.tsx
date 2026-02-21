import type { Address } from "viem";

type Props = {
  fundName: string;
  asset?: Address;
  bufferPercent: number;
  managementFeePercent: number;
  performanceFeePercent: number;
  feeRecipient?: Address;
  canCreate: boolean;
  isPending: boolean;
  isConfirming: boolean;
  onCreate: () => void;
};

export function FundReview({
  fundName,
  asset,
  bufferPercent,
  managementFeePercent,
  performanceFeePercent,
  feeRecipient,
  canCreate,
  isPending,
  isConfirming,
  onCreate,
}: Props) {
  const rows = [
    { label: "Fund", value: fundName.trim() || "-" },
    { label: "Asset", value: asset ?? "-" },
    { label: "Buffer", value: `${bufferPercent.toFixed(2)}%` },
    { label: "Management Fee", value: `${managementFeePercent.toFixed(2)}%` },
    { label: "Performance Fee", value: `${performanceFeePercent.toFixed(2)}%` },
    { label: "Fee Recipient", value: feeRecipient ?? "-" },
  ];

  return (
    <div className="w-[50%] rounded-xl border border-[#292929] bg-[#191919]">
      <div className="border-b border-[#292929] px-6 py-3">
        <h1 className="text-sm">Review</h1>
      </div>

      <div className="divide-y divide-[#292929]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 px-6 py-3">
            <span className="text-xs text-zinc-400">{row.label}</span>
            <span className="max-w-[70%] break-all text-right text-sm text-zinc-200">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onCreate}
        disabled={!canCreate || isPending || isConfirming}
        className="m-4 w-[calc(100%-2rem)] rounded-xl border border-[#262626] bg-white px-8 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating..." : isConfirming ? "Confirming..." : "Create Fund"}
      </button>
    </div>
  );
}
