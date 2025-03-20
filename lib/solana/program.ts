import { PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js"

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
  data.writeBigUInt64LE(BigInt(reward * 1000000000), 1)
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

