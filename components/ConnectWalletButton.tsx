import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        return (
          <div className="flex items-center gap-3">
            {!connected && (
              <button
                onClick={openConnectModal}
                className="px-3 py-2 flex-row flex gap-2 text-[12px] rounded-lg bg-[#121212] text-white hover:bg-[#232323] transition-colors"
              >
                Connect Wallet
                <Wallet className="w-4 h-4" />
              </button>
            )}

            {connected && (
              <>
                <button
                  onClick={openChainModal}
                  className="px-3 py-2 flex items-center gap-2 text-[12px] font-medium rounded-lg bg-[#1f1f1f] text-gray-200 hover:bg-[#232323] transition-colors border border-[#2f2f2f]"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {chain?.name}
                </button>

                <button
                  onClick={openAccountModal}
                  className="px-4 py-2 text-[12px] font-medium rounded-lg bg-[#111111] text-white hover:bg-[#1a1a1a] transition-colors border border-[#2f2f2f]"
                >
                  {account?.displayName}
                </button>
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
