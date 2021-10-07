import Header from "./components/Header";
import { Jumbotron, Container, Row, Col } from "reactstrap";
import React, { useEffect, useState } from "react";
import { getWeb3 } from "./utils.js";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import EVWP from "./contracts/EVWP.abi.json";
import Erc20Abi from "./contracts/IERC20Token.abi.json";
import CandidateCard from "./components/CandidateCard";
import { useToasts } from "react-toast-notifications";
import CandidateModal from "./components/CandidateModal";
import Loading from "./Loading";

const ERC20_DECIMALS = 18;
const evwpContractAddress = "0x3b9661C4F4f390F043521f7b1718299a08CB0b4E";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit;

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [admin, setAdmin] = useState(undefined);
  const [candidates, setCandidates] = useState([]);
  const [balance, setBalance] = useState(0);
  const [inputs, setInputs] = useState({
    withdrawAmount: "",
    withdrawTo: "",
    candidateName: "",
    candidateImage: "",
    candidateDescription: "",
    candidateOccupation: "",
  });
  const { addToast } = useToasts();
  const [modal, setModal] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({});
  const [candidateId, setCandidateId] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();

      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();

      const contract = new kit.web3.eth.Contract(EVWP, evwpContractAddress);

      const balance = await kit.getTotalBalance(accounts[0]);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const admin = await contract.methods.admin().call();

      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
      setAdmin(admin);
      setBalance(USDBalance);
    };
    init();
    window.celo.on("accountsChanged", (accounts) => {
      setAccounts(accounts);
    });
  }, []);

  const isReady = () => {
    return (
      typeof contract !== "undefined" &&
      typeof web3 !== "undefined" &&
      typeof accounts !== "undefined" &&
      typeof admin !== "undefined"
    );
  };

  useEffect(() => {
    // eslint-disable-next-line
    if (isReady()) {
      updateCandidate();
    }
    // eslint-disable-next-line
  }, [accounts, contract, web3, admin]);

  function onChange(name, e) {
    setInputs({
      ...inputs,
      [name]: e.target.value,
    });
  }

  async function approve(_price) {
    const cUSDContract = new kit.web3.eth.Contract(
      Erc20Abi,
      cUSDContractAddress
    );
    const result = await cUSDContract.methods
      .approve(evwpContractAddress, _price)
      .send({ from: accounts[0] });
    return result;
  }

  async function createCandidate(e) {
    // Another Possible Error
    addToast("⌛ Creating candidate", { appearance: "success", autoDismiss: true });
    e.preventDefault();
    const name = e.target.elements[0].value;
    const image = e.target.elements[1].value;
    const description = e.target.elements[2].value;
    const occupation = e.target.elements[3].value;

    try {
      await contract.methods
        .writeCandidate(name, image, description, occupation)
        .send({ from: accounts[0] });
      addToast("🎉 Candidate created Successful", { appearance: "success", autoDismiss: true });

      await updateCandidate();
    } catch (error) {
      addToast(`⚠️ ${error}`, { appearance: "error", autoDismiss: true });
    }

    setInputs({
      candidateDescription: "",
      candidateOccupation: "",
      candidateImage: "",
      candidateName: "",
    });
  }

  async function updateCandidate() {
    const _candidateLength = await contract.methods
      .getCandidatesLength()
      .call();

    const candidates = [];
    for (let i = 0; i < _candidateLength; i++) {
      const [candidate] = await Promise.all([
        contract.methods.readCandidate(i).call(),
      ]);
      candidates.push({ ...candidate });
    }
    setCandidates(candidates);
  }

  async function vote(id, amount, value) {
    addToast("⌛ Sending your vote ", { appearance: "success", autoDismiss: true });
    try {
      const new_amount = new BigNumber(amount).shiftedBy(ERC20_DECIMALS);
      const _amount = new_amount.toString();
      await contract.methods.vote(id, _amount, value).send({ from: accounts[0] });
      addToast("🎉 Vote Successful", { appearance: "success", autoDismiss: true });
      await updateCandidate();
    } catch (error) {
      addToast(`⚠️ ${error}`, { appearance: "error", autoDismiss: true });
    }
  }

  async function withdrawFunds(e) {
    addToast("⌛ Withdrawing funds", { appearance: "success", autoDismiss: true });
    //notification("");
    e.preventDefault();
    const amount = new BigNumber(e.target.elements[0].value).shiftedBy(
      ERC20_DECIMALS
    );
    const to = e.target.elements[1].value;
    try {
      await contract.methods.withdraw(amount, to).send({ from: accounts[0] });
      addToast("🎉 Successful withdrawal.", { appearance: "success", autoDismiss: true });
    } catch (error) {
      addToast(`⚠️ ${error}`, { appearance: "error", autoDismiss: true });
    }
    setInputs({
      ...inputs,
      withdrawAmount: "",
      withdrawTo: "",
    });
  }

  const enableVoteModal = (index, candidate) => {
    setCandidateId(index);
    setSelectedCandidate(candidate);
    setModal(true);
  };

  if (!isReady()) {
    return <Loading />;
  }

  return (
    <div className="App">
      <Header balance={balance} />
      <Jumbotron>
        <Container>
          <h1 className="display-3">Easy voting with payment</h1>
          <p className="lead">
            A voting platform where you pay for vote with Celo token
          </p>
        </Container>
      </Jumbotron>
      <Container>
        {accounts[0].toLowerCase() === admin.toLowerCase() ? (
          <>
            <Row>
              <Col md="6" xs="6" sm="4">
                <h2>Withdraw funds</h2>
                <form onSubmit={(e) => withdrawFunds(e)}>
                  <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      id="amount"
                      value={inputs.withdrawAmount}
                      onChange={(e) => onChange("withdrawAmount", e)}
                      placeholder="Amount to withdraw in cUSD"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="to">To</label>
                    <input
                      type="text"
                      className="form-control"
                      id="to"
                      value={inputs.withdrawTo}
                      onChange={(e) => onChange("withdrawTo", e)}
                    />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </Col>
              <Col md="6" xs="6" sm="4">
                <h2>Add candidate</h2>
                <form onSubmit={(e) => createCandidate(e)}>
                  <div className="form-group">
                    <label htmlFor="amount">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={inputs.candidateName}
                      onChange={(e) => onChange("candidateName", e)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="to">Image</label>
                    <input
                      type="text"
                      className="form-control"
                      id="image"
                      value={inputs.candidateImage}
                      onChange={(e) => onChange("candidateImage", e)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="to">Occupation</label>
                    <input
                      type="text"
                      className="form-control"
                      id="occupation"
                      value={inputs.candidateOccupation}
                      onChange={(e) => onChange("candidateOccupation", e)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="to">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      value={inputs.candidateDescription}
                      onChange={(e) => onChange("candidateDescription", e)}
                    />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-primary">
                    Add
                  </button>
                </form>
              </Col>
            </Row>
            <hr />
          </>
        ) : null}
        <Row>
          {candidates.map((candidate, index) => (
            <Col md="3" xs="6" sm="4" key={index}>
              <CandidateCard
                candidate={candidate}
                index={index}
                enableVoteModal={enableVoteModal}
              />
            </Col>
          ))}
        </Row>
      </Container>
      <CandidateModal
        modal={modal}
        setModal={setModal}
        selectedCandidate={selectedCandidate}
        setSelectedCandidate={setSelectedCandidate}
        vote={vote}
        approve={approve}
        candidateId={candidateId}
        setCandidateId={setCandidateId}
      />
    </div>
  );
}

export default App;
