import Header from './components/Header';
import { Jumbotron, Container } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { getWeb3 } from './utils.js';
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import EVWP from './contracts/EVWP.abi.json';
import Erc20Abi from './contracts/IERC20Token.abi.json'
import { BeatLoader } from 'react-spinners';

const ERC20_DECIMALS = 18
const DaoContractAddress = "0x764354Ab0CDE955258aA7b6fE3C6718A868BA535"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"


let kit;

function App() {

  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [admin, setAdmin] = useState(undefined);
  const [shares, setShares] = useState(undefined);
  const [proposals, setProposals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isCelo, setIsCelo] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const web3 = await getWeb3();

      kit = newKitFromWeb3(web3)
      
      const accounts = await kit.web3.eth.getAccounts()

      //console.log(accounts);
      
      const contract = new kit.web3.eth.Contract(
        EVWP, DaoContractAddress
      );

      const balance = await kit.getTotalBalance(accounts[0]);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
        
      const admin = await contract.methods
        .admin()
        .call();
      
      setLoading(false);
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
      setAdmin(admin);
      setBalance(USDBalance)
    }
    init();
    window.celo.on('accountsChanged', accounts => {
      setAccounts(accounts);
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <Jumbotron>
        <Container>
          <h1 className="display-3">Easy voting with payment</h1>
          <p className="lead">A voting platform where you pay for vote with Celo token</p>
        </Container>
      </Jumbotron>
      <Container>
        <BeatLoader/>
      </Container>
    </div>
  );
}

export default App;
