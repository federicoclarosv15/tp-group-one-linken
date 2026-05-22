"use client";

import { useWaitForTransactionReceipt } from "wagmi";

export function TxStatus({ hash }: { hash: `0x${string}` | undefined }) {
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  if (!hash) return null;
  const base = process.env.NEXT_PUBLIC_USE_ANVIL === "true"
    ? "http://localhost:8545"
    : "https://sepolia.etherscan.io";

  return (
    <div className={`tx-status ${isLoading ? "loading" : isSuccess ? "ok" : isError ? "err" : ""}`}>
      {isLoading && <span>⏳ Confirmando transacción…</span>}
      {isSuccess && (
        <span>
          ✅ Confirmada —{" "}
          {process.env.NEXT_PUBLIC_USE_ANVIL !== "true" && (
            <a href={`${base}/tx/${hash}`} target="_blank" rel="noreferrer">
              ver en Etherscan ↗
            </a>
          )}
          {process.env.NEXT_PUBLIC_USE_ANVIL === "true" && <code>{hash.slice(0, 18)}…</code>}
        </span>
      )}
      {isError && <span>❌ Error en la transacción</span>}
    </div>
  );
}
