import bs58 from "bs58"
import nacl from "tweetnacl"

export class SigninMessage {
  domain: string
  publicKey: string
  nonce: string
  statement: string

  constructor(message: {
    domain: string
    publicKey: string
    nonce: string
    statement: string
  }) {
    this.domain = message.domain
    this.publicKey = message.publicKey
    this.nonce = message.nonce
    this.statement = message.statement
  }

  prepare() {
    return `${this.statement}\n\n${this.domain} wants you to sign in with your Solana account:\n${this.publicKey}\n\nNonce: ${this.nonce}`
  }

  async verify(publicKey: string, signature: string) {
    const message = this.prepare()
    const messageBytes = new TextEncoder().encode(message)
    const publicKeyBytes = bs58.decode(publicKey)
    const signatureBytes = bs58.decode(signature)

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
  }

  static async create(publicKey: string) {
    const domain = window.location.host
    const statement = "Sign in to the Decentralized Data Labeling Platform"
    const nonce = Math.floor(Math.random() * 1000000).toString()

    return new SigninMessage({
      domain,
      publicKey,
      nonce,
      statement,
    })
  }
}

