"use client"

import type React from "react"

import { useMemo } from "react"
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Import Solana wallet styles
import "@solana/wallet-adapter-react-ui/styles.css"

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

