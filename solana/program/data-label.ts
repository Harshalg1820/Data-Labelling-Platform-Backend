// This is a simplified representation of what would be a Solana program
// In a real implementation, this would be compiled to BPF and deployed to the Solana blockchain

import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js"

// Program ID (this would be the deployed program's address)
export const PROGRAM_ID = new PublicKey("DataLabe1111111111111111111111111111111111111")

// Program instruction types
export enum InstructionType {
  CreateTask = 0,
  AcceptTask = 1,
  SubmitTask = 2,
  ApproveTask = 3,
  RejectTask = 4,
}

// Create a new task
export function createTaskInstruction(
  providerPubkey: PublicKey,
  taskPubkey: PublicKey,
  reward: number,
  taskDataHash: string,
): TransactionInstruction {
  const data = Buffer.alloc(9 + 32)
  data.writeUInt8(InstructionType.CreateTask, 0)
  data.writeBigUInt64LE(BigInt(reward * LAMPORTS_PER_SOL), 1)
  Buffer.from(taskDataHash, "hex").copy(data, 9)

  return new TransactionInstruction({
    keys: [
      { pubkey: providerPubkey, isSigner: true, isWritable: true },
      { pubkey: taskPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  })
}

// Accept a task
export function acceptTaskInstruction(workerPubkey: PublicKey, taskPubkey: PublicKey): TransactionInstruction {
  const data = Buffer.alloc(1)
  data.writeUInt8(InstructionType.AcceptTask, 0)

  return new TransactionInstruction({
    keys: [
      { pubkey: workerPubkey, isSigner: true, isWritable: true },
      { pubkey: taskPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  })
}

// Submit a completed task
export function submitTaskInstruction(
  workerPubkey: PublicKey,
  taskPubkey: PublicKey,
  submissionDataHash: string,
): TransactionInstruction {
  const data = Buffer.alloc(1 + 32)
  data.writeUInt8(InstructionType.SubmitTask, 0)
  Buffer.from(submissionDataHash, "hex").copy(data, 1)

  return new TransactionInstruction({
    keys: [
      { pubkey: workerPubkey, isSigner: true, isWritable: true },
      { pubkey: taskPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  })
}

// Approve a task and release payment
export function approveTaskInstruction(
  providerPubkey: PublicKey,
  workerPubkey: PublicKey,
  taskPubkey: PublicKey,
): TransactionInstruction {
  const data = Buffer.alloc(1)
  data.writeUInt8(InstructionType.ApproveTask, 0)

  return new TransactionInstruction({
    keys: [
      { pubkey: providerPubkey, isSigner: true, isWritable: true },
      { pubkey: workerPubkey, isSigner: false, isWritable: true },
      { pubkey: taskPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  })
}

// Reject a task submission
export function rejectTaskInstruction(
  providerPubkey: PublicKey,
  taskPubkey: PublicKey,
  reason: string,
): TransactionInstruction {
  const reasonBuffer = Buffer.from(reason)
  const data = Buffer.alloc(1 + 1 + reasonBuffer.length)
  data.writeUInt8(InstructionType.RejectTask, 0)
  data.writeUInt8(reasonBuffer.length, 1)
  reasonBuffer.copy(data, 2)

  return new TransactionInstruction({
    keys: [
      { pubkey: providerPubkey, isSigner: true, isWritable: true },
      { pubkey: taskPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  })
}

