# Frontend — Linken Energy Platform

Interfaz web para interactuar con los contratos de la plataforma de tokenización de energías renovables.

Stack: Next.js 14 · RainbowKit v2 · wagmi v2 · viem

---

## Vistas

| Ruta | Descripción | Acceso |
|---|---|---|
| `/` | Lista de proyectos energéticos con supply y estado | Público |
| `/invest?project=N` | Detalle de proyecto: transferir, quemar, reclamar dividendos | Cualquier wallet |
| `/dashboard` | Cartera del inversor: participaciones y dividendos pendientes | Wallet conectada |
| `/admin` | Crear proyectos, gestionar roles, mintear, pausar, depositar dividendos | CREATOR_ROLE o DEFAULT_ADMIN_ROLE |

---

## Desarrollo local con Anvil

> Anvil es el nodo local de Foundry. Simula una blockchain completa en tu máquina,
> sin gastar gas real ni necesitar Sepolia. Es la opción recomendada para desarrollar
> y testear el frontend antes del deploy oficial.

### 1. Levantar Anvil

```bash
# En una terminal dedicada — dejala abierta
anvil
```

Anvil imprime 10 cuentas con 10.000 ETH cada una y sus private keys.
La primera cuenta (`Account 0`) es el deployer por defecto.

### 2. Importar una cuenta de Anvil en MetaMask

1. Abrí MetaMask → Importar cuenta → Clave privada
2. Pegá la private key de Account 0 (la que imprime anvil al arrancar):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. Agregá la red Anvil en MetaMask:
   - Nombre: `Anvil Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`

### 3. Deployar los contratos en Anvil

```bash
# Desde la carpeta contracts/
forge script script/DeployAll.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

El script imprime al final las addresses. Copiá los valores en `frontend/.env.local`.

### 4. Configurar el frontend

```bash
cd frontend
cp .env.example .env.local
```

Editá `.env.local`:
```bash
NEXT_PUBLIC_USE_ANVIL=true
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=cualquier_string  # no se usa en Anvil
NEXT_PUBLIC_FACTORY_ADDRESS=0x...   # del output del script
NEXT_PUBLIC_USDC_ADDRESS=0x...      # del output del script
```

### 5. Levantar el frontend

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

---

## Deploy en Sepolia (producción)

> ⚠️ Solo ejecutar después de que el grupo haya revisado y aprobado todos los contratos.
> En blockchain no hay rollbacks.

```bash
# 1. Cambiar .env.local
NEXT_PUBLIC_USE_ANVIL=false
NEXT_PUBLIC_FACTORY_ADDRESS=<address del deploy oficial>
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# 2. Rebuild
npm run build
npm start
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_USE_ANVIL` | `true` para Anvil local, `false` para Sepolia |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ID de WalletConnect (https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | Address del contrato ProjectFactory |
| `NEXT_PUBLIC_USDC_ADDRESS` | Address del USDC (mock en Anvil, Circle en Sepolia) |
