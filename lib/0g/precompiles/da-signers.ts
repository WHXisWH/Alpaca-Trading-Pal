import Web3 from "web3";
import { AbiItem } from "web3-utils";

const DA_SIGNERS_ADDRESS = "0x0000000000000000000000000000000000001000";

interface SignerDetail {
  signer: string;
  socket: string;
  pkG1: {
    x: string;
    y: string;
  };
  pkG2: {
    x: [string, string];
    y: [string, string];
  };
}

interface DAParams {
  tokensPerVote: bigint;
  maxVotesPerSigner: bigint;
  maxQuorums: bigint;
  epochBlocks: bigint;
  encodedSlices: bigint;
}

interface QuorumStatus {
  epoch: number;
  quorumId: number;
  members: string[];
  isHealthy: boolean;
  participationRate: number;
}

interface AIDecisionVerification {
  alpacaId: string;
  decisionHash: string;
  dataHash: string;
  verified: boolean;
  confidence: number;
  quorumParticipation: number;
}

const DA_SIGNERS_ABI: AbiItem[] = [
  {
    name: "params",
    type: "function",
    inputs: [],
    outputs: [
      { name: "tokensPerVote", type: "uint256" },
      { name: "maxVotesPerSigner", type: "uint256" },
      { name: "maxQuorums", type: "uint256" },
      { name: "epochBlocks", type: "uint256" },
      { name: "encodedSlices", type: "uint256" }
    ]
  },
  {
    name: "epochNumber",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "quorumCount",
    type: "function",
    inputs: [{ name: "_epoch", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "isSigner",
    type: "function",
    inputs: [{ name: "_account", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "getSigner",
    type: "function",
    inputs: [{ name: "_account", type: "address[]" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "signer", type: "address" },
          { name: "socket", type: "string" },
          { name: "pkG1", type: "tuple", components: [
            { name: "x", type: "uint256" },
            { name: "y", type: "uint256" }
          ]},
          { name: "pkG2", type: "tuple", components: [
            { name: "x", type: "uint256[2]" },
            { name: "y", type: "uint256[2]" }
          ]}
        ]
      }
    ]
  },
  {
    name: "getQuorum",
    type: "function",
    inputs: [
      { name: "_epoch", type: "uint256" },
      { name: "_quorumId", type: "uint256" }
    ],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    name: "registeredEpoch",
    type: "function",
    inputs: [
      { name: "_account", type: "address" },
      { name: "_epoch", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "getAggPkG1",
    type: "function",
    inputs: [
      { name: "_epoch", type: "uint256" },
      { name: "_quorumId", type: "uint256" },
      { name: "_quorumBitmap", type: "bytes" }
    ],
    outputs: [
      { name: "aggPkG1", type: "tuple", components: [
        { name: "x", type: "uint256" },
        { name: "y", type: "uint256" }
      ]},
      { name: "total", type: "uint256" },
      { name: "hit", type: "uint256" }
    ]
  }
];

export class DASignersClient {
  private web3: Web3 | null = null;
  private contract: any = null;
  private account: string | null = null;

  constructor() {
    console.log("🔐 Initializing DASigners Precompiled Contract Client");
  }

  async initialize(web3Instance?: Web3, address?: string): Promise<boolean> {
    try {
      if (web3Instance && address) {
        this.web3 = web3Instance;
        this.account = address;
      } else if (typeof window === 'undefined') {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
          throw new Error("Private key required for DASigners operations");
        }
        
        const provider = new Web3.providers.HttpProvider("https://evmrpc-testnet.0g.ai");
        this.web3 = new Web3(provider);
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.account = account.address;
        this.web3.eth.accounts.wallet.add(account);
      }

      if (!this.web3) {
        throw new Error("Web3 instance required for DASigners operations");
      }

      this.contract = new this.web3.eth.Contract(DA_SIGNERS_ABI, DA_SIGNERS_ADDRESS);
      
      console.log(`🔐 Connected to DASigners precompile: ${DA_SIGNERS_ADDRESS}`);
      return true;
    } catch (error) {
      console.error("Failed to initialize DASigners client:", error);
      return false;
    }
  }

  async getDAParameters(): Promise<DAParams> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const params = await this.contract.methods.params().call();
      
      return {
        tokensPerVote: BigInt(params.tokensPerVote),
        maxVotesPerSigner: BigInt(params.maxVotesPerSigner),
        maxQuorums: BigInt(params.maxQuorums),
        epochBlocks: BigInt(params.epochBlocks),
        encodedSlices: BigInt(params.encodedSlices)
      };
    } catch (error) {
      console.error("Failed to get DA parameters:", error);
      throw error;
    }
  }

  async getCurrentEpoch(): Promise<number> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const epoch = await this.contract.methods.epochNumber().call();
      return Number(epoch);
    } catch (error) {
      console.error("Failed to get current epoch:", error);
      return 0;
    }
  }

  async getQuorumStatus(epoch: number, quorumId: number): Promise<QuorumStatus> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const members = await this.contract.methods.getQuorum(epoch, quorumId).call();
      const totalQuorums = await this.contract.methods.quorumCount(epoch).call();
      
      const isHealthy = members.length >= 3;
      const participationRate = members.length / Math.max(Number(totalQuorums), 1);

      return {
        epoch,
        quorumId,
        members,
        isHealthy,
        participationRate
      };
    } catch (error) {
      console.error(`Failed to get quorum status for epoch ${epoch}, quorum ${quorumId}:`, error);
      throw error;
    }
  }

  async verifyAIDecision(
    alpacaId: string,
    decisionData: any,
    expectedDataHash: string
  ): Promise<AIDecisionVerification> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const currentEpoch = await this.getCurrentEpoch();
      const quorumCount = await this.contract.methods.quorumCount(currentEpoch).call();
      
      const decisionHash = this.web3!.utils.keccak256(JSON.stringify(decisionData));
      const dataHash = this.web3!.utils.keccak256(
        this.web3!.eth.abi.encodeParameters(
          ['string', 'bytes32', 'uint256'],
          [alpacaId, decisionHash, Date.now()]
        )
      );

      let totalParticipation = 0;
      let verifiedQuorums = 0;

      for (let i = 0; i < Math.min(Number(quorumCount), 5); i++) {
        try {
          const quorumStatus = await this.getQuorumStatus(currentEpoch, i);
          totalParticipation += quorumStatus.participationRate;
          
          if (quorumStatus.isHealthy) {
            verifiedQuorums++;
          }
        } catch (error) {
          console.warn(`Failed to verify quorum ${i}:`, error);
        }
      }

      const avgParticipation = totalParticipation / Math.min(Number(quorumCount), 5);
      const verified = verifiedQuorums >= Math.ceil(Number(quorumCount) * 0.67);
      const confidence = Math.min(avgParticipation * (verifiedQuorums / Number(quorumCount)), 1);

      console.log(`🔐 AI Decision Verification: ${verified ? 'VERIFIED' : 'FAILED'} (confidence: ${(confidence * 100).toFixed(1)}%)`);

      return {
        alpacaId,
        decisionHash,
        dataHash,
        verified,
        confidence,
        quorumParticipation: avgParticipation
      };
    } catch (error) {
      console.error("AI decision verification failed:", error);
      return {
        alpacaId,
        decisionHash: "0x0",
        dataHash: "0x0",
        verified: false,
        confidence: 0,
        quorumParticipation: 0
      };
    }
  }

  async checkSignerRegistration(address: string, epoch?: number): Promise<{
    isRegistered: boolean;
    currentEpoch: boolean;
    nextEpoch: boolean;
    signerDetails?: SignerDetail;
  }> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const currentEpoch = epoch || await this.getCurrentEpoch();
      const isSigner = await this.contract.methods.isSigner(address).call();
      const isRegisteredCurrent = await this.contract.methods.registeredEpoch(address, currentEpoch).call();
      const isRegisteredNext = await this.contract.methods.registeredEpoch(address, currentEpoch + 1).call();

      let signerDetails: SignerDetail | undefined;
      
      if (isSigner) {
        try {
          const details = await this.contract.methods.getSigner([address]).call();
          if (details && details.length > 0) {
            signerDetails = details[0];
          }
        } catch (error) {
          console.warn("Failed to get signer details:", error);
        }
      }

      return {
        isRegistered: isSigner,
        currentEpoch: isRegisteredCurrent,
        nextEpoch: isRegisteredNext,
        signerDetails
      };
    } catch (error) {
      console.error(`Failed to check signer registration for ${address}:`, error);
      return {
        isRegistered: false,
        currentEpoch: false,
        nextEpoch: false
      };
    }
  }

  async getAggregatedPublicKey(
    epoch: number,
    quorumId: number,
    participatingSigners: string[]
  ): Promise<{
    aggregatedKey: { x: string; y: string };
    totalSigners: number;
    participatingSigners: number;
  }> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const quorumBitmap = this.createQuorumBitmap(participatingSigners);
      
      const result = await this.contract.methods.getAggPkG1(
        epoch,
        quorumId,
        quorumBitmap
      ).call();

      return {
        aggregatedKey: {
          x: result.aggPkG1.x,
          y: result.aggPkG1.y
        },
        totalSigners: Number(result.total),
        participatingSigners: Number(result.hit)
      };
    } catch (error) {
      console.error("Failed to get aggregated public key:", error);
      throw error;
    }
  }

  private createQuorumBitmap(participatingSigners: string[]): string {
    const bitmap = new Array(32).fill(0);
    
    participatingSigners.forEach((signer, index) => {
      if (index < 256) {
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        bitmap[byteIndex] |= (1 << bitIndex);
      }
    });

    return '0x' + bitmap.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async monitorQuorumHealth(): Promise<{
    totalQuorums: number;
    healthyQuorums: number;
    avgParticipation: number;
    recommendations: string[];
  }> {
    if (!this.contract) {
      throw new Error("DASigners contract not initialized");
    }

    try {
      const currentEpoch = await this.getCurrentEpoch();
      const quorumCount = await this.contract.methods.quorumCount(currentEpoch).call();
      
      let healthyCount = 0;
      let totalParticipation = 0;
      const recommendations: string[] = [];

      for (let i = 0; i < Number(quorumCount); i++) {
        const status = await this.getQuorumStatus(currentEpoch, i);
        
        if (status.isHealthy) {
          healthyCount++;
        } else {
          recommendations.push(`Quorum ${i} needs more signers (${status.members.length} current)`);
        }
        
        totalParticipation += status.participationRate;
      }

      const avgParticipation = totalParticipation / Number(quorumCount);
      
      if (avgParticipation < 0.67) {
        recommendations.push("Overall participation rate is low - consider incentivizing more signers");
      }
      
      if (healthyCount < Number(quorumCount) * 0.8) {
        recommendations.push("Many quorums are unhealthy - system reliability at risk");
      }

      console.log(`🏥 Quorum Health: ${healthyCount}/${quorumCount} healthy, ${(avgParticipation * 100).toFixed(1)}% participation`);

      return {
        totalQuorums: Number(quorumCount),
        healthyQuorums: healthyCount,
        avgParticipation,
        recommendations
      };
    } catch (error) {
      console.error("Failed to monitor quorum health:", error);
      throw error;
    }
  }

  async validateTradingDecision(
    alpacaId: string,
    tradingStrategy: any,
    marketData: any
  ): Promise<{
    valid: boolean;
    confidence: number;
    dataAvailability: boolean;
    quorumConsensus: boolean;
    details: string;
  }> {
    try {
      const verification = await this.verifyAIDecision(
        alpacaId,
        { strategy: tradingStrategy, market: marketData },
        this.web3!.utils.keccak256(JSON.stringify(marketData))
      );

      const quorumHealth = await this.monitorQuorumHealth();
      const dataAvailable = verification.quorumParticipation > 0.5;
      const consensusReached = verification.verified && quorumHealth.avgParticipation > 0.67;

      const valid = dataAvailable && consensusReached && verification.confidence > 0.7;

      let details = "";
      if (!dataAvailable) details += "Data availability insufficient. ";
      if (!consensusReached) details += "Quorum consensus not reached. ";
      if (verification.confidence <= 0.7) details += "Low verification confidence. ";
      if (valid) details = "Trading decision validated by DA layer.";

      console.log(`✅ Trading Decision Validation for ${alpacaId}: ${valid ? 'VALID' : 'INVALID'}`);

      return {
        valid,
        confidence: verification.confidence,
        dataAvailability: dataAvailable,
        quorumConsensus: consensusReached,
        details: details.trim()
      };
    } catch (error) {
      console.error("Trading decision validation failed:", error);
      return {
        valid: false,
        confidence: 0,
        dataAvailability: false,
        quorumConsensus: false,
        details: `Validation error: ${error}`
      };
    }
  }
}

export const daSignersClient = new DASignersClient();