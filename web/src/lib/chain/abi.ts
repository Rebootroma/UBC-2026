// Generated from contracts/out by scripts/export-abi. Do not edit.
export const parametricReserveAbi = [
 {
  "type": "constructor",
  "inputs": [
   {
    "name": "token_",
    "type": "address",
    "internalType": "contract IERC20"
   },
   {
    "name": "admin",
    "type": "address",
    "internalType": "address"
   }
  ],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "DEFAULT_ADMIN_ROLE",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "MAX_FUTURE_SKEW",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint64",
    "internalType": "uint64"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "MAX_PLAUSIBLE_DECIKNOTS",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint32",
    "internalType": "uint32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "MAX_STATIONS_PER_POLICY",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "OBSERVATION_TYPEHASH",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "ORACLE_ROLE",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "PAUSER_ROLE",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "POLICY_ADMIN_ROLE",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "TREASURER_ROLE",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "activeExposure",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "approvedStation",
  "inputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "cancelPolicy",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "checkEligibility",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "digest",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "uint8",
    "internalType": "enum ParametricReserve.Eligibility"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "eip712Domain",
  "inputs": [],
  "outputs": [
   {
    "name": "fields",
    "type": "bytes1",
    "internalType": "bytes1"
   },
   {
    "name": "name",
    "type": "string",
    "internalType": "string"
   },
   {
    "name": "version",
    "type": "string",
    "internalType": "string"
   },
   {
    "name": "chainId",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "verifyingContract",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "salt",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "extensions",
    "type": "uint256[]",
    "internalType": "uint256[]"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "freeReserve",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "fundReserve",
  "inputs": [
   {
    "name": "amount",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "getObservation",
  "inputs": [
   {
    "name": "digest",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "tuple",
    "internalType": "struct ParametricReserve.ObservationRecord",
    "components": [
     {
      "name": "obs",
      "type": "tuple",
      "internalType": "struct ParametricReserve.Observation",
      "components": [
       {
        "name": "eventId",
        "type": "bytes32",
        "internalType": "bytes32"
       },
       {
        "name": "stationId",
        "type": "bytes32",
        "internalType": "bytes32"
       },
       {
        "name": "observedAt",
        "type": "uint64",
        "internalType": "uint64"
       },
       {
        "name": "sustainedDeciKnots",
        "type": "uint32",
        "internalType": "uint32"
       },
       {
        "name": "gustDeciKnots",
        "type": "uint32",
        "internalType": "uint32"
       },
       {
        "name": "sourceHash",
        "type": "bytes32",
        "internalType": "bytes32"
       }
      ]
     },
     {
      "name": "signer",
      "type": "address",
      "internalType": "address"
     },
     {
      "name": "acceptedAt",
      "type": "uint64",
      "internalType": "uint64"
     }
    ]
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "getPolicy",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "tuple",
    "internalType": "struct ParametricReserve.Policy",
    "components": [
     {
      "name": "holder",
      "type": "address",
      "internalType": "address"
     },
     {
      "name": "payoutAmount",
      "type": "uint128",
      "internalType": "uint128"
     },
     {
      "name": "thresholdDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "coverageStart",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "coverageEnd",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "businessRef",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "status",
      "type": "uint8",
      "internalType": "enum ParametricReserve.PolicyStatus"
     },
     {
      "name": "paidAmount",
      "type": "uint128",
      "internalType": "uint128"
     },
     {
      "name": "owedAmount",
      "type": "uint128",
      "internalType": "uint128"
     }
    ]
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "getRoleAdmin",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "grantRole",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "account",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "hasRole",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "account",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "hashObservation",
  "inputs": [
   {
    "name": "obs",
    "type": "tuple",
    "internalType": "struct ParametricReserve.Observation",
    "components": [
     {
      "name": "eventId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "stationId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "observedAt",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "sustainedDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "gustDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "sourceHash",
      "type": "bytes32",
      "internalType": "bytes32"
     }
    ]
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "observationCount",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "pause",
  "inputs": [],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "paused",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "payDeferred",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "policyCount",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "policyIds",
  "inputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "registerPolicies",
  "inputs": [
   {
    "name": "inputs",
    "type": "tuple[]",
    "internalType": "struct ParametricReserve.PolicyInput[]",
    "components": [
     {
      "name": "policyId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "holder",
      "type": "address",
      "internalType": "address"
     },
     {
      "name": "businessRef",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "payoutAmount",
      "type": "uint128",
      "internalType": "uint128"
     },
     {
      "name": "thresholdDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "coverageStart",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "coverageEnd",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "stations",
      "type": "bytes32[]",
      "internalType": "bytes32[]"
     }
    ]
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "registerPolicy",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "holder",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "businessRef",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "payoutAmount",
    "type": "uint128",
    "internalType": "uint128"
   },
   {
    "name": "thresholdDeciKnots",
    "type": "uint32",
    "internalType": "uint32"
   },
   {
    "name": "coverageStart",
    "type": "uint64",
    "internalType": "uint64"
   },
   {
    "name": "coverageEnd",
    "type": "uint64",
    "internalType": "uint64"
   },
   {
    "name": "stations",
    "type": "bytes32[]",
    "internalType": "bytes32[]"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "renounceRole",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "callerConfirmation",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "reserveBalance",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "revokeRole",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "account",
    "type": "address",
    "internalType": "address"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "settle",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "digest",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "settledForEvent",
  "inputs": [
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "submitAndSettle",
  "inputs": [
   {
    "name": "obs",
    "type": "tuple",
    "internalType": "struct ParametricReserve.Observation",
    "components": [
     {
      "name": "eventId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "stationId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "observedAt",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "sustainedDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "gustDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "sourceHash",
      "type": "bytes32",
      "internalType": "bytes32"
     }
    ]
   },
   {
    "name": "signature",
    "type": "bytes",
    "internalType": "bytes"
   },
   {
    "name": "policies",
    "type": "bytes32[]",
    "internalType": "bytes32[]"
   }
  ],
  "outputs": [
   {
    "name": "digest",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "submitObservation",
  "inputs": [
   {
    "name": "obs",
    "type": "tuple",
    "internalType": "struct ParametricReserve.Observation",
    "components": [
     {
      "name": "eventId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "stationId",
      "type": "bytes32",
      "internalType": "bytes32"
     },
     {
      "name": "observedAt",
      "type": "uint64",
      "internalType": "uint64"
     },
     {
      "name": "sustainedDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "gustDeciKnots",
      "type": "uint32",
      "internalType": "uint32"
     },
     {
      "name": "sourceHash",
      "type": "bytes32",
      "internalType": "bytes32"
     }
    ]
   },
   {
    "name": "signature",
    "type": "bytes",
    "internalType": "bytes"
   }
  ],
  "outputs": [
   {
    "name": "digest",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "supportsInterface",
  "inputs": [
   {
    "name": "interfaceId",
    "type": "bytes4",
    "internalType": "bytes4"
   }
  ],
  "outputs": [
   {
    "name": "",
    "type": "bool",
    "internalType": "bool"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "token",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "address",
    "internalType": "contract IERC20"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "tokenDecimals",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint8",
    "internalType": "uint8"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "totalOwed",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "totalPaid",
  "inputs": [],
  "outputs": [
   {
    "name": "",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "stateMutability": "view"
 },
 {
  "type": "function",
  "name": "unpause",
  "inputs": [],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "function",
  "name": "withdrawFreeReserve",
  "inputs": [
   {
    "name": "to",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "amount",
    "type": "uint256",
    "internalType": "uint256"
   }
  ],
  "outputs": [],
  "stateMutability": "nonpayable"
 },
 {
  "type": "event",
  "name": "DeferredPayoutSettled",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "holder",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "amount",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "EIP712DomainChanged",
  "inputs": [],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "ObservationAccepted",
  "inputs": [
   {
    "name": "digest",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "eventId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "stationId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "observedAt",
    "type": "uint64",
    "indexed": false,
    "internalType": "uint64"
   },
   {
    "name": "sustainedDeciKnots",
    "type": "uint32",
    "indexed": false,
    "internalType": "uint32"
   },
   {
    "name": "gustDeciKnots",
    "type": "uint32",
    "indexed": false,
    "internalType": "uint32"
   },
   {
    "name": "signer",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "Paused",
  "inputs": [
   {
    "name": "account",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PayoutDeferred",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "eventId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "amount",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "shortfall",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PayoutExecuted",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "holder",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "eventId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "amount",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "observationDigest",
    "type": "bytes32",
    "indexed": false,
    "internalType": "bytes32"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PolicyCancelled",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "PolicyRegistered",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "holder",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "businessRef",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "payoutAmount",
    "type": "uint128",
    "indexed": false,
    "internalType": "uint128"
   },
   {
    "name": "thresholdDeciKnots",
    "type": "uint32",
    "indexed": false,
    "internalType": "uint32"
   },
   {
    "name": "coverageStart",
    "type": "uint64",
    "indexed": false,
    "internalType": "uint64"
   },
   {
    "name": "coverageEnd",
    "type": "uint64",
    "indexed": false,
    "internalType": "uint64"
   },
   {
    "name": "stations",
    "type": "bytes32[]",
    "indexed": false,
    "internalType": "bytes32[]"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "ReserveFunded",
  "inputs": [
   {
    "name": "from",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "amount",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   },
   {
    "name": "newBalance",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "ReserveWithdrawn",
  "inputs": [
   {
    "name": "to",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "amount",
    "type": "uint256",
    "indexed": false,
    "internalType": "uint256"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "RoleAdminChanged",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "previousAdminRole",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "newAdminRole",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "RoleGranted",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "account",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "sender",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "RoleRevoked",
  "inputs": [
   {
    "name": "role",
    "type": "bytes32",
    "indexed": true,
    "internalType": "bytes32"
   },
   {
    "name": "account",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   },
   {
    "name": "sender",
    "type": "address",
    "indexed": true,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "event",
  "name": "Unpaused",
  "inputs": [
   {
    "name": "account",
    "type": "address",
    "indexed": false,
    "internalType": "address"
   }
  ],
  "anonymous": false
 },
 {
  "type": "error",
  "name": "AccessControlBadConfirmation",
  "inputs": []
 },
 {
  "type": "error",
  "name": "AccessControlUnauthorizedAccount",
  "inputs": [
   {
    "name": "account",
    "type": "address",
    "internalType": "address"
   },
   {
    "name": "neededRole",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ]
 },
 {
  "type": "error",
  "name": "ECDSAInvalidSignature",
  "inputs": []
 },
 {
  "type": "error",
  "name": "ECDSAInvalidSignatureLength",
  "inputs": [
   {
    "name": "length",
    "type": "uint256",
    "internalType": "uint256"
   }
  ]
 },
 {
  "type": "error",
  "name": "ECDSAInvalidSignatureS",
  "inputs": [
   {
    "name": "s",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ]
 },
 {
  "type": "error",
  "name": "EnforcedPause",
  "inputs": []
 },
 {
  "type": "error",
  "name": "ExpectedPause",
  "inputs": []
 },
 {
  "type": "error",
  "name": "ImplausibleObservation",
  "inputs": []
 },
 {
  "type": "error",
  "name": "InsufficientFreeReserve",
  "inputs": [
   {
    "name": "requested",
    "type": "uint256",
    "internalType": "uint256"
   },
   {
    "name": "available",
    "type": "uint256",
    "internalType": "uint256"
   }
  ]
 },
 {
  "type": "error",
  "name": "InvalidPolicyParameters",
  "inputs": []
 },
 {
  "type": "error",
  "name": "InvalidShortString",
  "inputs": []
 },
 {
  "type": "error",
  "name": "NotEligible",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   },
   {
    "name": "reason",
    "type": "uint8",
    "internalType": "enum ParametricReserve.Eligibility"
   }
  ]
 },
 {
  "type": "error",
  "name": "NothingOwed",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ]
 },
 {
  "type": "error",
  "name": "ObservationAlreadySubmitted",
  "inputs": [
   {
    "name": "digest",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ]
 },
 {
  "type": "error",
  "name": "ObservationInFuture",
  "inputs": [
   {
    "name": "observedAt",
    "type": "uint64",
    "internalType": "uint64"
   }
  ]
 },
 {
  "type": "error",
  "name": "PolicyExists",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ]
 },
 {
  "type": "error",
  "name": "PolicyNotActive",
  "inputs": [
   {
    "name": "policyId",
    "type": "bytes32",
    "internalType": "bytes32"
   }
  ]
 },
 {
  "type": "error",
  "name": "ReentrancyGuardReentrantCall",
  "inputs": []
 },
 {
  "type": "error",
  "name": "SafeERC20FailedOperation",
  "inputs": [
   {
    "name": "token",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "StringTooLong",
  "inputs": [
   {
    "name": "str",
    "type": "string",
    "internalType": "string"
   }
  ]
 },
 {
  "type": "error",
  "name": "UnauthorizedOracle",
  "inputs": [
   {
    "name": "signer",
    "type": "address",
    "internalType": "address"
   }
  ]
 },
 {
  "type": "error",
  "name": "ZeroAddress",
  "inputs": []
 }
] as const;

export const parametricReserveBytecode = "0x6101a0604052348015610010575f80fd5b5060405161378938038061378983398101604081905261002f916103b2565b604080518082018252601e81527f526573696c69656e63654f5320506172616d657472696352657365727665000060208083019190915282518084019093526001808452603160f81b91840191909152805460ff191681556002559061009682600361027c565b610120526100a581600461027c565b61014052815160208084019190912060e052815190820120610100524660a05261013160e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b60805250503060c0526001600160a01b038216158061015757506001600160a01b038116155b156101755760405163d92e233d60e01b815260040160405180910390fd5b6001600160a01b0382166101608190526040805163313ce56760e01b8152905163313ce567916004808201926020929091908290030181865afa1580156101be573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101e291906103ea565b60ff16610180526101f35f826102ae565b5061021e7face7350211ab645c1937904136ede4855ac3aa1eabb4970e1a51a335d2e19920826102ae565b506102497f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a826102ae565b506102747f3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d07826102ae565b5050506105bb565b5f6020835110156102975761029083610355565b90506102a8565b816102a284826104a9565b5060ff90505b92915050565b5f828152602081815260408083206001600160a01b038516845290915281205460ff1661034e575f838152602081815260408083206001600160a01b03861684529091529020805460ff191660011790556103063390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016102a8565b505f6102a8565b5f80829050601f81511115610388578260405163305a27a960e01b815260040161037f9190610563565b60405180910390fd5b805161039382610598565b179392505050565b6001600160a01b03811681146103af575f80fd5b50565b5f80604083850312156103c3575f80fd5b82516103ce8161039b565b60208401519092506103df8161039b565b809150509250929050565b5f602082840312156103fa575f80fd5b815160ff8116811461040a575f80fd5b9392505050565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061043957607f821691505b60208210810361045757634e487b7160e01b5f52602260045260245ffd5b50919050565b601f8211156104a457805f5260205f20601f840160051c810160208510156104825750805b601f840160051c820191505b818110156104a1575f815560010161048e565b50505b505050565b81516001600160401b038111156104c2576104c2610411565b6104d6816104d08454610425565b8461045d565b6020601f821160018114610508575f83156104f15750848201515b5f19600385901b1c1916600184901b1784556104a1565b5f84815260208120601f198516915b828110156105375787850151825560209485019460019092019101610517565b508482101561055457868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80516020808301519190811015610457575f1960209190910360031b1b16919050565b60805160a05160c05160e05161010051610120516101405161016051610180516131316106585f395f61036201525f818161072e015281816109b401528181610ba801528181610c1301528181610cbf01528181610e4b015281816115e6015281816118fe0152611a4701525f6121a201525f61217501525f61258d01525f61256501525f6124c001525f6124ea01525f61251401526131315ff3fe608060405234801561000f575f80fd5b506004361061026b575f3560e01c806391d148541161014b578063d32a9cd9116100bf578063e63ab1e911610084578063e63ab1e9146106b6578063e7b0f666146106dd578063e7fa9f7d146106e6578063f0a3a97c146106ef578063fb46900b14610716578063fc0c546a14610729575f80fd5b8063d32a9cd914610662578063d547741f14610675578063d9a31df214610688578063de54d4291461069b578063e6078567146106a3575f80fd5b8063a217fddf11610110578063a217fddf1461050d578063a3f685f914610514578063a86146d014610534578063ac1060a414610547578063b41498621461054f578063b67c28bd14610562575f80fd5b806391d14854146104ad578063950d304a146104c0578063963ce181146104de578063a10954fe146104f1578063a17620c1146104f9575f80fd5b8063549116e7116101e2578063632fefa7116101a7578063632fefa71461043957806375c54224146104665780637ff8bf2514610479578063807ba2e0146104825780638456cb591461048a57806384b0196e14610492575f80fd5b8063549116e7146103b1578063588b1c68146103de5780635a981d96146103fe5780635c975abb14610425578063614f547114610430575f80fd5b80632f2ff15d116102335780632f2ff15d146103245780632f500f6c1461033757806336568abe1461034a5780633b97e8561461035d5780633f4ba83a146103965780634bc707811461039e575f80fd5b806301ffc9a71461026f57806307e2cea51461029757806315db04fc146102cc578063248a9ca3146102ed5780632901204e1461030f575b5f80fd5b61028261027d366004612709565b610768565b60405190151581526020015b60405180910390f35b6102be7f68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef181565b60405190815260200161028e565b6102d561012c81565b6040516001600160401b03909116815260200161028e565b6102be6102fb366004612737565b5f9081526020819052604090206001015490565b61032261031d3660046127ef565b61079e565b005b610322610332366004612894565b61085d565b6102be610345366004612737565b610887565b610322610358366004612894565b6108a6565b6103847f000000000000000000000000000000000000000000000000000000000000000081565b60405160ff909116815260200161028e565b6103226108de565b6103226103ac3660046128be565b610913565b6102826103bf3660046128e6565b600660209081525f928352604080842090915290825290205460ff1681565b6103f16103ec3660046128e6565b610a29565b60405161028e919061292e565b6102be7f50fac508a600eb82c0abeeb2f43a70dbf061d06475eeb4b9214555e6f13da91081565b60015460ff16610282565b6102be600d5481565b6102826104473660046128e6565b600860209081525f928352604080842090915290825290205460ff1681565b610322610474366004612737565b610b73565b6102be600a5481565b6102be610c9e565b610322610d4c565b61049a610d7e565b60405161028e979695949392919061296a565b6102826104bb366004612894565b610dc0565b6104c96107d081565b60405163ffffffff909116815260200161028e565b6102be6104ec366004612a53565b610de8565b6102be610e34565b6102be5f805160206130dc83398151915281565b6102be5f81565b610527610522366004612737565b610ec1565b60405161028e9190612ae3565b610322610542366004612737565b610fe9565b6102be601081565b6102be61055d366004612bb2565b6110af565b610655610570366004612737565b60408051610120810182525f606082018181526080830182905260a0830182905260c0830182905260e08301829052610100830182905282526020820181905291810191909152505f908152600760209081526040918290208251610120810184528154606082019081526001830154608083015260028301546001600160401b0380821660a085015263ffffffff600160401b8304811660c0860152600160601b90920490911660e084015260038401546101008401529082526004909201546001600160a01b03811693820193909352600160a01b909204169181019190915290565b60405161028e9190612c01565b6103226106703660046128e6565b611479565b610322610683366004612894565b611720565b6102be610696366004612c8b565b611744565b6009546102be565b6103226106b1366004612ca5565b611807565b6102be7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b6102be600c5481565b6102be600b5481565b6102be7f3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d0781565b610322610724366004612737565b611865565b6107507f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200161028e565b5f6001600160e01b03198216637965db0b60e01b148061079857506301ffc9a760e01b6001600160e01b03198316145b92915050565b5f805160206130dc8339815191526107b581611ac0565b6108516040518061010001604052808c81526020018b6001600160a01b031681526020018a8152602001896001600160801b031681526020018863ffffffff168152602001876001600160401b03168152602001866001600160401b031681526020018585808060200260200160405190810160405280939291908181526020018383602002808284375f920191909152505050915250611aca565b50505050505050505050565b5f8281526020819052604090206001015461087781611ac0565b6108818383611f29565b50505050565b60098181548110610896575f80fd5b5f91825260209091200154905081565b6001600160a01b03811633146108cf5760405163334bd91960e11b815260040160405180910390fd5b6108d98282611fb8565b505050565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a61090881611ac0565b610910612021565b50565b7f3496e2e73c4d42b75d702e60d9e48102720b8691234415963a5a857b86425d0761093d81611ac0565b610945612073565b6001600160a01b03831661096c5760405163d92e233d60e01b815260040160405180910390fd5b5f610975610c9e565b9050808311156109a7576040516357532ab360e01b815260048101849052602481018290526044015b60405180910390fd5b6109db6001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016858561209b565b836001600160a01b03167fcf3e2ed8c545de2d902ea60194df2faa514dad26e69937899d836f775b6973a884604051610a1691815260200190565b60405180910390a2506108d96001600255565b5f8281526005602090815260408083208484526007909252822060048101546001600160a01b0316610a6057600292505050610798565b5f8581526008602090815260408083208454845290915290205460ff1615610a8d57600692505050610798565b600160048084015460ff1690811115610aa857610aa8612906565b14610ab857600192505050610798565b5f8581526006602090815260408083206001850154845290915290205460ff16610ae757600392505050610798565b600182015460028201546001600160401b03600160a01b909204821691161080610b255750600280830154908201546001600160401b039182169116115b15610b3557600492505050610798565b60018201546002820154600160801b90910463ffffffff908116600160401b909204161015610b6957600592505050610798565b505f949350505050565b610b7b612073565b805f03610b9b5760405163102ae31560e31b815260040160405180910390fd5b610bd06001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000163330846120fa565b6040516370a0823160e01b815230600482015233907f78d425cd780dedc6eeb91f9c08388fdfd7ebcd0008ffb9da76e7e996d2865d5c9083906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa158015610c58573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610c7c9190612ce3565b6040805192835260208301919091520160405180910390a26109106001600255565b6040516370a0823160e01b81523060048201525f9081906001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906370a0823190602401602060405180830381865afa158015610d04573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610d289190612ce3565b9050600b548111610d39575f610d46565b600b54610d469082612d0e565b91505090565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a610d7681611ac0565b610910612133565b5f6060805f805f6060610d8f61216e565b610d9761219b565b604080515f80825260208201909252600f60f81b9b939a50919850469750309650945092509050565b5f918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b5f610df48686866110af565b90505f5b82811015610e2a57610e22848483818110610e1557610e15612d35565b9050602002013583611479565b600101610df8565b5095945050505050565b6040516370a0823160e01b81523060048201525f907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610e98573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610ebc9190612ce3565b905090565b60408051610120810182525f80825260208201819052918101829052606081018290526080810182905260a0810182905260c0810182905260e081018290526101008101919091525f8281526005602090815260409182902082516101208101845281546001600160a01b0316815260018201546001600160801b03811693820193909352600160801b830463ffffffff1693810193909352600160a01b9091046001600160401b0390811660608401526002820154166080830152600381015460a083015260048082015460c084019160ff90911690811115610fa757610fa7612906565b6004811115610fb857610fb8612906565b815260048201546001600160801b036101009091048116602083015260059092015490911660409091015292915050565b5f805160206130dc83398151915261100081611ac0565b5f828152600560205260409020600160048083015460ff169081111561102857611028612906565b1461104957604051632033f8f160e01b81526004810184905260240161099e565b6004818101805460ff191690911790556001810154600a80546001600160801b03909216915f9061107b908490612d0e565b909155505060405183907f4b34c7b95ccbf49cfaa2249e368311e024338399c35d9a17f2a679a22d70cf57905f90a2505050565b5f6110b86121c8565b6110c184611744565b5f818152600760205260409020600401549091506001600160a01b0316156110ff57604051631161905560e31b81526004810182905260240161099e565b5f61113f8285858080601f0160208091040260200160405190810160405280939291908181526020018383808284375f920191909152506121ee92505050565b905061116b7f68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef182610dc0565b611193576040516391e4784360e01b81526001600160a01b038216600482015260240161099e565b61119f61012c42612d49565b6111af6060870160408801612d5c565b6001600160401b031611156111f3576111ce6060860160408701612d5c565b60405163bc3212f960e01b81526001600160401b03909116600482015260240161099e565b6107d06112066080870160608801612d75565b63ffffffff16118061122e57506107d061122660a0870160808801612d75565b63ffffffff16115b80611281575061124460a0860160808701612d75565b63ffffffff161580159061128157506112636080860160608701612d75565b63ffffffff1661127960a0870160808801612d75565b63ffffffff16105b8061128b57508435155b8061129857506020850135155b806112b957506112ae6060860160408701612d5c565b6001600160401b0316155b156112d757604051630183f78b60e51b815260040160405180910390fd5b6040518060600160405280868036038101906112f39190612de7565b81526001600160a01b03838116602080840191909152426001600160401b039081166040948501525f8781526007835284812086518051825580850151600183015580870151600283018054606084015160808501519388166bffffffffffffffffffffffff1990921691909117600160401b63ffffffff928316021763ffffffff60601b1916600160601b919093160291909117905560a00151600382015592860151600490930180549690950151929093166001600160e01b031990951694909417600160a01b9190941602929092179055600d8054916113d583612e73565b909155505060208501358535837f5ed3d20f27be4a4c564b394ce00f9774fb1ccb2ffaec6f08af4bbf27a333db5761141360608a0160408b01612d5c565b61142360808b0160608c01612d75565b61143360a08c0160808d01612d75565b604080516001600160401b03909416845263ffffffff92831660208501529116908201526001600160a01b038616606082015260800160405180910390a4509392505050565b6114816121c8565b611489612073565b5f6114948383610a29565b90505f8160068111156114a9576114a9612906565b146114cb57828160405163d29f84a760e01b815260040161099e929190612e8b565b5f8381526005602090815260408083208584526007909252822054600482015460018301549293919261150f916001600160801b0361010090910481169116612e9f565b5f8781526008602090815260408083208684529091528120805460ff19166001179055600a80546001600160801b039390931693508392909190611554908490612d0e565b909155505f9050611563610c9e565b905081811061165d5760048401805460ff191660021780825583919060019061159c9084906001600160801b0361010090910416612ebe565b92506101000a8154816001600160801b0302191690836001600160801b0316021790555081600c5f8282546115d19190612d49565b9091555050835461160f906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168461209b565b8354604080518481526020810189905285926001600160a01b0316918a917fcec0ab1694b9da32436c03af1726e949c8c2d5dbde4d69dfcffecf9e3954ca61910160405180910390a461170d565b60048401805460ff191660031790556005840180548391905f9061168b9084906001600160801b0316612ebe565b92506101000a8154816001600160801b0302191690836001600160801b0316021790555081600b5f8282546116c09190612d49565b90915550839050877f6f7272cf07422cbde8e771c8b822bad996ba561c0dd68697c52056c16514f43c846116f48582612d0e565b6040805192835260208301919091520160405180910390a35b505050505061171c6001600255565b5050565b5f8281526020819052604090206001015461173a81611ac0565b6108818383611fb8565b5f6107987f50fac508a600eb82c0abeeb2f43a70dbf061d06475eeb4b9214555e6f13da910833560208501356117806060870160408801612d5c565b6117906080880160608901612d75565b6117a060a0890160808a01612d75565b60408051602081019790975286019490945260608501929092526001600160401b0316608084015263ffffffff90811660a084810191909152911660c083015284013560e08201526101000160405160208183030381529060405280519060200120612216565b5f805160206130dc83398151915261181e81611ac0565b5f5b828110156108815761185d84848381811061183d5761183d612d35565b905060200281019061184f9190612edd565b61185890612f7a565b611aca565b600101611820565b61186d6121c8565b611875612073565b5f818152600560205260409020600360048083015460ff169081111561189d5761189d612906565b1415806118b5575060058101546001600160801b0316155b156118d657604051637e99c1a560e11b81526004810183905260240161099e565b60058101546040516370a0823160e01b81523060048201526001600160801b03909116905f907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa15801561194b573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061196f9190612ce3565b90508181101561199c576040516357532ab360e01b8152600481018390526024810182905260440161099e565b6005830180546001600160801b03191690556004830180548391906001906119d390849061010090046001600160801b0316612ebe565b82546101009290920a6001600160801b038181021990931691909216919091021790555060048301805460ff19166002179055600b80548391905f90611a1a908490612d0e565b9250508190555081600c5f828254611a329190612d49565b90915550508254611a70906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168461209b565b82546040518381526001600160a01b039091169085907fa89fdd90987ac53d4541563cd28a46f9724fb71f94bd832d585c75687c8e6c729060200160405180910390a35050506109106001600255565b6109108133612242565b60208101516001600160a01b0316611af55760405163d92e233d60e01b815260040160405180910390fd5b80511580611b0e575060608101516001600160801b0316155b80611b215750608081015163ffffffff16155b80611b3d57506107d063ffffffff16816080015163ffffffff16115b80611b6257508060c001516001600160401b03168160a001516001600160401b031610155b80611b70575060e081015151155b80611b80575060108160e0015151115b15611b9e5760405163102ae31560e31b815260040160405180910390fd5b80515f90815260056020526040812060049081015460ff1690811115611bc657611bc6612906565b14611bea5780516040516306d0f08f60e41b8152600481019190915260240161099e565b60405180610120016040528082602001516001600160a01b0316815260200182606001516001600160801b03168152602001826080015163ffffffff1681526020018260a001516001600160401b031681526020018260c001516001600160401b031681526020018260400151815260200160016004811115611c6f57611c6f612906565b81525f60208083018290526040928301829052845182526005815290829020835181546001600160a01b03199081166001600160a01b0390921691909117825591840151600180830180549587015160608801516001600160801b039094169690951695909517600160801b63ffffffff909516949094029390931767ffffffffffffffff60a01b1916600160a01b6001600160401b039283160217909355608084015160028201805467ffffffffffffffff1916919094161790925560a0830151600383015560c0830151600480840180549293909260ff1916918490811115611d5c57611d5c612906565b021790555060e082015160048201805470ffffffffffffffffffffffffffffffff0019166101006001600160801b0393841681029190911790915590920151600590910180546001600160801b031916919092161790555f5b8160e0015151811015611e5c575f801b8260e001518281518110611ddb57611ddb612d35565b602002602001015103611e015760405163102ae31560e31b815260040160405180910390fd5b81515f90815260066020526040812060e08401518051600193919085908110611e2c57611e2c612d35565b60209081029190910181015182528101919091526040015f20805460ff1916911515919091179055600101611db5565b508051600980546001810182555f9182527f6e1540171b6c0c960b71a7020d9f60077f6af931a8bbf590da0223dacf75c7af01919091556060820151600a80546001600160801b03909216929091611eb5908490612d49565b92505081905550806040015181602001516001600160a01b0316825f01517fcb21c2b29694c9f6ea47caa9f590659dbc2de924315535a8764dd59425795c6c846060015185608001518660a001518760c001518860e00151604051611f1e959493929190613026565b60405180910390a450565b5f611f348383610dc0565b611fb1575f838152602081815260408083206001600160a01b03861684529091529020805460ff19166001179055611f693390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a4506001610798565b505f610798565b5f611fc38383610dc0565b15611fb1575f838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a4506001610798565b61202961227b565b6001805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b6040516001600160a01b03909116815260200160405180910390a1565b600280540361209557604051633ee5aeb560e01b815260040160405180910390fd5b60028055565b6040516001600160a01b038381166024830152604482018390526108d991859182169063a9059cbb906064015b604051602081830303815290604052915060e01b6020820180516001600160e01b03838183161783525050505061229e565b6040516001600160a01b0384811660248301528381166044830152606482018390526108819186918216906323b872dd906084016120c8565b61213b6121c8565b6001805460ff1916811790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833612056565b6060610ebc7f0000000000000000000000000000000000000000000000000000000000000000600361230a565b6060610ebc7f0000000000000000000000000000000000000000000000000000000000000000600461230a565b60015460ff16156121ec5760405163d93c066560e01b815260040160405180910390fd5b565b5f805f806121fc86866123b3565b92509250925061220c82826123fc565b5090949350505050565b5f6107986122226124b4565b8360405161190160f01b8152600281019290925260228201526042902090565b61224c8282610dc0565b61171c5760405163e2517d3f60e01b81526001600160a01b03821660048201526024810183905260440161099e565b60015460ff166121ec57604051638dfc202b60e01b815260040160405180910390fd5b5f8060205f8451602086015f885af1806122bd576040513d5f823e3d81fd5b50505f513d915081156122d45780600114156122e1565b6001600160a01b0384163b155b1561088157604051635274afe760e01b81526001600160a01b038516600482015260240161099e565b606060ff83146123245761231d836125dd565b9050610798565b818054612330906130a9565b80601f016020809104026020016040519081016040528092919081815260200182805461235c906130a9565b80156123a75780601f1061237e576101008083540402835291602001916123a7565b820191905f5260205f20905b81548152906001019060200180831161238a57829003601f168201915b50505050509050610798565b5f805f83516041036123ea576020840151604085015160608601515f1a6123dc8882858561261a565b9550955095505050506123f5565b505081515f91506002905b9250925092565b5f82600381111561240f5761240f612906565b03612418575050565b600182600381111561242c5761242c612906565b0361244a5760405163f645eedf60e01b815260040160405180910390fd5b600282600381111561245e5761245e612906565b0361247f5760405163fce698f760e01b81526004810182905260240161099e565b600382600381111561249357612493612906565b0361171c576040516335e2f38360e21b81526004810182905260240161099e565b5f306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614801561250c57507f000000000000000000000000000000000000000000000000000000000000000046145b1561253657507f000000000000000000000000000000000000000000000000000000000000000090565b610ebc604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b60605f6125e9836126e2565b6040805160208082528183019092529192505f91906020820181803683375050509182525060208101929092525090565b5f80807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a084111561265357505f915060039050826126d8565b604080515f808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa1580156126a4573d5f803e3d5ffd5b5050604051601f1901519150506001600160a01b0381166126cf57505f9250600191508290506126d8565b92505f91508190505b9450945094915050565b5f60ff8216601f81111561079857604051632cd44ac360e21b815260040160405180910390fd5b5f60208284031215612719575f80fd5b81356001600160e01b031981168114612730575f80fd5b9392505050565b5f60208284031215612747575f80fd5b5035919050565b80356001600160a01b0381168114612764575f80fd5b919050565b80356001600160801b0381168114612764575f80fd5b803563ffffffff81168114612764575f80fd5b80356001600160401b0381168114612764575f80fd5b5f8083601f8401126127b8575f80fd5b5081356001600160401b038111156127ce575f80fd5b6020830191508360208260051b85010111156127e8575f80fd5b9250929050565b5f805f805f805f805f6101008a8c031215612808575f80fd5b8935985061281860208b0161274e565b975060408a0135965061282d60608b01612769565b955061283b60808b0161277f565b945061284960a08b01612792565b935061285760c08b01612792565b925060e08a01356001600160401b03811115612871575f80fd5b61287d8c828d016127a8565b915080935050809150509295985092959850929598565b5f80604083850312156128a5575f80fd5b823591506128b56020840161274e565b90509250929050565b5f80604083850312156128cf575f80fd5b6128d88361274e565b946020939093013593505050565b5f80604083850312156128f7575f80fd5b50508035926020909101359150565b634e487b7160e01b5f52602160045260245ffd5b6007811061292a5761292a612906565b9052565b60208101610798828461291a565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b60ff60f81b8816815260e060208201525f61298860e083018961293c565b828103604084015261299a818961293c565b606084018890526001600160a01b038716608085015260a0840186905283810360c0850152845180825260208087019350909101905f5b818110156129ef5783518352602093840193909201916001016129d1565b50909b9a5050505050505050505050565b5f60c08284031215612a10575f80fd5b50919050565b5f8083601f840112612a26575f80fd5b5081356001600160401b03811115612a3c575f80fd5b6020830191508360208285010111156127e8575f80fd5b5f805f805f6101008688031215612a68575f80fd5b612a728787612a00565b945060c08601356001600160401b03811115612a8c575f80fd5b612a9888828901612a16565b90955093505060e08601356001600160401b03811115612ab6575f80fd5b612ac2888289016127a8565b969995985093965092949392505050565b6005811061292a5761292a612906565b81516001600160a01b031681526020808301516001600160801b031690820152604080830151610120830191612b209084018263ffffffff169052565b506060830151612b3b60608401826001600160401b03169052565b506080830151612b5660808401826001600160401b03169052565b5060a083015160a083015260c0830151612b7360c0840182612ad3565b5060e0830151612b8e60e08401826001600160801b03169052565b50610100830151612bab6101008401826001600160801b03169052565b5092915050565b5f805f60e08486031215612bc4575f80fd5b612bce8585612a00565b925060c08401356001600160401b03811115612be8575f80fd5b612bf486828701612a16565b9497909650939450505050565b5f61010082019050825180518352602081015160208401526001600160401b03604082015116604084015263ffffffff606082015116606084015263ffffffff608082015116608084015260a081015160a0840152506020830151612c7160c08401826001600160a01b03169052565b5060408301516001600160401b03811660e0840152612bab565b5f60c08284031215612c9b575f80fd5b6127308383612a00565b5f8060208385031215612cb6575f80fd5b82356001600160401b03811115612ccb575f80fd5b612cd7858286016127a8565b90969095509350505050565b5f60208284031215612cf3575f80fd5b5051919050565b634e487b7160e01b5f52601160045260245ffd5b8181038181111561079857610798612cfa565b634e487b7160e01b5f52604160045260245ffd5b634e487b7160e01b5f52603260045260245ffd5b8082018082111561079857610798612cfa565b5f60208284031215612d6c575f80fd5b61273082612792565b5f60208284031215612d85575f80fd5b6127308261277f565b60405161010081016001600160401b0381118282101715612db157612db1612d21565b60405290565b604051601f8201601f191681016001600160401b0381118282101715612ddf57612ddf612d21565b604052919050565b5f60c0828403128015612df8575f80fd5b5060405160c081016001600160401b0381118282101715612e1b57612e1b612d21565b60409081528335825260208085013590830152612e39908401612792565b6040820152612e4a6060840161277f565b6060820152612e5b6080840161277f565b608082015260a0928301359281019290925250919050565b5f60018201612e8457612e84612cfa565b5060010190565b82815260408101612730602083018461291a565b6001600160801b03828116828216039081111561079857610798612cfa565b6001600160801b03818116838216019081111561079857610798612cfa565b5f823560fe19833603018112612ef1575f80fd5b9190910192915050565b5f82601f830112612f0a575f80fd5b81356001600160401b03811115612f2357612f23612d21565b8060051b612f3360208201612db7565b91825260208185018101929081019086841115612f4e575f80fd5b6020860192505b83831015612f70578235825260209283019290910190612f55565b9695505050505050565b5f6101008236031215612f8b575f80fd5b612f93612d8e565b82358152612fa36020840161274e565b602082015260408381013590820152612fbe60608401612769565b6060820152612fcf6080840161277f565b6080820152612fe060a08401612792565b60a0820152612ff160c08401612792565b60c082015260e08301356001600160401b0381111561300e575f80fd5b61301a36828601612efb565b60e08301525092915050565b5f60a082016001600160801b038816835263ffffffff871660208401526001600160401b03861660408401526001600160401b038516606084015260a0608084015280845180835260c0850191506020860192505f5b8181101561309a57835183526020938401939092019160010161307c565b50909998505050505050505050565b600181811c908216806130bd57607f821691505b602082108103612a1057634e487b7160e01b5f52602260045260245ffdfeace7350211ab645c1937904136ede4855ac3aa1eabb4970e1a51a335d2e19920a26469706673582212201a0001bf1b7363cfb9ee59f44716cb322f90d722e50ae4512d97197b3eacd62e64736f6c634300081a0033" as const;
