"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  FACTORY_ABI, FACTORY_ADDRESS,
  PROJECT_TOKEN_ABI,
  DISTRIBUTOR_ABI,
  USDC_ABI, USDC_ADDRESS
} from "@/lib/abis/contracts";
import { parseUnits, isAddress, formatUnits } from "viem";
import { TxStatus } from "@/components/ui/TxStatus";

// ── Panel genérico ────────────────────────────────────────────
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// ── Sección: crear proyecto ───────────────────────────────────
function CreateProjectPanel() {
  const [name,    setName]    = useState("");
  const [symbol,  setSymbol]  = useState("");
  const [initial, setInitial] = useState("");
  const [max,     setMax]     = useState("");
  const [owner,   setOwner]   = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const handleCreate = () => {
    if (!name || !symbol || !max || !isAddress(owner)) return;
    writeContract({
      address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "createProject",
      args: [name, symbol, parseUnits(initial || "0", 18), parseUnits(max, 18), owner as `0x${string}`],
    });
  };

  return (
    <Panel title="🌱 Crear nuevo proyecto">
      <div className="form-grid">
        <input className="input" placeholder="Nombre (ej: Campo Solar Mendoza)" value={name}    onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Símbolo (ej: CSM)"                value={symbol}  onChange={e => setSymbol(e.target.value)} />
        <input className="input" type="number" placeholder="Supply inicial (tokens)" value={initial} onChange={e => setInitial(e.target.value)} />
        <input className="input" type="number" placeholder="Supply máximo (tokens)"  value={max}     onChange={e => setMax(e.target.value)} />
        <input className="input col-span-2" placeholder="Address del creador (0x…)" value={owner}   onChange={e => setOwner(e.target.value)} />
      </div>
      <button onClick={handleCreate} disabled={isPending} className="btn-primary">
        {isPending ? "Creando…" : "Crear proyecto"}
      </button>
      <TxStatus hash={txHash} />
    </Panel>
  );
}

// ── Sección: gestionar roles ──────────────────────────────────
function RolesPanel() {
  const [account, setAccount] = useState("");
  const [action,  setAction]  = useState<"grant" | "revoke">("grant");
  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { data: creatorRole } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "CREATOR_ROLE" });

  const handleRole = () => {
    if (!isAddress(account) || !creatorRole) return;
    writeContract({
      address: FACTORY_ADDRESS, abi: FACTORY_ABI,
      functionName: action === "grant" ? "grantRole" : "revokeRole",
      args: [creatorRole, account as `0x${string}`],
    });
  };

  return (
    <Panel title="🔑 Gestionar CREATOR_ROLE">
      <p className="panel-desc">Habilitá o deshabilitá desarrolladores para crear proyectos.</p>
      <input className="input" placeholder="Address del desarrollador (0x…)" value={account} onChange={e => setAccount(e.target.value)} />
      <div className="btn-row">
        <button onClick={() => setAction("grant")}  className={`btn-toggle ${action === "grant"  ? "active" : ""}`}>Otorgar</button>
        <button onClick={() => setAction("revoke")} className={`btn-toggle ${action === "revoke" ? "active" : ""}`}>Revocar</button>
      </div>
      <button onClick={handleRole} disabled={isPending} className="btn-primary">
        {isPending ? "Procesando…" : action === "grant" ? "Otorgar CREATOR_ROLE" : "Revocar CREATOR_ROLE"}
      </button>
      <TxStatus hash={txHash} />
    </Panel>
  );
}

// ── Sección: gestionar un ProjectToken específico ─────────────
function TokenAdminPanel() {
  const { data: count } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "projectCount" });
  const [selectedId, setSelectedId] = useState(1);
  const [mintTo,     setMintTo]     = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [distAddr,   setDistAddr]   = useState("");
  const [depositAmt, setDepositAmt] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { data: info } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI,
    functionName: "getProject", args: [BigInt(selectedId)],
  });
  const tokenAddr = info?.tokenAddress as `0x${string}` | undefined;

  const { data: isPaused,  refetch: refetchPaused }  = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "paused",               query: { enabled: !!tokenAddr } });
  const { data: currentDist }                         = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "dividendDistributor",   query: { enabled: !!tokenAddr } });
  const { data: totalSupply }                         = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "totalSupply",           query: { enabled: !!tokenAddr } });
  const { data: maxSupply }                           = useReadContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "maxSupply",             query: { enabled: !!tokenAddr } });

  const hasDistributor = currentDist && currentDist !== "0x0000000000000000000000000000000000000000";

  // USDC allowance para el distributor
  const { address } = useAccount();
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS, abi: USDC_ABI,
    functionName: "allowance", args: [address!, currentDist as `0x${string}`],
    query: { enabled: !!address && !!hasDistributor },
  });

  const handleMint = () => {
    if (!tokenAddr || !isAddress(mintTo) || !mintAmount) return;
    writeContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "mint", args: [mintTo as `0x${string}`, parseUnits(mintAmount, 18)] });
  };

  const handlePause = () => {
    if (!tokenAddr) return;
    writeContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: isPaused ? "unpause" : "pause" }, { onSuccess: () => refetchPaused() });
  };

  const handleSetDistributor = () => {
    if (!tokenAddr || !isAddress(distAddr)) return;
    writeContract({ address: tokenAddr, abi: PROJECT_TOKEN_ABI, functionName: "setDistributor", args: [distAddr as `0x${string}`] });
  };

  const handleApproveUsdc = () => {
    if (!hasDistributor) return;
    writeContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: "approve", args: [currentDist as `0x${string}`, parseUnits("1000000", 6)] }, { onSuccess: () => refetchAllowance() });
  };

  const handleDeposit = () => {
    if (!hasDistributor || !depositAmt) return;
    writeContract({ address: currentDist as `0x${string}`, abi: DISTRIBUTOR_ABI, functionName: "depositDividends", args: [parseUnits(depositAmt, 6)] });
  };

  const total = count ? Number(count) : 0;
  const fmt = (v: bigint | undefined) => v !== undefined ? Number(formatUnits(v, 18)).toLocaleString("es-AR") : "—";

  return (
    <Panel title="⚙️ Gestionar proyecto">
      <div className="form-row">
        <label className="input-label">Proyecto</label>
        <select className="input select" value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}>
          {Array.from({ length: total }, (_, i) => (
            <option key={i + 1} value={i + 1}>#{i + 1}</option>
          ))}
        </select>
      </div>

      {info && (
        <div className="token-info-strip">
          <span className="project-badge">{info.symbol}</span>
          <span>{info.name}</span>
          <span className="muted">Supply: {fmt(totalSupply)} / {fmt(maxSupply)}</span>
          {isPaused && <span className="badge-paused">PAUSADO</span>}
        </div>
      )}

      <div className="subpanel">
        <h4>Mintear tokens</h4>
        <input className="input" placeholder="Dirección destino (0x…)" value={mintTo}     onChange={e => setMintTo(e.target.value)} />
        <input className="input" type="number" placeholder="Cantidad"  value={mintAmount} onChange={e => setMintAmount(e.target.value)} />
        <button onClick={handleMint} disabled={isPending || !!isPaused} className="btn-primary">
          {isPending ? "Procesando…" : "Mintear"}
        </button>
      </div>

      <div className="subpanel">
        <h4>Circuit-breaker</h4>
        <button onClick={handlePause} disabled={isPending} className={isPaused ? "btn-success" : "btn-danger-outline"}>
          {isPaused ? "▶ Reanudar contrato" : "⏸ Pausar contrato"}
        </button>
      </div>

      <div className="subpanel">
        <h4>Conectar DividendDistributor</h4>
        {hasDistributor
          ? <p className="panel-desc">Distributor conectado: <code>{(currentDist as string).slice(0, 10)}…</code></p>
          : <>
              <input className="input" placeholder="Address del DividendDistributor (0x…)" value={distAddr} onChange={e => setDistAddr(e.target.value)} />
              <button onClick={handleSetDistributor} disabled={isPending} className="btn-primary">Conectar</button>
            </>
        }
      </div>

      {hasDistributor && (
        <div className="subpanel">
          <h4>Depositar dividendos (USDC)</h4>
          {allowance !== undefined && allowance < parseUnits("1", 6) && (
            <div className="alert-info">
              ℹ️ Necesitás aprobar USDC al distributor antes de depositar.
              <button onClick={handleApproveUsdc} disabled={isPending} className="btn-ghost">Aprobar 1.000.000 USDC</button>
            </div>
          )}
          <input className="input" type="number" placeholder="Monto en USDC (ej: 1000)" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} />
          <button onClick={handleDeposit} disabled={isPending} className="btn-primary">Depositar dividendos</button>
        </div>
      )}

      <TxStatus hash={txHash} />
    </Panel>
  );
}

// ── Página principal Admin ────────────────────────────────────
export default function AdminPage() {
  const { address, isConnected } = useAccount();

  const { data: isAdmin } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI,
    functionName: "hasRole",
    args: ["0x0000000000000000000000000000000000000000000000000000000000000000", address!],
    query: { enabled: !!address },
  });

  const { data: hasCreatorRole } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI,
    functionName: "hasRole",
    args: ["0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", address!],
    query: { enabled: !!address },
  });

  if (!isConnected) {
    return (
      <div className="page">
        <div className="empty-state"><span className="empty-icon">🔌</span><p>Conectá tu wallet para acceder al panel admin.</p></div>
      </div>
    );
  }

  if (!isAdmin && !hasCreatorRole) {
    return (
      <div className="page">
        <div className="empty-state"><span className="empty-icon">🚫</span><p>No tenés permisos para acceder a este panel.</p><p className="muted">Necesitás DEFAULT_ADMIN_ROLE o CREATOR_ROLE en la Factory.</p></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Panel de administración</h1>
        <p className="page-subtitle">
          {isAdmin ? "Admin de plataforma — acceso completo." : "Creador de proyectos — podés crear y gestionar tus proyectos."}
        </p>
      </div>

      <div className="admin-grid">
        {hasCreatorRole && <CreateProjectPanel />}
        {isAdmin && <RolesPanel />}
        <TokenAdminPanel />
      </div>
    </div>
  );
}
