"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Address } from "viem";
import Link from "next/link";
import { Search, Filter, Check } from "lucide-react";

import { useStrategyList } from "../../hooks/strategy/useStrategyList";
import { useAssetList } from "../../hooks/asset/useAssetList";
import { AssetCatalog } from "./AssetCatalog";
import { Button } from "@/components/ui/button";

type Props = {
  asset?: Address;
  setAsset?: Dispatch<SetStateAction<Address | undefined>>;
  assetFilter?: Address;
  implementations?: Address[];
  setImplementations: Dispatch<SetStateAction<Address[]>>;
};

export function StrategyCatalog({
  asset,
  setAsset,
  assetFilter,
  implementations = [],
  setImplementations,
}: Props) {
  const { implementations: strategyImplementations, isLoading, error } = useStrategyList();
  const { assets } = useAssetList();
  const [q, setQ] = useState("");
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState("USDC");

  const selectedImplSet = useMemo(
    () => new Set(implementations.map((a) => a.toLowerCase())),
    [implementations]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (strategyImplementations ?? [])
      .filter((s: any) => {
        if (s?.isActive === false) return false;

        if (query) {
          const name = String(s?.metadata?.name ?? "").toLowerCase();
          if (!name.includes(query)) return false;
        }

        if (assetFilter && Array.isArray(s?.supportedAssets)) {
          return s.supportedAssets
            .map((a: string) => String(a).toLowerCase())
            .includes(assetFilter.toLowerCase());
        }

        return true;
      })
      .sort((a: any, b: any) => {
        const as = Number(a?.riskScore ?? 0);
        const bs = Number(b?.riskScore ?? 0);
        if (as !== bs) return bs - as;

        const al = a?.isLiquid ? 0 : 1;
        const bl = b?.isLiquid ? 0 : 1;
        return al - bl;
      });
  }, [strategyImplementations, q, assetFilter]);

  function handleToggleImplementation(implementation: Address) {
    setImplementations((prev) => {
      const key = implementation.toLowerCase();
      const exists = prev.some((item) => item.toLowerCase() === key);
      if (exists) return prev.filter((item) => item.toLowerCase() !== key);
      return [...prev, implementation];
    });
  }

  function handleSelectAsset(nextAsset: Address) {
    setAsset?.(nextAsset);
    setIsAssetModalOpen(false);
  }

  function resolveMetadataUri(uri?: string) {
    if (!uri) return "";
    if (uri.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
    }
    return uri;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedAssetSymbol() {
      if (!asset) {
        setSelectedAssetSymbol("USDC");
        return;
      }

      const selected = assets.find((item) => item.asset.toLowerCase() === asset.toLowerCase());
      if (!selected?.metadataURI) {
        setSelectedAssetSymbol("USDC");
        return;
      }

      try {
        const res = await fetch(resolveMetadataUri(selected.metadataURI));
        if (!res.ok) {
          setSelectedAssetSymbol("USDC");
          return;
        }

        const json = await res.json();
        const symbol = String(json?.symbol ?? "").trim().toUpperCase();
        if (!cancelled) setSelectedAssetSymbol(symbol || "USDC");
      } catch {
        if (!cancelled) setSelectedAssetSymbol("USDC");
      }
    }

    loadSelectedAssetSymbol();
    return () => {
      cancelled = true;
    };
  }, [asset, assets]);

  const assetButtonLabel = asset ? selectedAssetSymbol : "All Assets";

  return (
    <div className="rounded-2xl bg-[#191919] border border-[#292929] pt-6 pb-4">
      <div className="mb-6 px-6 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setIsAssetModalOpen(true)}
          className="h-10 px-3 bg-[#191919] border-[#262626] hover:cursor-pointer text-zinc-200"
        >
          <Filter className="h-4 w-4 mr-2" />
          {assetButtonLabel}
        </Button>

        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search strategies by name..."
            className="w-full border border-[#262626] rounded-xl pl-11 pr-4 py-2.5 text-zinc-300 placeholder-zinc-600 text-sm bg-[#191919] focus:outline-none focus:border-[#3a3a3a] transition-colors"
          />
        </div>
      </div>

      <AssetCatalog
        open={isAssetModalOpen}
        onOpenChange={setIsAssetModalOpen}
        asset={asset}
        setAsset={handleSelectAsset}
      />

      {isLoading && <div className="text-center text-gray-400 py-12">Loading strategies...</div>}

      {error && <div className="text-center text-red-400 py-12">Error: {String((error as any)?.message ?? error)}</div>}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Strategy</th>
                <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Risk</th>
                <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Liquidity</th>
                <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Details</th>
                <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filtered?.map((s: any, idx: number) => {
                const impl = s?.implementation as Address | undefined;
                const isSelected = impl ? selectedImplSet.has(impl.toLowerCase()) : false;

                return (
                  <tr
                    key={`${s?.implementation ?? idx}`}
                    onClick={() => impl && handleToggleImplementation(impl)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-[#161616]" : "hover:bg-[#161616]"}`}
                  >
                    <td className="py-5 px-8 text-white text-sm">{s?.metadata?.name || `Strategy #${idx + 1}`}</td>
                    <td className="py-5 px-8 text-gray-300 text-sm">{s?.riskScore ?? "-"}</td>
                    <td className="py-5 px-8 text-gray-300 text-sm">
                      {s?.isLiquid === undefined ? "-" : s.isLiquid ? "Liquid" : "Illiquid"}
                    </td>
                    <td className="py-5 px-8 text-sm">
                      {impl ? (
                        <Link
                          href={`/strategy/${impl}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center rounded-lg border border-[#262626] bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="py-5 px-8">
                      {isSelected ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-white bg-white">
                          <Check className="h-3 w-3 text-zinc-900" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 rounded-sm border border-[#3a3a3a] bg-[#191919]" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!filtered || filtered.length === 0) && (
            <div className="text-center text-gray-500 py-12">No strategies found</div>
          )}
        </div>
      )}
    </div>
  );
}
