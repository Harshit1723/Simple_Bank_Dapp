import React from "react";
import {useState,useEffect} from 'react';
import './App.css';
import { ethers } from "ethers";
import { utils } from "ethers";
import contractABI from './BankContract.json';

const contractAddr = '0x897c0c0d2D4B0E7082B1b3D96a92e44c9eF61A5E';

const App = () => {


  const[walletConnected,setWalletConnected]=useState(false);
  const[customerAddress,setCustomerAddress]=useState();

  const[bankOwnerAddress,setBankOwnerAddress]=useState();
  const[isBankOwner,setIsBankOwner]=useState(false);

  const[bankName,setBankName] = useState('');
  const[isBankNameSet,setIsBankNameSet]=useState(false);

  const[inputValue,setInputValue]=useState({withdraw:"",deposit:"",bankName:""});

  const[customerBalance,setCustomerBalance]=useState();

  const[error,setError]=useState('');

  const connectWalletHandler = async() => {
    try{
      if(window.ethereum){
        const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
        setWalletConnected(true);
        setCustomerAddress(accounts[0]);
      }else{
        console.log("please install metamask");
        setError('No Metamask Detected');
      }
    }catch(error){
      console.log(error);
    }
  }

  const getBankNameHandler = async() => {
    try{
      if(window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(contractAddr,contractABI,signer);
        
        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setBankName(bankName.toString());
        setIsBankNameSet(true);

      }else{
        setError('Please install metamask first');
        console.log('Metamask not found');
      }
    }catch(error){
      console.log(error);
    }
  }

    const setBankNameHandler = async(event) => {
      event.preventDefault();
      try{
        if(window.ethereum){
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          const bankContract=new ethers.Contract(contractAddr,contractABI,signer);

          const txn = await bankContract.setBankName(utils.formatBytes32String(inputValue.bankName))
          console.log("Setting the Bank Name...");
          await txn.wait();
          console.log("Bank Name has been Set");

          await getBankNameHandler();
        }else{
          console.log('Metamask not present');
          setError("Please install metamask first");
        }
      }catch(error){
        console.log(error);
      }
    }

    const getBankOwnerHandler = async() => {
      try{
        if(window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          const bankContract = new ethers.Contract(contractAddr,contractABI,signer);
        
          let owner = await bankContract.bankOwner();
          setBankOwnerAddress(owner);

          const accounts = await window.ethereum.request({method:"eth_requestAccounts"});

          if(owner.toLowerCase() === accounts[0].toLowerCase()) {
            setIsBankOwner(true);
          }
        }else{

          console.log('Metamask not found');
          setError('Please install metamask');
        }
      }catch(error){
        console.log(error);
      }
    }

    const formatWalletAddress = (address) => {
      if(!address) return null;
      return(
        <>
          {address.slice(0,4)}...{address.slice(-4)}
        </>
      );
    }

    const customerBalanceHandler = async() => {
     try{
      if(window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const bankContract = new ethers.Contract(contractAddr,contractABI,signer);

        let balance = await bankContract.getCustomerBalance();
        setCustomerBalance(utils.formatEther(balance));
      }else{
        console.log("Please install metamask");
      }
     }catch(error){
      console.log(error);
     }
    }

    const depositMoneyHandler = async(event) => {
      try{
        event.preventDefault();

        if(window.ethereum){
          console.log('Deposit value',inputValue.deposit);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer=provider.getSigner();

          const bankContract = new ethers.Contract(contractAddr,contractABI,signer);
          
          const txn = await bankContract.depositMoney({value:ethers.utils.parseEther(inputValue.deposit)});

          console.log('Depositing money...');
          await txn.wait();

          console.log('Deposited money');

          customerBalanceHandler();
        
        
        }else{
          console.log('Please install metamask');
        }
      }catch(error){
        console.log(error);
      }
    }

    const withDrawMoneyHandler = async(event) => {
      try{
        event.preventDefault();

        if(window.ethereum){
    
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          const bankContract = new ethers.Contract(contractAddr,contractABI,signer);
          
          let myAddress = await signer.getAddress()
          console.log('provider signer...',myAddress);

          const txn = await bankContract.withdrawMoney(myAddress,ethers.utils.parseEther(inputValue.withdraw));
          
          console.log('withdrawing money');
          await txn.wait();

          customerBalanceHandler();
        
        }else{
          console.log('Please install metamask');
        }
      }catch(error){
       
        console.log(error);
      }
    }

    useEffect(() => {
      getBankNameHandler();
      getBankOwnerHandler();
      customerBalanceHandler();
      
    },[walletConnected]);


  return(
        <div className="main-container">

         

        <h2 className="headline"><span className="headline-gradient">Bank Contract Dapp </span>💰</h2>
        
          <h3 className="bankName">{bankName}</h3>

          <div className="flex-container">

          <div className="left-half">
          <p className="wallet-address">Bank owner Address : {formatWalletAddress(bankOwnerAddress)}</p>

<div >
  {walletConnected && <p className="wallet-address"><span>Your Wallet Address : </span>{formatWalletAddress(customerAddress)}</p>}
  <button className="btn-connect" onClick={connectWalletHandler}>
    {walletConnected? "Wallet Connected 🔒":"Connect Wallet 🔑"}
  </button>
  </div>
  

    <div>
   
    {isBankOwner && <section className="bank-owner-section">
      <h2 className="bank-owner-heading">Bank Admin Panel</h2>

      <div className="p-10">
        <form className="form-style">
            <input 
            type="text" 
            className="input-style"
            value={inputValue.bankName}
            onChange={(event) => setInputValue({...inputValue,bankName:event.target.value})}
            placeholder="Enter a Name for your Bank"/>

            <button className="btn-purple"
            onClick={setBankNameHandler}>Set Bank Name</button>
        </form>
      </div>

      </section>}
  </div>
    

          </div>

          <div className="right-half">
            <h3 className="btn-connect1" >Balance : {customerBalance} ETH</h3>
            
            <div className="handler">
              <form className="form-style">
                <input type="text" 
                className="input-style"
                value={inputValue.deposit}
                onChange={(event) => setInputValue({...inputValue,deposit:event.target.value})}
                placeholder="Enter the Amount"
                />
                <button className="btn-purple" onClick={depositMoneyHandler}>Deposit money in ETH</button>
              </form>
            </div>

            <div className="handler">
                <form className="form-style">
                  <input 
                  type="text"
                  className="input-style"
                  value={inputValue.withdraw}
                  onChange={(event) => setInputValue({...inputValue,withdraw:event.target.value})}
                  placeholder="Enter the amount"/>
                  <button className="btn-purple" onClick={withDrawMoneyHandler}>Withdraw money in ETH</button>
                </form>
            </div>
           
          </div>

          </div>

        </div>
        
       
  );
}

export default App;
