"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, PROJECT_TOKEN_ABI, DISTRIBUTOR_ABI } from "@/lib/abis/contracts";
import { formatUnits, parseUnits, isAddress } from "viem";
import { useState } from "react";
import { TxStatus } from "@/components/ui/TxStatus";

function InvestContent() {
  const params    = useSearchParams();
  const projectId = BigInt(params.get("project") ?? "1");
  const { address } = useAccount();

  const [transferTo,     setTransferTo]     = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [burnAmount,     setBurnAmount]     = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { data: info } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI,
    functionName: "getProject", args: [projectId],
  });

  const tokenAddr = info?.tokenAddress as `0x${string}` | undefined;

  const { data: balance,     refetch: refetchBalance }     = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "balanceOf",   args: [address!],         query: { enabled: !!tokenAddr && !!address } });
  const { data: totalSupply, refetch: refetchSupply }      = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "totalSupply",                           query: { enabled: !!tokenAddr } });
  const { data: maxSupply }                                 = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "maxSupply",                             query: { enabled: !!tokenAddr } });
  const { data: isPaused }                                  = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "paused",                                query: { enabled: !!tokenAddr } });
  const { data: distributorAddr }                           = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "dividendDistributor",                   query: { enabled: !!tokenAddr } });

  const hasDistributor = distributorAddr && distributorAddr !== "0x0000000000000000000000000000000000000000";

  const { data: pendingDivs, refetch: refetchDivs } = useReadContract({
    address: distributorAddr as `0x${string}`,
    abi: DISTRIBUTOR_ABI,
    functionName: "pendingDividends",
    args: [address!],
    query: { enabled: !!hasDistributor && !!address },
  });

  const { data: totalDeposited } = useReadContract({
    address: distributorAddr as `0x${string}`,
    abi: DISTRIBUTOR_ABI,
    functionName: "totalDeposited",
    query: { enabled: !!hasDistributor },
  });

  const refetchAll = () => { refetchBalance(); refetchSupply(); refetchDivs(); };

  const handleTransfer = () => {
    if (!tokenAddr || !isAddress(transferTo) || !transferAmount) return;
    writeContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "transfer", args: [transferTo as `0x${string}`, parseUnits(transferAmount, 18)] }, { onSuccess: refetchAll });
  };

  const handleBurn = () => {
    if (!tokenAddr || !burnAmount) return;
    writeContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "burn", args: [parseUnits(burnAmount, 18)] }, { onSuccess: refetchAll });
  };

  const handleClaim = () => {
    if (!distributorAddr) return;
    writeContract({ address: distributorAddr as `0x${string}`, abi: DISTRIBUTOR_ABI, functionName: "claimDividends" }, { onSuccess: refetchDivs });
  };

  if (!info) return <div className="loading-state">Cargando proyecto…</div>;

  const fmt = (v: bigint | undefined) => v !== undefined ? Number(formatUnits(v, 18)).toLocaleString("es-AR", { maximumFractionDigits: 4 }) : "—";
  const fmtUsdc = (v: bigint | undefined) => v !== undefined ? (Number(v) / 1e6).toLocaleString("es-AR", { minimumFractionDigits: 2 }) : "—";

  return (
    <div className="page">
      <div className="page-header">
        <div className="breadcrumb"><a href="/">← Proyectos</a> / {info.name}</div>
        <h1 className="page-title">{info.name}</h1>
        <div className="token-badge-row">
          <span className="project-badge large">{info.symbol}</span>
          {isPaused && <span className="badge-paused">PAUSADO</span>}
          {hasDistributor && <span className="badge-dividends">DIVIDENDOS ACTIVOS</span>}
        </div>
      </div>

      {isPaused && (
        <div className="alert-paused">⚠️ Este proyecto está pausado. Las transferencias y operaciones están bloqueadas temporalmente.</div>
      )}

      <div className="stats-row">
        <div className="stat-card"><span className="stat-label">Tu balance</span><span className="stat-value">{fmt(balance)} {info.symbol}</span></div>
        <div className="stat-card"><span className="stat-label">Supply emitido</span><span className="stat-value">{fmt(totalSupply)}</span></div>
        <div className="stat-card"><span className="stat-label">Supply máximo</span><span className="stat-value">{fmt(maxSupply)}</span></div>
        {hasDistributor && <div className="stat-card accent"><span className="stat-label">Dividendos pendientes</span><span className="stat-value">{fmtUsdc(pendingDivs)} USDC</span></div>}
        {hasDistributor && <div className="stat-card"><span className="stat-label">Total distribuido</span><span className="stat-value">{fmtUsdc(totalDeposited)} USDC</span></div>}
      </div>

      {hasDistributor && pendingDivs !== undefined && pendingDivs > 0n && (
        <div className="panel highlight">
          <h3>💰 Tenés {fmtUsdc(pendingDivs)} USDC disponibles para retirar</h3>
          <p className="panel-desc">Los dividendos se calculan proporcionalmente a tu participación en el momento de cada distribución.</p>
          <button onClick={handleClaim} disabled={isPending} className="btn-primary">
            {isPending ? "Procesando…" : "Retirar dividendos"}
          </button>
          <TxStatus hash={txHash} />
        </div>
      )}

      <div className="panels-grid">
        <div className="panel">
          <h3>↗ Transferir tokens</h3>
          <input className="input" type="text" placeholder="Dirección destino (0x…)" value={transferTo} onChange={e => setTransferTo(e.target.value)} />
          <input className="input" type="number" placeholder={`Cantidad ${info.symbol}`} value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
          <button onClick={handleTransfer} disabled={isPending || !!isPaused} className="btn-secondary">
            {isPending ? "Enviando…" : "Transferir"}
          </button>
          <TxStatus hash={txHash} />
        </div>

        <div className="panel">
          <h3>🔥 Quemar tokens</h3>
          <p className="panel-desc">Quemar tokens reduce el supply total de forma permanente.</p>
          <input className="input" type="number" placeholder={`Cantidad ${info.symbol}`} value={burnAmount} onChange={e => setBurnAmount(e.target.value)} />
          <button onClick={handleBurn} disabled={isPending || !!isPaused} className="btn-danger-outline">
            {isPending ? "Procesando…" : "Quemar"}
          </button>
          <TxStatus hash={txHash} />
        </div>
      </div>

      <div className="panel info-panel">
        <h3>ℹ️ Información del contrato</h3>
        <div className="info-rows">
          <div className="info-row"><span>Token address</span><code>{tokenAddr}</code></div>
          <div className="info-row"><span>Creador</span><code>{info.projectOwner}</code></div>
          {hasDistributor && <div className="info-row"><span>Distributor</span><code>{distributorAddr}</code></div>}
        </div>
      </div>
    </div>
  );
}

export default function InvestPage() {
  return (
    <Suspense fallback={<div className="loading-state">Cargando…</div>}>
      <InvestContent />
    </Suspense>
  );
}
