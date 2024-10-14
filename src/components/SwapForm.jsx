import React, { useState } from "react";
import styled from "styled-components";

const SwapForm = () => {
  const [chain, setChain] = useState("Ethereum");
  const [walletAddress, setWalletAddress] = useState("");
  const [fromToken, setFromToken] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [toToken, setToToken] = useState("");
  const [toAmount, setToAmount] = useState("");

  // 维护 Ethereum 和 Solana 链的代币列表
  const [ethereumTokens, setEthereumTokens] = useState(["ETH", "USDT", "DAI"]);
  const [solanaTokens, setSolanaTokens] = useState(["SOL", "USDC", "SAMO"]);

  const handleChainChange = (e) => {
    setChain(e.target.value);
    setFromToken("");
    setToToken("");
    setFromAmount("");
    setToAmount("");
  };

  const handleWalletAddressChange = (e) => setWalletAddress(e.target.value);
  const handleFromTokenChange = (e) => setFromToken(e.target.value);
  const handleFromAmountChange = (e) => setFromAmount(e.target.value);
  const handleToTokenChange = (e) => setToToken(e.target.value);
  const handleToAmountChange = (e) => setToAmount(e.target.value);

  // 根据当前链获取代币选项
  const tokenOptions = chain === "Ethereum" ? ethereumTokens : solanaTokens;

  return (
    <FormWrapper>
      <FormContainer>
        <FormGroup>
          <Label>Chain</Label>
          <Select value={chain} onChange={handleChainChange}>
            <option value="Ethereum">Ethereum</option>
            <option value="Solana">Solana</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Wallet Address</Label>
          <InputContainer>
            <Input
              type="text"
              value={walletAddress}
              onChange={handleWalletAddressChange}
              placeholder="Enter wallet address"
            />
          </InputContainer>
        </FormGroup>

        <FormGroup>
          <Label>From</Label>
          <InputRow>
            <Select value={fromToken} onChange={handleFromTokenChange}>
              <option value="">Select Token</option>
              {tokenOptions.map((tokenSymbol) => (
                <option key={tokenSymbol} value={tokenSymbol}>
                  {tokenSymbol}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              value={fromAmount}
              onChange={handleFromAmountChange}
              placeholder="Enter amount"
            />
          </InputRow>
        </FormGroup>

        <FormGroup>
          <Label>To</Label>
          <InputRow>
            <Select value={toToken} onChange={handleToTokenChange}>
              <option value="">Select Token</option>
              {tokenOptions.map((tokenSymbol) => (
                <option key={tokenSymbol} value={tokenSymbol}>
                  {tokenSymbol}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              value={toAmount}
              onChange={handleToAmountChange}
              placeholder="Enter amount"
            />
          </InputRow>
        </FormGroup>

        <SubmitButton type="submit">Swap</SubmitButton>
      </FormContainer>
    </FormWrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 10px;
    width: 80%;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
`;

const InputContainer = styled.div`
  display: flex;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  background-color: #000000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a1a1a1;
  }
`;

export default SwapForm;
