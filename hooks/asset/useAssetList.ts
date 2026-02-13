"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address, Hash } from "viem";
import { decodeEventLog } from "viem";

import IAssetRegistryArtifact from "../../contracts/IAssetRegistry.json";
import { ADDR } from "../../lib/addresses";

export enum AssetStatus {
  NONE = 0,
  ACTIVE = 1,
  INACTIVE = 2,
  DEPRECATED = 3
}

export type AssetCatalogItem = {
  asset: Address;

  status: AssetStatus;
  decimals: number;
  metadataURI: string;
  approvedAt: bigint;

  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
};

export function useAssetList() {
  const client = usePublicClient();
  const abi = (IAssetRegistryArtifact as any).abi;

  const [assets, setAssets] = useState<AssetCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const EVENT_NAME = "AssetApproved";

  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const logs = await client.getLogs({
          address: ADDR.assetRegistry,
          fromBlock: BigInt(0),
          toBlock: "latest",
        });

        const approved = new Map<string, { asset: Address; blockNumber: bigint; tx: Hash; logIndex: number }>();

        for (const l of logs) {
          try {
            const decoded = decodeEventLog({
              abi,
              data: l.data,
              topics: l.topics,
            }) as {
              eventName: string;
              args: {
                asset: Address;
                approvedAt: bigint;
              };
            };

            if (decoded.eventName !== EVENT_NAME) continue;

            const impl = decoded.args.asset;
            const key = impl.toLowerCase();

            const prev = approved.get(key);
            const bn = l.blockNumber ?? BigInt(0);
            const li = Number(l.logIndex ?? 0);

            if (!prev) {
              approved.set(key, {
                asset: impl,
                blockNumber: bn,
                tx: l.transactionHash as Hash,
                logIndex: li,
              });
            } else {
              if (bn > prev.blockNumber || (bn === prev.blockNumber && li > prev.logIndex)) {
                approved.set(key, {
                  asset: impl,
                  blockNumber: bn,
                  tx: l.transactionHash as Hash,
                  logIndex: li,
                });
              }
            }
          } catch {
          }
        }

        const impls = Array.from(approved.values());

        const rows: AssetCatalogItem[] = [];

        for (const it of impls) {
          try {
            const info = (await client.readContract({
              address: ADDR.assetRegistry,
              abi,
              functionName: "getAssetInfo",
              args: [it.asset],
            })) as {
              status: number;
              decimals: number;
              metadataURI: string;
              approvedAt: bigint;
            };

            rows.push({
              asset: it.asset,
              status: info.status as AssetStatus,
              decimals: Number(info.decimals),
              metadataURI: info.metadataURI,
              approvedAt: info.approvedAt,

              blockNumber: it.blockNumber,
              transactionHash: it.tx,
              logIndex: it.logIndex,
            });
          } catch {
          }
        }

        rows.sort((a, b) => {
          if (a.blockNumber === b.blockNumber) return b.logIndex - a.logIndex;
          return a.blockNumber > b.blockNumber ? -1 : 1;
        });

        if (!cancelled) setAssets(rows);
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, abi]);

  const assetAddresses = useMemo(
    () => assets.map((i) => i.asset),
    [assets]
  );

  return {
    assets,
    assetAddresses,
    isLoading,
    error,
    count: assets.length,
  };
}
