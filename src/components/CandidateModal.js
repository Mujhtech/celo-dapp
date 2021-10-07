import React, { useState } from "react";
import {
    Button,
    Modal,
    ModalFooter,
    ModalHeader,
    ModalBody,
    Row,
    Col, Alert
} from "reactstrap";

export default function CandidateModal({
    modal,
    setModal,
    setSelectedCandidate,
    selectedCandidate,
    vote,
    approve,
    candidateId
}) {

    const [loading, setLoading] = useState(false);

    const closeModal = () => {
        setSelectedCandidate({});
        setModal(false);
    }

    const onChange = (e) => {
        let total = e.target.value * 0.05;
        document.getElementById('vote-button').innerText = "Vote and Pay " + total + "cUSD";
    }

    const voteNow = async (e) => {
        e.preventDefault();
        setLoading(true);
        let total = e.target.elements[0].value * 0.05;
        try {
            await approve(total);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            //notification(`⚠️ ${error}.`)
        }
        try {
            await vote(candidateId, total, e.target.elements[0].value);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            //notification(`⚠️ ${error}.`)

        }
    }

    return (
        <Modal isOpen={modal}>
            <ModalHeader>Vote {selectedCandidate[0]}</ModalHeader>
            <ModalBody>
                <Row>
                    <Col md="6" xs="6" sm="4">
                        <img src={selectedCandidate[1]} width="100%" alt="candidate" />
                    </Col>
                    <Col md="6" xs="6" sm="4">
                        <h2>{selectedCandidate[0]}</h2>
                        <h6>{selectedCandidate[2]}</h6>
                        <p>{selectedCandidate[3]}</p>
                        <form onSubmit={(e) => voteNow(e)}>
                            <div className="form-group">
                                <label htmlFor="vote-amount">Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min={0}
                                    id="vote-amount"
                                    onChange={(e) => onChange(e)}
                                    placeholder="Number of vote"
                                />
                            </div>
                            <br />
                            {loading ? <Alert color="info">
                                Processing...
                            </Alert> :
                                <button type="submit" id="vote-button" className="btn btn-primary">
                                    Vote
                                </button>}
                        </form>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                {loading === false ? <Button color="primary" onClick={() => closeModal()}>
                    Close
                </Button> : null}
            </ModalFooter>
        </Modal>
    );
}
