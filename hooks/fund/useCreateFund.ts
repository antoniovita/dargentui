import { useMemo, useState } from "react";
import { usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Address, Hash } from "viem";
import { decodeEventLog } from "viem";

import ProductFactoryArtifact from "../../contracts/ProductFactory.json";
import ProductRegistryArtifact from "../../contracts/ProductRegistry.json";
import { ADDR } from "../../lib/addresses";


export type CreateFundParams = {
  fundType: number;
  asset: Address;
  fundMetadataURI: string;

  bufferBps: number;
  mgmtFeeBps: number;
  perfFeeBps: number;

  managerFeeRecipient: Address;
  strategyImplementations: Address[];
  weightsBps: number[];
};

export type CreateFundResult = {
  txHash?: Hash;
  fund?: Address;
  manager?: Address;
};

export function useCreateFund() {

  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();

  const [txHash, setTxHash] = useState<Hash | undefined>(undefined);
  const [result, setResult] = useState<CreateFundResult>({});

  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  const factoryAbi = (ProductFactoryArtifact as any).abi;
  const registryAbi = (ProductRegistryArtifact as any).abi;

  const PRODUCT_EVENT_NAME = "ProductRegistered";

  async function createFund(p: CreateFundParams) {

    const params = {
      fundType: p.fundType,
      asset: p.asset,
      fundMetadataURI: p.fundMetadataURI,
      bufferBps: p.bufferBps,
      mgmtFeeBps: p.mgmtFeeBps,
      perfFeeBps: p.perfFeeBps,
      managerFeeRecipient: p.managerFeeRecipient,
      strategyImplementations: p.strategyImplementations,
      weightsBps: p.weightsBps,
    } as const;


    const hash = await writeContractAsync({
      address: ADDR.factory,
      abi: factoryAbi,
      functionName: "createProduct",
      args: [params],
    });

    setTxHash(hash);
    setResult({ txHash: hash });

    return hash;
  }

  async function extractFromReceipt() {
    if (!receipt) return;
    if (!publicClient) return;

    const logs = receipt.logs.filter(
      (l) => l.address.toLowerCase() === ADDR.productRegistry.toLowerCase()
    );

    for (const l of logs) {
      try {
        const decoded = decodeEventLog({
          abi: registryAbi,
          data: l.data,
          topics: l.topics,
        }) as { eventName: string; args: { fund?: Address; manager?: Address } };

        if (decoded.eventName !== PRODUCT_EVENT_NAME) continue;

        const fund = decoded.args.fund as Address | undefined;
        const manager = decoded.args.manager as Address | undefined;

        if (!fund || !manager) continue;

        setResult((r) => ({ ...r, fund, manager }));

        return { fund, manager };

      } catch {

      }
    }
  }

  useMemo(() => {
    void extractFromReceipt();
  }, [receipt?.transactionHash]);

  return {
    createFund,
    txHash: result.txHash,
    fund: result.fund,
    manager: result.manager,
    isPending,
    isConfirming,
  };
}
