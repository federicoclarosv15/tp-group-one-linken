export const FACTORY_ADDRESS = (
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const USDC_ADDRESS = (
  process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// ── ProjectFactory ABI ────────────────────────────────────────
export const FACTORY_ABI = [
  { name: "projectCount",    type: "function", stateMutability: "view",      inputs: [],                                                                                                   outputs: [{ type: "uint256" }] },
  { name: "platformAdmin",   type: "function", stateMutability: "view",      inputs: [],                                                                                                   outputs: [{ type: "address" }] },
  { name: "paused",          type: "function", stateMutability: "view",      inputs: [],                                                                                                   outputs: [{ type: "bool" }] },
  { name: "CREATOR_ROLE",    type: "function", stateMutability: "view",      inputs: [],                                                                                                   outputs: [{ type: "bytes32" }] },
  { name: "DEFAULT_ADMIN_ROLE", type: "function", stateMutability: "view",   inputs: [],                                                                                                   outputs: [{ type: "bytes32" }] },
  { name: "hasRole",         type: "function", stateMutability: "view",      inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],                           outputs: [{ type: "bool" }] },
  { name: "getProject",      type: "function", stateMutability: "view",      inputs: [{ name: "projectId", type: "uint256" }],                                                            outputs: [{ type: "tuple", components: [{ name: "tokenAddress", type: "address" }, { name: "projectOwner", type: "address" }, { name: "name", type: "string" }, { name: "symbol", type: "string" }, { name: "exists", type: "bool" }] }] },
  { name: "isRegistered",    type: "function", stateMutability: "view",      inputs: [{ name: "tokenAddress", type: "address" }],                                                         outputs: [{ type: "bool" }] },
  { name: "createProject",   type: "function", stateMutability: "nonpayable", inputs: [{ name: "name", type: "string" }, { name: "symbol", type: "string" }, { name: "initialSupply", type: "uint256" }, { name: "maxSupply", type: "uint256" }, { name: "projectOwner", type: "address" }], outputs: [{ name: "projectId", type: "uint256" }, { name: "tokenAddress", type: "address" }] },
  { name: "grantRole",       type: "function", stateMutability: "nonpayable", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],                          outputs: [] },
  { name: "revokeRole",      type: "function", stateMutability: "nonpayable", inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],                          outputs: [] },
  { name: "pause",           type: "function", stateMutability: "nonpayable", inputs: [],                                                                                                  outputs: [] },
  { name: "unpause",         type: "function", stateMutability: "nonpayable", inputs: [],                                                                                                  outputs: [] },
  { name: "ProjectCreated",  type: "event",    inputs: [{ name: "projectId", type: "uint256", indexed: true }, { name: "tokenAddress", type: "address", indexed: true }, { name: "projectOwner", type: "address", indexed: true }, { name: "name", type: "string", indexed: false }, { name: "symbol", type: "string", indexed: false }, { name: "initialSupply", type: "uint256", indexed: false }, { name: "maxSupply", type: "uint256", indexed: false }] },
] as const;

// ── ProjectToken ABI ──────────────────────────────────────────
export const PROJECT_TOKEN_ABI = [
  { name: "name",          type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "string" }] },
  { name: "symbol",        type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "string" }] },
  { name: "totalSupply",   type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "uint256" }] },
  { name: "maxSupply",     type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "uint256" }] },
  { name: "paused",        type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "bool" }] },
  { name: "MINTER_ROLE",   type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "bytes32" }] },
  { name: "PAUSER_ROLE",   type: "function", stateMutability: "view",       inputs: [],                                                                                  outputs: [{ type: "bytes32" }] },
  { name: "DEFAULT_ADMIN_ROLE", type: "function", stateMutability: "view",  inputs: [],                                                                                  outputs: [{ type: "bytes32" }] },
  { name: "hasRole",       type: "function", stateMutability: "view",       inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],          outputs: [{ type: "bool" }] },
  { name: "balanceOf",     type: "function", stateMutability: "view",       inputs: [{ name: "account", type: "address" }],                                             outputs: [{ type: "uint256" }] },
  { name: "allowance",     type: "function", stateMutability: "view",       inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],        outputs: [{ type: "uint256" }] },
  { name: "dividendDistributor", type: "function", stateMutability: "view", inputs: [],                                                                                  outputs: [{ type: "address" }] },
  { name: "mint",          type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],            outputs: [] },
  { name: "burn",          type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }],                                             outputs: [] },
  { name: "transfer",      type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],            outputs: [{ type: "bool" }] },
  { name: "approve",       type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }],       outputs: [{ type: "bool" }] },
  { name: "pause",         type: "function", stateMutability: "nonpayable", inputs: [],                                                                                  outputs: [] },
  { name: "unpause",       type: "function", stateMutability: "nonpayable", inputs: [],                                                                                  outputs: [] },
  { name: "setDistributor", type: "function", stateMutability: "nonpayable", inputs: [{ name: "newDistributor", type: "address" }],                                    outputs: [] },
] as const;

// ── DividendDistributor ABI ───────────────────────────────────
export const DISTRIBUTOR_ABI = [
  { name: "totalDeposited",       type: "function", stateMutability: "view",       inputs: [],                                          outputs: [{ type: "uint256" }] },
  { name: "totalWithdrawn",       type: "function", stateMutability: "view",       inputs: [],                                          outputs: [{ type: "uint256" }] },
  { name: "paused",               type: "function", stateMutability: "view",       inputs: [],                                          outputs: [{ type: "bool" }] },
  { name: "DEPOSITOR_ROLE",       type: "function", stateMutability: "view",       inputs: [],                                          outputs: [{ type: "bytes32" }] },
  { name: "pendingDividends",     type: "function", stateMutability: "view",       inputs: [{ name: "holder", type: "address" }],       outputs: [{ type: "uint256" }] },
  { name: "totalDividendsEarned", type: "function", stateMutability: "view",       inputs: [{ name: "holder", type: "address" }],       outputs: [{ type: "uint256" }] },
  { name: "hasRole",              type: "function", stateMutability: "view",       inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }], outputs: [{ type: "bool" }] },
  { name: "claimDividends",       type: "function", stateMutability: "nonpayable", inputs: [],                                          outputs: [] },
  { name: "depositDividends",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }],       outputs: [] },
  { name: "pause",                type: "function", stateMutability: "nonpayable", inputs: [],                                          outputs: [] },
  { name: "unpause",              type: "function", stateMutability: "nonpayable", inputs: [],                                          outputs: [] },
  { name: "DividendsDeposited",   type: "event",    inputs: [{ name: "depositor", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
  { name: "DividendsWithdrawn",   type: "event",    inputs: [{ name: "holder",    type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
] as const;

// ── USDC ABI (mínimo) ─────────────────────────────────────────
export const USDC_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",       inputs: [{ name: "account", type: "address" }],                                       outputs: [{ type: "uint256" }] },
  { name: "allowance", type: "function", stateMutability: "view",       inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],   outputs: [{ type: "uint256" }] },
  { name: "approve",   type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }],   outputs: [{ type: "bool" }] },
] as const;
