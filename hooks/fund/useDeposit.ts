import { useMemo, useState } from "react";
import { usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Address, Hash } from "viem";
import { decodeEventLog } from "viem";

import ProductFactoryArtifact from "../../contracts/IProductFactory.json";
import ProductRegistryArtifact from "../../contracts/IProductRegistry.json";
import { ADDR } from "../../lib/addresses";


export function useDeposit() {

}