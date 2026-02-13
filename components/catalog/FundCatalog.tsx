"use client";
import { useFundList } from "../../hooks/fund/useFundList";
import { Search } from "lucide-react";
import { useState } from "react";

const mockFunds = [
  {
    fund: "ETH Lending",
    asset: "USDC",
    sharePrice: 190.5,
    riskTier: 5,
    manager: "Bradesco",
    apy: 9
  },
  {
    fund: "ETH Lending",
    asset: "USDC",
    sharePrice: 190.5,
    riskTier: 2,
    manager: "Bradesco",
    apy: 9
  },
  {
    fund: "ETH Lending",
    asset: "USDC",
    sharePrice: 190.5,
    riskTier: 5,
    manager: "Bradesco",
    apy: 9
  },
  {
    fund: "ETH Lending",
    asset: "USDC",
    sharePrice: 190.5,
    riskTier: 5,
    manager: "Bradesco",
    apy: 9
  },
  {
    fund: "ETH Lending",
    asset: "USDC",
    sharePrice: 190.5,
    riskTier: 5,
    manager: "Bradesco",
    apy: 9
  },
];

export const FundCatalog = () => {
  const { items, isLoading, error, count } = useFundList();
  const [searchTerm, setSearchTerm] = useState("");

  const fundData = items.length > 0 ? items : mockFunds;

  const filteredItems = fundData.filter((fund) => 
    fund.fund.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskTierColor = (tier: number) => {
    if (tier === 5) return "text-red-500";
    if (tier === 2) return "text-yellow-500";
    return "text-white";
  };

  return (
    <div className="rounded-2xl bg-[#191919] border border-[#292929] pt-6">     
       
        <div className="mb-6 flex justify-end px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search for funds here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-[#262626] rounded-xl pl-11 pr-4 py-2.5 text-zinc-500 placeholder-zinc-600 text-sm focus:outline-none focus:border-[#3a3a3a] transition-colors"
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-400 py-12">
            Loading funds...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-12">
            Error: {String(error.message ?? error)}
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Name</th>
                  <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Asset</th>
                  <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Share Price</th>
                  <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Risk Tier</th>
                  <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">Creator</th>
                  <th className="text-left py-3 px-8 text-gray-300 font-normal text-xs">APY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredItems.map((fund, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                  >
                    <td className="py-6 px-8 text-white text-sm">
                      {fund.fund}
                    </td>
                    <td className="py-6 px-8 text-gray-300 text-sm">
                      {fund.asset}
                    </td>
                    <td className="py-6 px-8 text-white text-sm">
                      {fund.sharePrice || 190.5}
                    </td>
                    <td className={`py-6 px-8 font-medium text-sm ${getRiskTierColor(fund.riskTier || 5)}`}>
                      {fund.riskTier || 5}
                    </td>
                    <td className="py-6 px-8 text-gray-300 text-sm">
                      {fund.manager}
                    </td>
                    <td className="py-6 px-8 text-white text-sm">
                      {fund.apy || 9}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No funds found
              </div>
            )}
          </div>
        )}
    </div>
  );
}