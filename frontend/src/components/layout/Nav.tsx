"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "@/lib/abis/contracts";

const links = [
  { href: "/",          label: "Proyectos" },
  { href: "/dashboard", label: "Mi cartera" },
  { href: "/admin",     label: "Admin" },
];

export function Nav() {
  const pathname  = usePathname();
  const { address } = useAccount();

  const { data: isAdmin } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "hasRole",
    args: ["0x0000000000000000000000000000000000000000000000000000000000000000", address!],
    query: { enabled: !!address },
  });

  const { data: hasCreatorRole } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "hasRole",
    args: ["0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", address!],
    query: { enabled: !!address },
  });

  const showAdmin = isAdmin || hasCreatorRole;

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <span className="nav-logo-icon">⚡</span>
        <span className="nav-logo-text">LINKEN</span>
      </Link>

      <div className="nav-links">
        {links.map(({ href, label }) => {
          if (href === "/admin" && !showAdmin) return null;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
    </nav>
  );
}
