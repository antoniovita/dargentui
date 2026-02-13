import { http, createConfig } from "wagmi";
import { anvil } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [anvil],
  transports: {
    [anvil.id]: http("http://127.0.0.1:8545"),
  },
});
