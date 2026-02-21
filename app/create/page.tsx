"use client";

import { useCreateFund } from "@/hooks/fund/useCreateFund";
import { useMemo, useState } from "react";
import { isAddress, type Address } from "viem";
import { useAccount } from "wagmi";

import { StrategyCatalog } from "@/components/catalog/StrategyCatalog";
import { FundReview } from "@/components/catalog/FundReview";
import { WeightPicker } from "@/components/catalog/WeightPicker";
import { useStrategyList } from "@/hooks/strategy/useStrategyList";
import FeeConfig from "@/components/catalog/FeeConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CreationPage = () => {
  const [asset, setAsset] = useState<Address | undefined>(undefined);
  const [implementations, setImplementations] = useState<Address[]>([]);
  const [weightsByImplementation, setWeightsByImplementation] = useState<Record<string, number>>({});
  const [errorDialogMessage, setErrorDialogMessage] = useState<string>("");
  const [fundName, setFundName] = useState<string>("");
  const [fundDescription, setFundDescription] = useState<string>("");
  const [buffer, setBuffer] = useState<number>(0);
  const [managementFeePercent, setManagementFeePercent] = useState<number>(0);
  const [performanceFeePercent, setPerformanceFeePercent] = useState<number>(0);
  const [isFeeRecipientSelf, setIsFeeRecipientSelf] = useState<boolean>(true);
  const [feeRecipientInput, setFeeRecipientInput] = useState<string>("");
  
  const { address } = useAccount();
  const { createFund, fund, txHash, isPending, isConfirming } = useCreateFund();
  const { implementations: strategyItems } = useStrategyList();

  const weightsBps = useMemo(
    () => implementations.map((impl) => Number(weightsByImplementation[impl.toLowerCase()] ?? 0)),
    [implementations, weightsByImplementation]
  );

  const totalWeightBps = useMemo(() => weightsBps.reduce((acc, w) => acc + w, 0), [weightsBps]);
  const isCreateValid = useMemo(() => {
    if (!address) return false;
    if (!fundName.trim()) return false;
    if (!asset) return false;
    if (implementations.length === 0) return false;
    if (totalWeightBps !== 10000) return false;
    if (!isFeeRecipientSelf && !isAddress(feeRecipientInput)) return false;
    return true;
  }, [address, fundName, asset, implementations.length, totalWeightBps, isFeeRecipientSelf, feeRecipientInput]);

  const strategyInfoByImplementation = useMemo(() => {
    const next: Record<string, { riskTier: number | null; liquidity: boolean | null }> = {};
    for (const item of strategyItems ?? []) {
      const key = item.implementation.toLowerCase();
      next[key] = {
        riskTier: Number.isFinite(item.riskTier) ? item.riskTier : null,
        liquidity: typeof item.isLiquid === "boolean" ? item.isLiquid : null,
      };
    }
    return next;
  }, [strategyItems]);

  function openErrorDialog(message: string) {
    setErrorDialogMessage(message);
  }

  function clampPercent(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
  }

  function handleWeightChange(implementation: Address, value: number) {
    setWeightsByImplementation((prev) => ({
      ...prev,
      [implementation.toLowerCase()]: value,
    }));
  }

  function handleRemoveImplementation(implementation: Address) {
    const key = implementation.toLowerCase();
    setImplementations((prev) => prev.filter((item) => item.toLowerCase() !== key));
    setWeightsByImplementation((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onClick() {
    const bufferBps = Math.round(Math.max(0, Math.min(100, buffer)) * 100);
    const mgmtFeeBps = Math.round(clampPercent(managementFeePercent) * 100);
    const perfFeeBps = Math.round(clampPercent(performanceFeePercent) * 100);

    if (!address) {
      openErrorDialog("Connect your wallet.");
      return;
    }
    if (!fundName.trim()) {
      openErrorDialog("Enter a fund name.");
      return;
    }
    if (!asset) {
      openErrorDialog("Select an asset.");
      return;
    }
    if (implementations.length === 0) {
      openErrorDialog("Select at least one strategy.");
      return;
    }
    if (totalWeightBps !== 10000) {
      openErrorDialog("Total weights must equal 100%.");
      return;
    }
    if (!isFeeRecipientSelf && !isAddress(feeRecipientInput)) {
      openErrorDialog("Enter a valid fee recipient address.");
      return;
    }

    const managerFeeRecipient = isFeeRecipientSelf
      ? (address as Address)
      : (feeRecipientInput as Address);

    await createFund({
      fundType: 1,
      asset,
      fundMetadataURI: "ipfs://fund-meta",
      bufferBps,
      mgmtFeeBps,
      perfFeeBps,
      managerFeeRecipient,
      strategyImplementations: implementations,
      weightsBps,
    });
  }

  return (
    <main className="min-h-screen bg-[#202020] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <AlertDialog open={Boolean(errorDialogMessage)} onOpenChange={(open) => !open && setErrorDialogMessage("")}>
          <AlertDialogContent className="border-[#2a2a2a] bg-[#191919] text-zinc-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Unable to create fund</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">{errorDialogMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction className="!bg-white !text-black hover:!bg-white hover:!text-black">
                Got it
            </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {fund && (
          <div className="mb-6 space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <div className="font-medium">Fund created successfully.</div>
            <div className="text-xs text-zinc-400">Fund: {fund}</div>
            {txHash && <div className="text-xs text-zinc-400">Tx: {txHash}</div>}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-[#191919] border border-[#292929] p-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Fund Name</label>
              <input
                type="text"
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
                placeholder="e.g., Aave Lending Turbo"
                className="w-full rounded-xl border border-[#262626] bg-[#191919] px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#3a3a3a] transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
              <textarea
                value={fundDescription}
                onChange={(e) => setFundDescription(e.target.value)}
                placeholder="Describe your fund strategy and goals..."
                rows={4}
                className="w-full resize-none rounded-xl border border-[#262626] bg-[#191919] px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#3a3a3a] transition-colors"
              />
            </div>
          </div>

          <StrategyCatalog
            asset={asset}
            setAsset={setAsset}
            assetFilter={asset}
            implementations={implementations}
            setImplementations={setImplementations}
          />
        </div>

        <div className="mt-8 flex gap-8 flex-row">
          <WeightPicker
            implementations={implementations}
            buffer={buffer}
            setBuffer={setBuffer}
            weightsByImplementation={weightsByImplementation}
            strategyInfoByImplementation={strategyInfoByImplementation}
            onWeightChange={handleWeightChange}
            onRemoveImplementation={handleRemoveImplementation}
          />
        </div>

        <div className="flex-row mt-8 flex gap-8">
          <FeeConfig
            managementFeePercent={managementFeePercent}
            performanceFeePercent={performanceFeePercent}
            isFeeRecipientSelf={isFeeRecipientSelf}
            feeRecipientInput={feeRecipientInput}
            onManagementFeeChange={setManagementFeePercent}
            onPerformanceFeeChange={setPerformanceFeePercent}
            onFeeRecipientSelfChange={setIsFeeRecipientSelf}
            onFeeRecipientInputChange={setFeeRecipientInput}
          />


          <FundReview
            fundName={fundName}
            asset={asset}
            bufferPercent={buffer}
            managementFeePercent={managementFeePercent}
            performanceFeePercent={performanceFeePercent}
            canCreate={isCreateValid}
            feeRecipient={
              isFeeRecipientSelf
                ? (address as Address | undefined)
                : (isAddress(feeRecipientInput) ? (feeRecipientInput as Address) : undefined)
            }
            isPending={isPending}
            isConfirming={isConfirming}
            onCreate={onClick}
          />
      </div>




          
      </div>
    </main>
  );
};

export default CreationPage;
