# DeFi-Script
This project has a script that enables users to convert AAVE tokens to LINK tokens using Uniswap and then supply the LINK tokens to an AAVE lending pool. The script leverages the Ethers.js library to interact with the Uniswap, and AAVE protocols.

## Overview

The script performs the following operations:

1. **Token Approval:** Approves the specified amount of AAVE tokens for swapping via the Uniswap router.
2. **Pool Information Retrieval:** Retrieves the pool information necessary for swapping AAVE to LINK.
3. **Token Swap:** Executes a swap from AAVE to LINK using the Uniswap protocol.
4. **Lending Pool Approval:** Approves the swapped LINK tokens for supplying to AAVE.
5. **Supply to Aave:** Supplies the LINK tokens to the AAVE lending pool.

## Diagram of the flow of the script
![graphviz](https://github.com/user-attachments/assets/266d5e65-2511-43c9-9cb5-940201f59ad0)

## Configuration

The following are the key variables in the script that you can configure:

- **FACTORY_ADDRESS:** The address of the Uniswap V3 factory contract.
- **ROUTER_ADDRESS:** The address of the Uniswap V3 router contract.
- **AAVE_LENDING_POOL_ADDRESS:** The address of the AAVE lending pool contract.
- **Token Details:** Details of the tokens involved in the swap and supply process.

## Usage

1. Ensure that your environment is set up as per the instructions above.
2. Execute the script:

   ```bash
   node index.js
   ```

   This will initiate the process of swapping AAVE tokens for LINK and then supplying the LINK tokens to the AAVE lending pool.

Certainly! Here's a more polished and visually appealing presentation of the functions section:

---

## Key Functions

Below is a summary of the key functions used in this script, each playing a crucial role in the process of swapping tokens and supplying them to AAVE.

### 1. **authorizeTokenUsage**

```javascript
authorizeTokenUsage(tokenAddress, tokenABI, amount, signer)
```

- **Purpose:** Approves a specified amount of a token to be spent by the Uniswap router.
- **Parameters:**
  - `tokenAddress`: The address of the token to approve.
  - `tokenABI`: The ABI of the token contract.
  - `amount`: The amount of tokens to approve.
  - `signer`: The wallet instance that signs the transaction.

### 2. **fetchPoolDetails**

```javascript
fetchPoolDetails(factoryContract, tokenIn, tokenOut)
```

- **Purpose:** Retrieves details of the liquidity pool for the specified token pair.
- **Parameters:**
  - `factoryContract`: The Uniswap factory contract instance.
  - `tokenIn`: The input token details (e.g., AAVE).
  - `tokenOut`: The output token details (e.g., LINK).

### 3. **createSwapParams**

```javascript
createSwapParams(poolContract, signer, inputAmount)
```

- **Purpose:** Prepares the necessary parameters for executing the token swap on Uniswap.
- **Parameters:**
  - `poolContract`: The contract instance of the liquidity pool.
  - `signer`: The wallet instance that signs the transaction.
  - `inputAmount`: The amount of tokens to swap.

### 4. **retrieveTokenBalance**

```javascript
retrieveTokenBalance(tokenAddress, wallet)
```

- **Purpose:** Fetches the current balance of a specified token for the given wallet address.
- **Parameters:**
  - `tokenAddress`: The address of the token to check.
  - `wallet`: The wallet instance holding the tokens.

### 5. **performSwap**

```javascript
performSwap(router, params, signer)
```

- **Purpose:** Executes the token swap from AAVE to LINK using the Uniswap router.
- **Parameters:**
  - `router`: The Uniswap router contract instance.
  - `params`: The parameters prepared for the swap.
  - `signer`: The wallet instance that signs the transaction.

### 6. **authorizeLendingPool**

```javascript
authorizeLendingPool(tokenAddress, amount, signer)
```

- **Purpose:** Approves the LINK tokens for use by the AAVE lending pool.
- **Parameters:**
  - `tokenAddress`: The address of the LINK token.
  - `amount`: The amount of LINK tokens to approve.
  - `signer`: The wallet instance that signs the transaction.

### 7. **supplyTokensToAave**

```javascript
supplyTokensToAave(lendingPool, amount, tokenAddress, signer)
```

- **Purpose:** Supplies the approved LINK tokens to the AAVE lending pool.
- **Parameters:**
  - `lendingPool`: The AAVE lending pool contract instance.
  - `amount`: The amount of LINK tokens to supply.
  - `tokenAddress`: The address of the LINK token.
  - `signer`: The wallet instance that signs the transaction.

---

## Script Output
![image](https://github.com/user-attachments/assets/cb4e9922-fcb3-4ff4-ac9e-f0f89d680420)

## Additional Notes

- The script currently operates on the Sepolia testnet. Adjustments may be necessary to deploy it on a different network.
- Make sure to replace the contract addresses with the correct ones for your specific deployment.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/aave-link-swap-supply.git
   cd aave-link-swap-supply
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables:

   Create a `.env` file in the root directory and add your private key and RPC URL:

   ```
   PRIVATE_KEY=your-private-key
   RPC_URL=https://your-infura-rpc-url
   ```
