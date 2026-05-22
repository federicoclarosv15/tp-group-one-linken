import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, anvil } from "wagmi/chains";

const isLocal = process.env.NEXT_PUBLIC_USE_ANVIL === "true";

export const config = getDefaultConfig({
  appName: "Linken Energy Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains: isLocal ? [anvil] : [sepolia],
  ssr: true,
});
