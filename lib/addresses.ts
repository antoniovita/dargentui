import anvil from "../deployments/anvil.json";
type HexAddress = `0x${string}`;

function asAddr(v: unknown): HexAddress {
  if (typeof v !== "string" || !v.startsWith("0x")) throw new Error("Bad address in deployments json");
  return v as HexAddress;
}

const root: any = anvil;
const cfg = root.anvil ?? root;

export const ADDR = {
  factory: asAddr(cfg.factory),
  asset: asAddr(cfg.asset),
  assetRegistry: asAddr(cfg.assetRegistry),
  productRegistry: asAddr(cfg.productRegistry),
  strategyRegistry: asAddr(cfg.strategyRegistry),
  stratImplLiquid: asAddr(cfg.stratImplLiquid),
  stratImplNonLiquid: asAddr(cfg.stratImplNonLiquid),
} as const;
