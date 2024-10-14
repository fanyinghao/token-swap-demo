# token-swap-demo

代币交换功能demo，支持 `Uniswap` 和 `Raydium` 两个平台。

## 安装依赖

在项目根目录下运行以下命令安装所需依赖：

```bash
npm install
```

## 配置

在使用之前，需要进行一些必要的配置：

### Uniswap 配置

调用 `src/libs/Uniswap.js`：

- 配置 `web3.js` 的 `provider`
  * 可以使用 Metamask 的 provider
  * 或者自定义配置 `rpcEndpoint`
- 设置 Uniswap 的 `routerAddress`
```javascript
    // 初始化 provider
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

    // 初始化 wallet
    const privateKey = 'YOUR_PRIVATE_KEY';
    const wallet = new ethers.Wallet(privateKey, provider);

    // Uniswap V2 Router 地址
    const uniswapRouterAddress = '0x1234567890123456789012345678901234567890';

    // 初始化 Uniswap 实例
    const uniswap = new Uniswap(provider, uniswapRouterAddress);

```


### Raydium 配置

调用 `src/libs/Raydium.js`：

- 配置 Solana 的 `rpcEndpoint`
- 设置目标交易池的 `poolId`
```javascript
    // 初始化 RPC 端点
    const rpcEndpoint = 'https://api.mainnet-beta.solana.com';

    // 初始化 wallet
    const wallet = Keypair.generate();

    // 初始化 Raydium 实例
    const raydium = new Raydium(rpcEndpoint, '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2');
```

## 打开用户界面

```bash
npm start
```

启动后，可以在浏览器中访问该应用程序（默认地址通常是 `http://localhost:3000`）。

## 测试

```bash
npm run test-lib
```

## 跨链扩展

可能的扩展方向和所需技术:

### 跨链桥接

### 智能合约

使用跨链智能合约平台实现更复杂的跨链交互:

- Wormhole支持Solana与其他多条链之间的跨链通信和资产转移
- Ethereum的跨链桥接合约（如Arbitrum、Optimism等Layer 2解决方案）

### 聚合器

开发跨链DEX聚合器，整合多个DEX和跨链桥的流动性:

- 1inch Network: 多链DEX聚合器，可以作为参考
- 0x Protocol: 去中心化交易协议，支持跨链聚合

### 技术要求

实现跨链交换需要以下技术:

- 跨链消息传递和验证
- 多链钱包集成
- 跨链资产表示(如包装代币)
- 跨链交易状态跟踪和错误处理


## 参考

- [Uniswap](https://github.com/Uniswap/v2-periphery)
- [Raydium](https://github.com/raydium-io/raydium-sdk-v2)
