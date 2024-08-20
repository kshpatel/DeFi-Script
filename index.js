import { ethers } from "ethers";
import FACTORY_ABI from "./abis/factory.json" assert { type: "json" };
import SWAP_ROUTER_ABI from "./abis/swaprouter.json" assert { type: "json" };
import POOL_ABI from "./abis/pool.json" assert { type: "json" };
import TOKEN_IN_ABI from "./abis/token.json" assert { type: "json" };
import LENDING_POOL_ABI from "./abis/lendingpool.json" assert { type: "json" };

import dotenv from "dotenv";
dotenv.config();

// Contract addresses
const FACTORY_ADDRESS = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";
const ROUTER_ADDRESS = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
const AAVE_LENDING_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contracts
const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
const lendingPool = new ethers.Contract(AAVE_LENDING_POOL_ADDRESS, LENDING_POOL_ABI, wallet);

// Token details
const AAVE = {
  chainId: 11155111,
  address: "0x88541670e55cc00beefd87eb59edd1b7c511ac9a",
  decimals: 18,
  symbol: "AAVE",
  name: "AAVE",
};

const LINK = {
  chainId: 11155111,
  address: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
  decimals: 18,
  symbol: "LINK",
  name: "Chainlink",
};

// Approve Token Spending Function
async function authorizeTokenUsage(tokenAddress, tokenABI, amount, signer) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
    const formattedAmount = ethers.parseUnits(amount.toString(), AAVE.decimals);
    const approvalTx = await tokenContract.approve.populateTransaction(ROUTER_ADDRESS, formattedAmount);
    const txResponse = await signer.sendTransaction(approvalTx);
    console.log(`Approval transaction sent: ${txResponse.hash}`);
    await txResponse.wait();
    console.log(`Token approval successful: https://sepolia.etherscan.io/tx/${txResponse.hash}`);
  } catch (error) {
    console.error("Error during token approval:", error);
    throw new Error("Token approval failed");
  }
}

// Retrieve Pool Information
async function fetchPoolDetails(factoryContract, tokenIn, tokenOut) {
  const poolAddress = await factoryContract.getPool(tokenIn.address, tokenOut.address, 3000);
  if (!poolAddress) throw new Error("Pool address not found");
  const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);
  return { poolContract, token0, token1, fee };
}

// Prepare Swap Parameters
async function createSwapParams(poolContract, signer, inputAmount) {
  return {
    tokenIn: AAVE.address,
    tokenOut: LINK.address,
    fee: await poolContract.fee(),
    recipient: signer.address,
    amountIn: inputAmount,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
}

// Retrieve Token Balance
async function retrieveTokenBalance(tokenAddress, wallet) {
  const tokenContract = new ethers.Contract(tokenAddress, TOKEN_IN_ABI, wallet);
  const balance = await tokenContract.balanceOf(wallet.address);
  return ethers.formatUnits(balance, LINK.decimals);
}

// Execute Token Swap
async function performSwap(router, params, signer) {
  const linkBalanceBefore = await retrieveTokenBalance(LINK.address, signer);
  const swapTx = await router.exactInputSingle.populateTransaction(params);
  const txResponse = await signer.sendTransaction(swapTx);
  console.log(`Swap transaction sent: ${txResponse.hash}`);
  await txResponse.wait();
  console.log(`Swap confirmed: https://sepolia.etherscan.io/tx/${txResponse.hash}`);
  
  const linkBalanceAfter = await retrieveTokenBalance(LINK.address, signer);
  const swappedAmount = linkBalanceAfter - linkBalanceBefore;
  console.log(`Swapped LINK amount: ${swappedAmount}`);
  return swappedAmount;
}

// Authorize Lending Pool Usage
async function authorizeLendingPool(tokenAddress, amount, signer) {
  const tokenContract = new ethers.Contract(tokenAddress, TOKEN_IN_ABI, signer);
  const formattedAmount = ethers.parseUnits(amount.toString(), LINK.decimals);
  const approvalTx = await tokenContract.approve.populateTransaction(AAVE_LENDING_POOL_ADDRESS, formattedAmount);
  const txResponse = await signer.sendTransaction(approvalTx);
  await txResponse.wait();
  console.log(`Lending pool approval successful for ${formattedAmount} LINK`);
}

// Supply Tokens to Aave
async function supplyTokensToAave(lendingPool, amount, tokenAddress, signer) {
  const formattedAmount = ethers.parseUnits(amount.toString(), LINK.decimals);
  const supplyTx = await lendingPool.supply(tokenAddress, formattedAmount, signer.address, 0, { gasLimit: 500000 });
  await supplyTx.wait();
  console.log(`Supply to Aave successful: https://sepolia.etherscan.io/tx/${supplyTx.hash}`);
}

// Main Function for Executing Swap and Deposit
async function swapAndDeposit(amount) {
  const formattedAmount = ethers.parseUnits(amount.toString(), AAVE.decimals);

  try {
    await authorizeTokenUsage(AAVE.address, TOKEN_IN_ABI, amount, wallet);
    const { poolContract } = await fetchPoolDetails(factory, AAVE, LINK);
    const swapParams = await createSwapParams(poolContract, wallet, formattedAmount);
    const swapRouter = new ethers.Contract(ROUTER_ADDRESS, SWAP_ROUTER_ABI, wallet);
    
    const swappedAmount = await performSwap(swapRouter, swapParams, wallet);
    await authorizeLendingPool(LINK.address, swappedAmount, wallet);
    await supplyTokensToAave(lendingPool, swappedAmount, LINK.address, wallet);
  } catch (error) {
    console.error("An error occurred during the swap and deposit process:", error.message);
  }
}

// Execute the main function
swapAndDeposit(1);
