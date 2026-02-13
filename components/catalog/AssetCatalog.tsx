"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAssetList } from "../../hooks/asset/useAssetList";
import type { Address } from "viem";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Address;
  setAsset?: (asset: Address) => void;
};

export const AssetCatalog = ({
  open,
  onOpenChange,
  asset,
  setAsset,
}: Props) => {
  const { assets, isLoading, error } = useAssetList();
  const [searchTerm, setSearchTerm] = useState("");
  const [symbolsByAsset, setSymbolsByAsset] = useState<Record<string, string>>({});

  function resolveMetadataUri(uri?: string) {
    if (!uri) return "";
    if (uri.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
    }
    return uri;
  }


  useEffect(() => {
    let cancelled = false;

    async function loadSymbols() {
      const entries = await Promise.all(
        assets.map(async (a) => {
          const key = a.asset.toLowerCase();
          if (!a.metadataURI) return [key, ""] as const;

          try {
            const url = resolveMetadataUri(a.metadataURI);
            const res = await fetch(url);
            if (!res.ok) return [key, ""] as const;

            const json = await res.json();
            return [key, String(json?.symbol ?? "")] as const;
          } catch {
            return [key, ""] as const;
          }
        })
      );

      if (!cancelled) {
        setSymbolsByAsset(Object.fromEntries(entries));
      }
    }

    loadSymbols();
    return () => {
      cancelled = true;
    };
  }, [assets]);


  const filteredAssets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return assets;

    return assets.filter((assetItem) => {
      const address = assetItem.asset.toLowerCase();
      const metadata = String(assetItem.metadataURI ?? "").toLowerCase();
      const symbol = String(symbolsByAsset[assetItem.asset.toLowerCase()] ?? "").toLowerCase();
      return address.includes(q) || metadata.includes(q) || symbol.includes(q);
    });
  }, [assets, searchTerm, symbolsByAsset]);

  function handleSelectAsset(nextAsset: Address) {
    setAsset?.(nextAsset);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-3xl bg-[#191919] border-[#292929]">
        <div >
          <div className="mb-6 ">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by metadata or address..."
                className="w-full border border-[#262626] rounded-xl pl-11 pr-4 py-2.5 text-zinc-300 placeholder-zinc-600 text-sm bg-[#191919] focus:outline-none focus:border-[#3a3a3a] transition-colors"
              />
            </div>
          </div>

          {isLoading && <div className="text-center text-gray-400 py-12">Loading assets...</div>}

          {error && <div className="text-center text-red-400 py-12">Error: {String(error.message ?? error)}</div>}

          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Asset</th>
                    <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {filteredAssets.map((assetItem, index) => {
                    const isSelected = asset?.toLowerCase() === assetItem.asset.toLowerCase();
                    const symbol = String(symbolsByAsset[assetItem.asset.toLowerCase()] ?? "").trim();
                    const displaySymbol =
                      symbol.length > 0
                        ? symbol.toUpperCase()
                        : "USDC";
                    return (
                      <tr
                        key={`${assetItem.asset}-${index}`}
                        onClick={() => handleSelectAsset(assetItem.asset)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"}`}
                      >
                        <td className="py-5 px-8 text-white text-sm">
                          {displaySymbol}
                        </td>
                        <td className="py-5 px-8">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAsset(assetItem.asset);
                            }}
                            className="rounded-lg border border-[#262626] bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAssets.length === 0 && <div className="text-center text-gray-500 py-12">No assets found</div>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
