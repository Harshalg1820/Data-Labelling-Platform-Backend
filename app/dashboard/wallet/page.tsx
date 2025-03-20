"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionHistory } from "@/components/wallet/transaction-history"

export default function WalletPage() {
  const { publicKey } = useWallet()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    // This would be replaced with actual Solana RPC call to get balance
    const fetchBalance = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setWalletBalance(Math.random() * 10)
    }

    if (publicKey) {
      fetchBalance()
    }
  }, [publicKey])

  const handleDeposit = async () => {
    setIsDepositing(true)
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setWalletBalance((prev) =>
      prev !== null ? prev + Number.parseFloat(depositAmount) : Number.parseFloat(depositAmount),
    )
    setDepositAmount("")
    setIsDepositing(false)
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setWalletBalance((prev) => (prev !== null ? prev - Number.parseFloat(withdrawAmount) : 0))
    setWithdrawAmount("")
    setIsWithdrawing(false)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Wallet" text="Manage your Solana wallet and transactions" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Your current Solana balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">
              {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Loading..."}
            </div>
            <p className="text-sm text-muted-foreground">
              Wallet Address: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Copy Wallet Address
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Deposit or withdraw SOL</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (SOL)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleDeposit} disabled={!depositAmount || isDepositing}>
                  {isDepositing ? "Processing..." : "Deposit SOL"}
                </Button>
              </TabsContent>
              <TabsContent value="withdraw" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (SOL)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount ||
                    isWithdrawing ||
                    (walletBalance !== null && Number.parseFloat(withdrawAmount) > walletBalance)
                  }
                >
                  {isWithdrawing ? "Processing..." : "Withdraw SOL"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent transactions on the Solana blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

