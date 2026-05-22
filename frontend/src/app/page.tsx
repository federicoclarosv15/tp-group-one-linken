"use client";

import { useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS, PROJECT_TOKEN_ABI } from "@/lib/abis/contracts";
import { formatUnits } from "viem";
import Link from "next/link";

function ProjectCard({ id }: { id: number }) {
  const { data: info } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getProject",
    args: [BigInt(id)],
  });

  const { data: totalSupply } = useReadContract({
    address: info?.tokenAddress as `0x${string}`,
    abi: PROJECT_TOKEN_ABI,
    functionName: "totalSupply",
    query: { enabled: !!info?.tokenAddress },
  });

  const { data: maxSupply } = useReadContract({
    address: info?.tokenAddress as `0x${string}`,
    abi: PROJECT_TOKEN_ABI,
    functionName: "maxSupply",
    query: { enabled: !!info?.tokenAddress },
  });

  const { data: isPaused } = useReadContract({
    address: info?.tokenAddress as `0x${string}`,
    abi: PROJECT_TOKEN_ABI,
    functionName: "paused",
    query: { enabled: !!info?.tokenAddress },
  });

  const { data: distributor } = useReadContract({
    address: info?.tokenAddress as `0x${string}`,
    abi: PROJECT_TOKEN_ABI,
    functionName: "dividendDistributor",
    query: { enabled: !!info?.tokenAddress },
  });

  if (!info) return <div className="project-card skeleton" />;

  const pct = totalSupply && maxSupply && maxSupply > 0n
    ? Number((totalSupply * 100n) / maxSupply)
    : 0;

  const hasDistributor = distributor && distributor !== "0x0000000000000000000000000000000000000000";

  return (
    <div className={`project-card ${isPaused ? "paused" : ""}`}>
      <div className="project-card-header">
        <div className="project-badge">{info.symbol}</div>
        {isPaused && <span className="badge-paused">PAUSADO</span>}
        {hasDistributor && <span className="badge-dividends">DIVIDENDOS</span>}
      </div>
      <h3 className="project-name">{info.name}</h3>
      <div className="project-meta">
        <span className="project-owner">
          Creador: {info.projectOwner.slice(0, 6)}…{info.projectOwner.slice(-4)}
        </span>
      </div>
      <div className="supply-bar-wrap">
        <div className="supply-bar-labels">
          <span>Supply emitido</span>
          <span>{pct}%</span>
        </div>
        <div className="supply-bar">
          <div className="supply-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="supply-numbers">
          <span>{totalSupply ? Number(formatUnits(totalSupply, 18)).toLocaleString("es-AR") : "—"}</span>
          <span>/ {maxSupply ? Number(formatUnits(maxSupply, 18)).toLocaleString("es-AR") : "—"}</span>
        </div>
      </div>
      <div className="project-actions">
        <Link href={`/invest?project=${id}`} className="btn-primary">
          Ver / Invertir →
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: count } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "projectCount",
  });

  const total = count ? Number(count) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Proyectos energéticos</h1>
        <p className="page-subtitle">
          Invertí en proyectos de generación renovable y recibí dividendos proporcionales a tu participación.
        </p>
      </div>

      {total === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <p>No hay proyectos registrados todavía.</p>
          <p className="muted">Los creadores con rol habilitado pueden publicar nuevos proyectos desde el panel Admin.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {Array.from({ length: total }, (_, i) => (
            <ProjectCard key={i + 1} id={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
