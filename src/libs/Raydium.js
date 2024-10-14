import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Liquidity,
  Token,
  TokenAmount,
  Trade,
  Currency,
} from "@raydium-io/raydium-sdk-v2";

class Raydium {
  constructor(rpcEndpoint, poolId) {
    this.connection = new Connection(rpcEndpoint);
    this.poolId = poolId;
  }

  async getPrice(inputMint, outputMint, amount) {
    try {
      const poolKeys = await this.getPoolKeys(this.poolId);
      const inputToken = new Token({
        mint: new PublicKey(inputMint),
        decimals: 9,
      });
      const outputToken = new Token({
        mint: new PublicKey(outputMint),
        decimals: 9,
      });

      const amountIn = new TokenAmount(inputToken, amount);
      const currencyOut = new Currency(outputToken, 9);

      const { amountOut, minAmountOut, currentPrice, executionPrice } =
        await Trade.getBestAmountOut({
          connection: this.connection,
          poolKeys,
          amountIn,
          currencyOut,
          slippage: 0.01,
        });

      return {
        amountOut: amountOut.toFixed(),
        minAmountOut: minAmountOut.toFixed(),
        currentPrice: currentPrice.toFixed(),
        executionPrice: executionPrice.toFixed(),
      };
    } catch (error) {
      console.error("获取价格时出错:", error);
      throw error;
    }
  }

  async swap(inputMint, outputMint, amount, slippage, wallet) {
    try {
      console.log(`开始交换: 输入代币 ${inputMint}, 输出代币 ${outputMint}, 数量 ${amount}`);

      const poolKeys = await this.getPoolKeys(this.poolId);
      console.log("获取到池密钥");

      const inputToken = new Token({
        mint: new PublicKey(inputMint),
        decimals: 9,
      });
      const outputToken = new Token({
        mint: new PublicKey(outputMint),
        decimals: 9,
      });

      const amountIn = new TokenAmount(inputToken, amount);
      const currencyOut = new Currency(outputToken, 9);

      console.log("获取用户代币账户");
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        wallet.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      console.log("创建交换交易");
      const { transaction } = await Trade.makeSwapTransaction({
        connection: this.connection,
        poolKeys,
        userKeys: {
          tokenAccounts: tokenAccounts.value.map((ta) => ({
            pubkey: ta.pubkey,
          })),
          owner: wallet.publicKey,
        },
        amountIn,
        currencyOut,
        slippage,
      });

      console.log("发送并确认交易");
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet]
      );

      console.log(`交易完成，签名: ${signature}`);
      return signature;
    } catch (error) {
      console.error("交换时出错:", error);
      throw error;
    }
  }

  async getPoolKeys(poolId) {
    try {
      const poolKeys = await Liquidity.fetchPoolKeys({
        connection: this.connection,
        poolId: new PublicKey(poolId),
        programId: new PublicKey(
          "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
        ),
      });
      return poolKeys;
    } catch (error) {
      console.error("获取池密钥时出错:", error);
      throw error;
    }
  }
}

export default Raydium;
