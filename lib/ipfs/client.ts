import { create, type IPFSHTTPClient } from "ipfs-http-client"

// Configure auth settings for Infura or other IPFS providers
const projectId = process.env.IPFS_PROJECT_ID
const projectSecret = process.env.IPFS_PROJECT_SECRET
const auth =
  projectId && projectSecret ? "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64") : undefined

// Create IPFS client
let ipfs: IPFSHTTPClient | undefined

try {
  ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  })
} catch (error) {
  console.error("IPFS client error:", error)
  ipfs = undefined
}

export async function uploadToIPFS(file: Buffer): Promise<string> {
  if (!ipfs) {
    throw new Error("IPFS client not initialized")
  }

  try {
    const result = await ipfs.add(file)
    return result.path
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    throw new Error("Failed to upload to IPFS")
  }
}

export async function uploadJSONToIPFS(json: object): Promise<string> {
  if (!ipfs) {
    throw new Error("IPFS client not initialized")
  }

  try {
    const data = JSON.stringify(json)
    const result = await ipfs.add(data)
    return result.path
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error)
    throw new Error("Failed to upload JSON to IPFS")
  }
}

export function ipfsToHttpUrl(ipfsUrl: string): string {
  // Convert ipfs:// URL to HTTP URL using a gateway
  if (!ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl
  }

  const cid = ipfsUrl.replace("ipfs://", "")
  return `https://ipfs.io/ipfs/${cid}`
}

export function cidToIpfsUrl(cid: string): string {
  return `ipfs://${cid}`
}

