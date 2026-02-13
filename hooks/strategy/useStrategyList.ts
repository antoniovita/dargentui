"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address, Hash } from "viem";
import { decodeEventLog } from "viem";

import StrategyRegistryArtifact from "../../contracts/StrategyRegistry.json";
import { ADDR } from "../../lib/addresses";

export enum StrategyStatus {
  NONE = 0,
  ACTIVE = 1,
  INACTIVE = 2,
  DEPRECATED = 3
}

export type StrategyCatalogItem = {
  implementation: Address;

  status: StrategyStatus;
  riskTier: number;
  riskScore: number;
  isLiquid: boolean;
  metadataURI: string;
  approvedAt: bigint;

  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
};

export function useStrategyList() {
  const client = usePublicClient();
  const abi = (StrategyRegistryArtifact as any).abi;

  const [implementations, setImplementations] = useState<StrategyCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const EVENT_NAME = "StrategyApproved";

  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const logs = await client.getLogs({
          address: ADDR.strategyRegistry,
          fromBlock: BigInt(0),
          toBlock: "latest",
        });

        const approved = new Map<string, { implementation: Address; blockNumber: bigint; tx: Hash; logIndex: number }>();

        for (const l of logs) {
          try {
            const decoded = decodeEventLog({
              abi,
              data: l.data,
              topics: l.topics,
            }) as {
              eventName: string;
              args: {
                implementation: Address;
                approvedAt: bigint;
              };
            };

            if (decoded.eventName !== EVENT_NAME) continue;

            const impl = decoded.args.implementation;
            const key = impl.toLowerCase();

            const prev = approved.get(key);
            const bn = l.blockNumber ?? BigInt(0);
            const li = Number(l.logIndex ?? 0);

            if (!prev) {
              approved.set(key, {
                implementation: impl,
                blockNumber: bn,
                tx: l.transactionHash as Hash,
                logIndex: li,
              });
            } else {
              if (bn > prev.blockNumber || (bn === prev.blockNumber && li > prev.logIndex)) {
                approved.set(key, {
                  implementation: impl,
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

        const rows: StrategyCatalogItem[] = [];

        for (const it of impls) {
          try {
            const info = (await client.readContract({
              address: ADDR.strategyRegistry,
              abi,
              functionName: "getStrategyInfo",
              args: [it.implementation],
            })) as {
              status: number;
              riskTier: number;
              riskScore: number;
              isLiquid: boolean;
              metadataURI: string;
              approvedAt: bigint;
            };

            rows.push({
              implementation: it.implementation,
              status: info.status as StrategyStatus,
              riskTier: Number(info.riskTier),
              riskScore: Number(info.riskScore),
              isLiquid: Boolean(info.isLiquid),
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

        if (!cancelled) setImplementations(rows);
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

  const implementationAddresses = useMemo(
    () => implementations.map((i) => i.implementation),
    [implementations]
  );

  return {
    implementations,
    implementationAddresses,
    isLoading,
    error,
    count: implementations.length,
  };
}
