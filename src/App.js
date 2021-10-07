import Header from './components/Header';
import { Jumbotron, Container, Row, Col } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { getWeb3 } from './utils.js';
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import EVWP from './contracts/EVWP.abi.json';
import Erc20Abi from './contracts/IERC20Token.abi.json'
import { BeatLoader } from 'react-spinners';
import CandidateCard from './components/CandidateCard';

const ERC20_DECIMALS = 18
const evwpContractAddress = "0xEd3b8c053eB3A6FE7B63965F6698A51D1588f4BF"
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


  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();

      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()

      const contract = new kit.web3.eth.Contract(
        EVWP, evwpContractAddress
      );

      const balance = await kit.getTotalBalance(accounts[0]);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const admin = await contract.methods
        .admin()
        .call();

      console.log(accounts[0]);

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


  const isReady = () => {
    return (
      typeof contract !== 'undefined'
      && typeof web3 !== 'undefined'
      && typeof accounts !== 'undefined'
      && typeof admin !== 'undefined'
    );
  }

  useEffect(() => {
    if (isReady()) {
    }
  }, [accounts, contract, web3, admin]);


  if (!isReady()) {
    return <BeatLoader />
  }

  return (
    <div className="App">
      <Header balance={balance} />
      <Jumbotron>
        <Container>
          <h1 className="display-3">Easy voting with payment</h1>
          <p className="lead">A voting platform where you pay for vote with Celo token</p>
        </Container>
      </Jumbotron>
      <Container>
        {accounts[0].toLowerCase() === admin.toLowerCase() ? (
          <>
            <Row>
              <Col md="6" xs="6" sm="4"><h2>Withdraw funds</h2></Col>
              <Col md="6" xs="6" sm="4"><h2>Add candidate</h2></Col>
            </Row>
            <hr />
          </>
        ) : null}
        <Row>
          <Col md="3" xs="6" sm="4"><CandidateCard /></Col>
          <Col md="3" xs="6" sm="4"><CandidateCard /></Col>
          <Col md="3" xs="6" sm="4"><CandidateCard /></Col>
          <Col md="3" xs="6" sm="4"><CandidateCard /></Col>
        </Row>

      </Container>
    </div>
  );
}

export default App;
