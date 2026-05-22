"use client";

import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, PROJECT_TOKEN_ABI, DISTRIBUTOR_ABI, USDC_ABI, USDC_ADDRESS } from "@/lib/abis/contracts";
import { formatUnits } from "viem";
import { useWriteContract } from "wagmi";
import { TxStatus } from "@/components/ui/TxStatus";
import Link from "next/link";

function ProjectRow({ id, holderAddress }: { id: number; holderAddress: `0x${string}` }) {
  const { data: info } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getProject", args: [BigInt(id)] });
  const tokenAddr = info?.tokenAddress as `0x${string}` | undefined;

  const { data: balance }     = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "balanceOf",          args: [holderAddress], query: { enabled: !!tokenAddr } });
  const { data: maxSupply }   = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "maxSupply",                                 query: { enabled: !!tokenAddr } });
  const { data: distAddr }    = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "dividendDistributor",                        query: { enabled: !!tokenAddr } });

  const hasDistributor = distAddr && distAddr !== "0x0000000000000000000000000000000000000000";

  const { data: pending, refetch } = useReadContract({
    address: distAddr as `0x${string}`, abi: DISTRIBUTOR_ABI,
    functionName: "pendingDividends", args: [holderAddress],
    query: { enabled: !!hasDistributor },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const handleClaim = () => {
    if (!distAddr) return;
    writeContract({ address: distAddr as `0x${string}`, abi: DISTRIBUTOR_ABI, functionName: "claimDividends" }, { onSuccess: () => refetch() });
  };

  if (!info || !balance || balance === 0n) return null;

  const pct = balance && maxSupply && maxSupply > 0n
    ? ((Number(balance) / Number(maxSupply)) * 100).toFixed(3)
    : "0";

  const fmt     = (v: bigint) => Number(formatUnits(v, 18)).toLocaleString("es-AR", { maximumFractionDigits: 4 });
  const fmtUsdc = (v: bigint) => (Number(v) / 1e6).toLocaleString("es-AR", { minimumFractionDigits: 2 });

  return (
    <div className="portfolio-row">
      <div className="portfolio-row-left">
        <span className="project-badge small">{info.symbol}</span>
        <div>
          <div className="portfolio-name">{info.name}</div>
          <div className="portfolio-balance">{fmt(balance)} tokens · {pct}% participación</div>
        </div>
      </div>
      <div className="portfolio-row-right">
        {hasDistributor && pending !== undefined && (
          <div className="portfolio-dividends">
            <span className={`pending-amount ${pending > 0n ? "has-pending" : ""}`}>
              {fmtUsdc(pending)} USDC
            </span>
            {pending > 0n && (
              <>
                <button onClick={handleClaim} disabled={isPending} className="btn-claim">
                  {isPending ? "…" : "Retirar"}
                </button>
                <TxStatus hash={txHash} />
              </>
            )}
          </div>
        )}
        <Link href={`/invest?project=${id}`} className="btn-ghost">Ver →</Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const { data: count }       = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "projectCount" });
  const { data: usdcBalance } = useReadContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf", args: [address!], query: { enabled: !!address } });

  const total = count ? Number(count) : 0;

  if (!isConnected) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">🔌</span>
          <p>Conectá tu wallet para ver tu cartera.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mi cartera</h1>
        <p className="page-subtitle">Tus participaciones y dividendos pendientes en todos los proyectos.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Balance USDC</span>
          <span className="stat-value">{usdcBalance !== undefined ? (Number(usdcBalance) / 1e6).toLocaleString("es-AR", { minimumFractionDigits: 2 }) : "—"} USDC</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Wallet</span>
          <span className="stat-value mono">{address?.slice(0, 8)}…{address?.slice(-6)}</span>
        </div>
      </div>

      <div className="portfolio-list">
        <h2 className="section-title">Participaciones activas</h2>
        {total === 0 ? (
          <div className="empty-state small">
            <p>No hay proyectos en la plataforma todavía.</p>
          </div>
        ) : (
          Array.from({ length: total }, (_, i) => (
            <ProjectRow key={i + 1} id={i + 1} holderAddress={address!} />
          ))
        )}
      </div>
    </div>
  );
}
