import Web3 from "web3";
import { Uniswap } from "./Uniswap";

jest.mock("web3");

describe("Uniswap", () => {
  let uniswap;
  let mockProvider;
  let mockRouterAddress;
  let mockWeb3;
  let mockTokenContract;

  beforeEach(() => {
    mockProvider = "http://localhost:8545";
    mockRouterAddress = "0x1234567890123456789012345678901234567890";
    mockTokenContract = {
      methods: {
        allowance: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue("1000000000000000000"),
        }),
        approve: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue({ transactionHash: "0xdef456" }),
        }),
      },
    };
    mockWeb3 = {
      eth: {
        Contract: jest.fn().mockImplementation((abi, address) => {
          if (address === mockRouterAddress) {
            return {
              methods: {
                getAmountsOut: jest.fn().mockReturnValue({
                  call: jest
                    .fn()
                    .mockResolvedValue([
                      "1000000000000000000",
                      "2000000000000000000",
                    ]),
                }),
                swapExactTokensForTokens: jest.fn().mockReturnValue({
                  send: jest
                    .fn()
                    .mockResolvedValue({ transactionHash: "0xabcdef" }),
                }),
              },
            };
          } else {
            return mockTokenContract;
          }
        }),
      },
    };

    Web3.mockImplementation(() => mockWeb3);

    uniswap = new Uniswap(mockProvider, mockRouterAddress);
  });

  test("init Uniswap", () => {
    expect(uniswap.web3).toBeDefined();
    expect(uniswap.routerAddress).toBe(mockRouterAddress);
    expect(uniswap.routerContract).toBeDefined();
  });

  describe("getPrice", () => {
    test("should return price", async () => {
      const tokenIn = "0x1111111111111111111111111111111111111111";
      const tokenOut = "0x2222222222222222222222222222222222222222";
      const amountIn = "1000000000000000000";

      const price = await uniswap.getPrice(tokenIn, tokenOut, amountIn);

      expect(price).toBe(2); // 2000000000000000000 / 1000000000000000000 = 2
      expect(uniswap.routerContract.methods.getAmountsOut).toHaveBeenCalledWith(
        amountIn,
        [tokenIn, tokenOut]
      );
    });
  });

  describe("swap", () => {
    test("should execute a successful token swap", async () => {
      const tokenIn = "0x1111111111111111111111111111111111111111";
      const tokenOut = "0x2222222222222222222222222222222222222222";
      const amountIn = "1000000000000000000";
      const slippage = 0.01; // 1%
      const account = "0x3333333333333333333333333333333333333333";

      const tx = await uniswap.swap(
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
        account
      );

      expect(tx.transactionHash).toBe("0xabcdef");
      expect(
        uniswap.routerContract.methods.swapExactTokensForTokens
      ).toHaveBeenCalled();
      const callArgs =
        uniswap.routerContract.methods.swapExactTokensForTokens.mock.calls[0];
      expect(callArgs[0]).toBe(amountIn);
      expect(callArgs[1]).toBe(1980000000000000000); // 2000000000000000000 * 0.99 (1% slippage)
      expect(callArgs[2]).toEqual([tokenIn, tokenOut]);
      expect(callArgs[3]).toBe(account);
      expect(typeof callArgs[4]).toBe("number");
    });

    test("t", async () => {
      uniswap.routerContract.methods.getAmountsOut.mockReturnValue({
        call: jest.fn().mockRejectedValue(new Error("获取价格失败")),
      });

      await expect(
        uniswap.getPrice("tokenIn", "tokenOut", "1000")
      ).rejects.toThrow("获取价格失败");
    });

    test("should throw swap error", async () => {
      uniswap.routerContract.methods.swapExactTokensForTokens.mockReturnValue({
        send: jest.fn().mockRejectedValue(new Error("交换失败")),
      }); 

      await expect(
        uniswap.swap("tokenIn", "tokenOut", "1000", 0.01, "account")
      ).rejects.toThrow("代币交换失败");
    });
  });

  describe("token", () => {
    test("should check token allowance", async () => {
      const tokenAddress = "0x1111111111111111111111111111111111111111";
      const ownerAddress = "0x2222222222222222222222222222222222222222";
      const spenderAddress = "0x3333333333333333333333333333333333333333";

      const allowance = await uniswap.checkAllowance(
        tokenAddress,
        ownerAddress,
        spenderAddress
      );

      expect(allowance).toBe("1000000000000000000");
      expect(mockTokenContract.methods.allowance).toHaveBeenCalledWith(
        ownerAddress,
        spenderAddress
      );
    });

    test("should throw error when checking allowance fails", async () => {
      mockTokenContract.methods.allowance.mockReturnValue({
        call: jest.fn().mockRejectedValue(new Error("Allowance check failed")),
      });

      await expect(
        uniswap.checkAllowance("tokenAddress", "owner", "spender")
      ).rejects.toThrow("检查代币授权失败");
    });

    test("should approve token", async () => {
      const tokenAddress = "0x1111111111111111111111111111111111111111";
      const spenderAddress = "0x2222222222222222222222222222222222222222";
      const amount = "1000000000000000000";
      const account = "0x3333333333333333333333333333333333333333";

      const tx = await uniswap.approveToken(
        tokenAddress,
        spenderAddress,
        amount,
        account
      );

      expect(tx.transactionHash).toBe("0xdef456");
      expect(mockTokenContract.methods.approve).toHaveBeenCalledWith(
        spenderAddress,
        amount
      );
      expect(mockTokenContract.methods.approve().send).toHaveBeenCalledWith({
        from: account,
      });
    });

    test("should throw error when token approval fails", async () => {
      mockTokenContract.methods.approve.mockReturnValue({
        send: jest.fn().mockRejectedValue(new Error("Approval failed")),
      });

      await expect(
        uniswap.approveToken("tokenAddress", "spender", "1000", "account")
      ).rejects.toThrow("代币授权失败");
    });
  });
});
