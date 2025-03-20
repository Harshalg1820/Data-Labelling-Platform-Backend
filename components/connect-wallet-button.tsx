"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ConnectWalletButton() {
  const { connected, publicKey } = useWallet()
  const [showDialog, setShowDialog] = useState(false)

  if (connected && publicKey) {
    return (
      <Button variant="outline" className="font-mono" asChild>
        <a href="/dashboard">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </a>
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>Connect Wallet</Button>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
            <DialogDescription>Connect your Solana wallet to access the platform.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <WalletMultiButton />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            New to Solana?{" "}
            <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="underline">
              Get a Phantom wallet
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

