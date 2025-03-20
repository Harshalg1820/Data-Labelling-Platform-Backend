import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  type Keypair,
} from "@solana/web3.js"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import { createTaskInstruction, approveTaskInstruction } from "./program"

// Get Solana connection
export function getSolanaConnection(): Connection {
  return new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com")
}

// Send payment from one wallet to another
export async function sendPayment(
  wallet: WalletContextState,
  recipientAddress: string,
  amountInSol: number,
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  try {
    const connection = getSolanaConnection()
    const recipient = new PublicKey(recipientAddress)
    const lamports = amountInSol * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports,
      }),
    )

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = wallet.publicKey

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction)

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    // Confirm the transaction
    await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error("Error sending payment:", error)
    throw error
  }
}

// Get wallet balance
export async function getWalletBalance(publicKey: PublicKey): Promise<number> {
  try {
    const connection = getSolanaConnection()
    const balance = await connection.getBalance(publicKey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    throw error
  }
}

// Create a task on the blockchain
export async function createTask(
  wallet: WalletContextState,
  taskPubkey: PublicKey,
  reward: number,
  taskDataHash: string,
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  try {
    const connection = getSolanaConnection()

    // Create the instruction
    const instruction = createTaskInstruction(wallet.publicKey, taskPubkey, reward, taskDataHash)

    // Create transaction
    const transaction = new Transaction().add(instruction)

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = wallet.publicKey

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction)

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    // Confirm the transaction
    await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error("Error creating task on blockchain:", error)
    throw error
  }
}

// Approve a task and release payment
export async function approveTask(
  wallet: WalletContextState,
  workerPubkey: PublicKey,
  taskPubkey: PublicKey,
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  try {
    const connection = getSolanaConnection()

    // Create the instruction
    const instruction = approveTaskInstruction(wallet.publicKey, workerPubkey, taskPubkey)

    // Create transaction
    const transaction = new Transaction().add(instruction)

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = wallet.publicKey

    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction)

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    // Confirm the transaction
    await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error("Error approving task on blockchain:", error)
    throw error
  }
}

// Server-side function to create a transaction using a keypair
export async function createServerTransaction(
  fromKeypair: Keypair,
  toPublicKey: PublicKey,
  amountInSol: number,
): Promise<string> {
  try {
    const connection = getSolanaConnection()
    const lamports = amountInSol * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports,
      }),
    )

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromKeypair.publicKey

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair])

    return signature
  } catch (error) {
    console.error("Error creating server transaction:", error)
    throw error
  }
}

