export const ESCROW_ADDRESS =
  process.env.NEXT_PUBLIC_ESCROW_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const abi = [
  {
    type: "function",
    name: "createJob",
    stateMutability: "payable",
    inputs: [
      {
        name: "worker",
        type: "address",
      },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "releasePayment",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
      },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "refundClient",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
      },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [
      {
        name: "jobId",
        type: "uint256",
      },
    ],
    outputs: [
      {
        components: [
          {
            name: "client",
            type: "address",
          },
          {
            name: "worker",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
          {
            name: "status",
            type: "uint8",
          },
          {
            name: "exists",
            type: "bool",
          },
        ],
        name: "",
        type: "tuple",
      },
    ],
  },
] as const;
