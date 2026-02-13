"use client";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address, Hash } from "viem";
import { decodeEventLog } from "viem";

import ProductRegistryArtifact from "../../contracts/ProductRegistry.json";
import { ADDR } from "../../lib/addresses";

export type FundCatalogItem = {
  fund: Address;
  manager: Address;
  asset: Address;
  productOwner: Address;
  fundType: number;
  metadataURI: string;

  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
};

export function useFundList() {
  const client = usePublicClient();
  const abi = (ProductRegistryArtifact as any).abi;

  const [items, setItems] = useState<FundCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const EVENT_NAME = "ProductRegistered";

  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const logs = await client.getLogs({
          address: ADDR.productRegistry,
          fromBlock: BigInt(0),
          toBlock: "latest",
        });

        const rows: FundCatalogItem[] = [];

        for (const l of logs) {
          try {
            const decoded = decodeEventLog({
              abi,
              data: l.data,
              topics: l.topics,
            }) as {
              eventName: string;
              args: {
                fund: Address;
                manager: Address;
                asset: Address;
                productOwner: Address;
                fundType: bigint;
                metadataURI: string;
              };
            };

            if (decoded.eventName !== EVENT_NAME) continue;

            rows.push({
              fund: decoded.args.fund,
              manager: decoded.args.manager,
              asset: decoded.args.asset,
              productOwner: decoded.args.productOwner,
              fundType: Number(decoded.args.fundType),
              metadataURI: decoded.args.metadataURI,
              blockNumber: l.blockNumber ?? BigInt(0),
              transactionHash: l.transactionHash as Hash,
              logIndex: Number(l.logIndex ?? 0),
            });
          } catch {
          }
        }

        const byFund = new Map<string, FundCatalogItem>();
        for (const r of rows) {
          byFund.set(r.fund.toLowerCase(), r);
        }

        const sorted = Array.from(byFund.values()).sort((a, b) => {
          if (a.blockNumber === b.blockNumber) return b.logIndex - a.logIndex;
          return a.blockNumber > b.blockNumber ? -1 : 1;
        });

        if (!cancelled) setItems(sorted);
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

  const funds = useMemo(() => items.map((i) => i.fund), [items]);

  return {
    items,
    funds,
    isLoading,
    error,
    count: items.length,
  };
}
