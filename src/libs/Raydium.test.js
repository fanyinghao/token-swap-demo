import { Connection, PublicKey, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Liquidity, Trade } from "@raydium-io/raydium-sdk-v2";
import Raydium from "./Raydium";
import BN from 'bn.js';

const mockGetTokenAccountsByOwner = jest.fn();
jest.mock("@solana/web3.js", () => {
  const original = jest.requireActual("@solana/web3.js");
  return {
    ...original,
    Connection: jest.fn().mockImplementation(() => ({
      getTokenAccountsByOwner: mockGetTokenAccountsByOwner,
    })),
    sendAndConfirmTransaction: jest.fn(),
  };
});

jest.mock("@raydium-io/raydium-sdk-v2", () => ({
  Liquidity: {
    fetchPoolKeys: jest.fn(),
  },
  Trade: {
    getBestAmountOut: jest.fn(),
    makeSwapTransaction: jest.fn(),
  },
}));

describe("Raydium", () => {
  let raydium;
  const mockRpcEndpoint = "https://api.mainnet-beta.solana.com";
  const mockWallet = Keypair.generate();

  beforeEach(() => {
    jest.clearAllMocks();
    raydium = new Raydium(mockRpcEndpoint, "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2");
  });

  describe("getPrice", () => {
    it("should return price information", async () => {
      const mockPoolKeys = { /* ... */ };
      const mockTradeResult = {
        amountOut: new BN('100'),
        minAmountOut: new BN('95'),
        currentPrice: new BN('15000'),
        executionPrice: new BN('14800'),
      };

      Liquidity.fetchPoolKeys.mockResolvedValue(mockPoolKeys);
      Trade.getBestAmountOut.mockResolvedValue(mockTradeResult);

      const result = await raydium.getPrice(
        "So11111111111111111111111111111111111111112",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        new BN("1000000000")
      );

      expect(result).toEqual({
        amountOut: "100",
        minAmountOut: "95",
        currentPrice: "1.5",
        executionPrice: "1.48",
      });
    });

    it("should handle errors when getting price", async () => {
      const mockError = new Error("获取价格时出错");
      Liquidity.fetchPoolKeys.mockRejectedValue(mockError);

      await expect(raydium.getPrice(
        "So11111111111111111111111111111111111111112",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        new BN("1000000000")
      )).rejects.toThrow("获取价格时出错");

    });
  });

  describe("swap", () => {
    it("should perform a swap and return a signature", async () => {
      const mockPoolKeys = { /* ... */ };
      const mockTokenAccounts = {
        value: [{ pubkey: new PublicKey("FMpBUNisEFgx1Zs5sJMJz6SuDCDfFFd5YkuVU1mF8VME") }],
      };
      const mockTransaction = { /* ... */ };
      const mockSignature = "mockSignature";

      Liquidity.fetchPoolKeys.mockResolvedValue(mockPoolKeys);
      mockGetTokenAccountsByOwner.mockResolvedValue(mockTokenAccounts);
      Trade.makeSwapTransaction.mockResolvedValue({ transaction: mockTransaction });
      sendAndConfirmTransaction.mockResolvedValue(mockSignature);

      const result = await raydium.swap(
        "So11111111111111111111111111111111111111112",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        new BN("1000000000"),
        0.01,
        mockWallet
      );

      expect(Liquidity.fetchPoolKeys).toHaveBeenCalledWith(expect.any(Object));
      expect(mockGetTokenAccountsByOwner).toHaveBeenCalledWith(
        mockWallet.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      expect(Trade.makeSwapTransaction).toHaveBeenCalledWith(expect.any(Object));
      expect(sendAndConfirmTransaction).toHaveBeenCalledWith(
        expect.any(Connection),
        mockTransaction,
        [mockWallet]
      );
      expect(result).toBe(mockSignature);
    });

    it("should throw an error if swap fails", async () => {
      Liquidity.fetchPoolKeys.mockRejectedValue(new Error("Swap error"));

      await expect(raydium.swap(
        "So11111111111111111111111111111111111111112",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        new BN("1000000000"),
        0.01,
        mockWallet
      )).rejects.toThrow();
    });
  });

  describe("getPoolKeys", () => {
    it("should return pool keys", async () => {
      const mockPoolKeys = { /* ... */ };
      Liquidity.fetchPoolKeys.mockResolvedValue(mockPoolKeys);

      const result = await raydium.getPoolKeys("58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2");

      expect(result).toBe(mockPoolKeys);
      expect(Liquidity.fetchPoolKeys).toHaveBeenCalledWith({
        connection: raydium.connection,
        poolId: new PublicKey("58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2"),
        programId: expect.any(PublicKey),
      });
    });

  });
});
