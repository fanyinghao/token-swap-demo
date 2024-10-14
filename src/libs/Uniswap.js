import Web3 from "web3";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";

export class Uniswap {
  constructor(provider, routerAddress) {
    try {
      this.web3 = new Web3(provider);
      this.routerAddress = routerAddress;
      this.routerContract = new this.web3.eth.Contract(
        IUniswapV2Router02.abi,
        routerAddress
      );
    } catch (error) {
      // 初始化失败时抛出异常
      throw new Error(`初始化 Uniswap 实例失败: ${error.message}`);
    }
  }

  async getPrice(tokenIn, tokenOut, amountIn) {
    try {
      // 获取代币兑换比例
      const amounts = await this.routerContract.methods
        .getAmountsOut(amountIn, [tokenIn, tokenOut])
        .call();
      const amountOut = amounts[1];
      const price = Number(amountOut) / Number(amountIn);
      return price;
    } catch (error) {
      throw new Error(`获取价格失败: ${error.message}`);
    }
  }

  async swap(tokenIn, tokenOut, amountIn, slippage, account) {
    try {
      console.log(`开始交换: 从 ${tokenIn} 到 ${tokenOut}, 输入数量: ${amountIn}`);

      // 获取预期输出金额
      const amounts = await this.routerContract.methods
        .getAmountsOut(amountIn, [tokenIn, tokenOut])
        .call();
      
      // 计算考虑滑点后的最小输出金额
      const amountOutMin = Math.floor(Number(amounts[1]) * (1 - slippage));
      console.log(`预期输出数量: ${amounts[1]}, 考虑滑点后的最小输出数量: ${amountOutMin}`);
      
      // 执行代币交换
      console.log('开始执行交换交易...');
      const tx = await this.routerContract.methods
        .swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          [tokenIn, tokenOut],
          account,
          Math.floor(Date.now() / 1000) + 60 * 20 // 交易超时：20分钟后
        )
        .send({ from: account });
      
      console.log(`交换成功完成. 交易哈希: ${tx.transactionHash}`);
      return tx;
    } catch (error) {
      console.error(`代币交换失败: ${error.message}`);
      throw new Error(`代币交换失败: ${error.message}`);
    }
  }

  async checkAllowance(tokenAddress, ownerAddress, spenderAddress) {
    try {
      // 创建代币合约实例
      const tokenContract = new this.web3.eth.Contract(
        [{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"}],
        tokenAddress
      );
      
      // 检查授权额度
      const allowance = await tokenContract.methods.allowance(ownerAddress, spenderAddress).call();
      return allowance;
    } catch (error) {
      throw new Error(`检查代币授权失败: ${error.message}`);
    }
  }

  async approveToken(tokenAddress, spenderAddress, amount, account) {
    try {
      // 创建代币合约实例
      const tokenContract = new this.web3.eth.Contract(
        [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"}],
        tokenAddress
      );
      
      // 执行授权
      const tx = await tokenContract.methods.approve(spenderAddress, amount).send({ from: account });
      return tx;
    } catch (error) {
      throw new Error(`代币授权失败: ${error.message}`);
    }
  }
}
