import { useAccount, useReadContracts } from "wagmi";
import type { Address } from "viem";
import FundArtifact from "../../contracts/Fund.json";

export function useFund(fund?: Address) {
  const { address: user } = useAccount();
  const abi = (FundArtifact as any).abi;

  const enabled = Boolean(fund);

  const { data, isLoading, isError, error } = useReadContracts({
    allowFailure: true,
    query: { enabled },
    contracts: fund
      ? [
          { address: fund, abi, functionName: "asset" },
          { address: fund, abi, functionName: "manager" },
          { address: fund, abi, functionName: "bufferBps" },
          { address: fund, abi, functionName: "riskTier" },
          { address: fund, abi, functionName: "riskScore" },
          { address: fund, abi, functionName: "totalSupply" },
          ...(user ? [{ address: fund, abi, functionName: "balanceOf", args: [user] as const }] : []),
        ]
      : [],
  });

  const asset = data?.[0]?.result as Address | undefined;
  const manager = data?.[1]?.result as Address | undefined;
  const bufferBps = data?.[2]?.result != null ? Number(data?.[2]?.result) : undefined;
  const riskTier = data?.[3]?.result != null ? Number(data?.[3]?.result) : undefined;
  const riskScore = data?.[4]?.result != null ? Number(data?.[4]?.result) : undefined;
  const totalSupply = data?.[5]?.result as bigint | undefined;
  const userShares = user ? (data?.[6]?.result as bigint | undefined) : undefined;

  return {
    fund,
    asset,
    manager,
    bufferBps,
    riskTier,
    riskScore,
    totalSupply,
    userShares,
    isLoading,
    isError,
    error,
  };
}
