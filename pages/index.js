import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [goldQuantity, setGoldQuantity] = useState(0);
  const [years, setYears] = useState(1);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [modeOfPayment, setModeOfPayment] = useState("offline");
  const [discount, setDiscount] = useState(0);
  const [profit, setProfit] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const handleAccountChange = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        getATMContract();
      } else {
        setAccount(undefined);
      }
    }
  };

  const connectAccount = async () => {
    try {
      if (!ethWallet) throw new Error("MetaMask wallet is required to connect.");
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting account:", error.message);
    }
  };

  const getATMContract = () => {
    if (ethWallet) {
      const signer = ethWallet.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
      setATM(atmContract);
    }
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        const tx = await atm.deposit(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error depositing ETH:", error.message);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        const tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error withdrawing ETH:", error.message);
      }
    }
  };

  const calculateInvestmentAmount = () => {
    const pricePerGram = 50000; // Price of 10 grams of gold in INR
    const investment = (goldQuantity / 10) * pricePerGram; // Convert grams to 10 gram units
    setInvestmentAmount(investment);
  };

  const calculateProfit = () => {
    const interestRate = 0.025; // 2.5% interest rate
    const principal = investmentAmount;
    const returnAmount = principal * (1 + interestRate) ** years - principal;
    setProfit(returnAmount);
  };

  const handleModeOfPaymentChange = (event) => {
    setModeOfPayment(event.target.value);
  };

  const handleDiscountChange = () => {
    if (modeOfPayment === "online") {
      setDiscount(100);
    } else {
      setDiscount(0);
    }
  };

  useEffect(() => {
    initializeWeb3();
  }, []);

  useEffect(() => {
    handleAccountChange();
  }, [ethWallet]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {account ? (
        <div>
          <p>Your Account: {account}</p>
          <p>Your Balance: {balance}</p>
          <button onClick={deposit}>Deposit 1 ETH</button>
          <button onClick={withdraw}>Withdraw 1 ETH</button>
        </div>
      ) : (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      )}

      <section>
        <h2>Gold Investment Calculator</h2>
        <label>
          Quantity of Gold (grams): {goldQuantity}
          <input type="range" min="0" max="100" value={goldQuantity} onChange={(e) => setGoldQuantity(e.target.value)} />
        </label>
        <br />
        <label>
          No of Years: {years}
          <input type="range" min="1" max="10" value={years} onChange={(e) => setYears(e.target.value)} />
        </label>
        <br />
        <button onClick={calculateInvestmentAmount}>Calculate Estimated Investment Amount</button>
        <p>Estimated Investment Amount: {investmentAmount.toFixed(2)} INR</p>
        <button onClick={calculateProfit}>Calculate Profit</button>
        <p>Estimated Profit: {profit.toFixed(2)} INR</p>
      </section>

      <section>
        <h2>Mode of Payment</h2>
        <label>
          <input type="radio" value="online" checked={modeOfPayment === "online"} onChange={handleModeOfPaymentChange} />
          Online
        </label>
        <label>
          <input type="radio" value="offline" checked={modeOfPayment === "offline"} onChange={handleModeOfPaymentChange} />
          Offline
        </label>
        <br />
        <button onClick={handleDiscountChange}>Apply Discount</button>
        <p>Estimated Investment Amount with Discount: {investmentAmount - discount} INR</p>
      </section>

      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
