"use client";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { useCreateFund } from "../hooks/fund/useCreateFund";
import { ADDR } from "../lib/addresses";

export function CreateFundButton() {
  const { address } = useAccount();
  const { createFund, fund, manager, txHash, isPending, isConfirming } = useCreateFund();

  async function onClick() {
    if (!address) return;

    await createFund({
      fundType: 1,
      asset: ADDR.asset,
      fundMetadataURI: "ipfs://fund-meta",
      bufferBps: 0,
      mgmtFeeBps: 0,
      perfFeeBps: 0,
      managerFeeRecipient: address as Address,
      strategyImplementations: [
        ADDR.stratImplLiquid as Address,
        ADDR.stratImplNonLiquid as Address,
      ],
      weightsBps: [7000, 3000],
    });
  }

  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <button
        className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
        disabled={!address || isPending}
        onClick={onClick}
      >
        {isPending ? "Enviando..." : "Criar Fund"}
      </button>

      <div className="text-sm opacity-80 space-y-1">
        {txHash && <div>Tx: {txHash}</div>}
        {isConfirming && <div>Confirmando...</div>}
        {fund && <div><b>Fund:</b> {fund}</div>}
        {manager && <div><b>Manager:</b> {manager}</div>}
      </div>
    </div>
  );
}
