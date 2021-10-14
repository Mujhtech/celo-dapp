// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

library SafeMath {
    /**
     * @dev Multiplies two numbers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);
        return c;
    }

    /**
     * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0); // Solidity only automatically asserts when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    /**
     * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;
        return c;
    }

    /**
     * @dev Adds two numbers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);
        return c;
    }

    /**
     * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

contract EvwpContract {
    using SafeMath for uint256;

    uint256 internal electionsLength;
    address internal cUsdTokenAddress;

    address public admin;
    uint256 public availableFunds;

    constructor() {
        admin = msg.sender;
        cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    }

    struct Election {
        uint256 id;
        string title;
        uint256 startTime;
        // in seconds
        uint256 duration;
        address creator;
        uint256 candidateLength;
    }

    struct Candidate {
        uint256 id;
        string name;
        string image;
        string description;
        string occupation;
        uint256 vote;
    }
    mapping(uint256 => Election) internal elections;

    mapping(uint256 => mapping(uint256 => Candidate))
        internal electionCandidates;

    // add candidate can only be callec by the owner of the election
    modifier onlyElectionOwner(uint256 _electionId) {
        Election storage election = elections[_electionId];
        require(
            election.creator == msg.sender,
            "Only the owner if this election can call this function"
        );
        _;
    }

    // ensure the election  has not ended
    modifier electionActive(uint256 _electionId) {
        Election storage election = elections[_electionId];
        require(
            election.startTime.add(election.duration) >= block.timestamp,
            "This election has ended"
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    function createElection(
        string memory _title,
        uint256 _startTime,
        // in seconds
        uint256 _duration
    ) public {
        elections[electionsLength] = Election(
            electionsLength,
            _title,
            _startTime,
            _duration,
            msg.sender,
            0
        );

        electionsLength++;
    }

    function writeCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _occupation
    ) public onlyElectionOwner(_electionId) electionActive(_electionId) {
        uint256 _vote = 0;

        // get the election with this ID
        Election storage election = elections[_electionId];
        require(election.creator != address(0), "this election does not exist");
        uint256 _candidateLength = election.candidateLength;
        electionCandidates[_electionId][_candidateLength] = Candidate(
            _candidateLength,
            _name,
            _image,
            _description,
            _occupation,
            _vote
        );

        // increment the length of candidates there
        election.candidateLength++;
    }

    function readCandidate(uint256 _candidateId, uint256 _electionId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        Election storage election = elections[_electionId];
        require(election.creator != address(0), "this election does not exist");
        Candidate storage candidate = electionCandidates[_electionId][
            _candidateId
        ];
        return (
            candidate.name,
            candidate.image,
            candidate.description,
            candidate.occupation,
            candidate.vote
        );
    }

    function withdrawFunds(uint256 amount, address payable to)
        external
        onlyAdmin
    {
        _transferFunds(amount, to);
    }

    function _transferFunds(uint256 amount, address payable to) internal {
        require(amount <= availableFunds, "not enough availableFunds");
        availableFunds = availableFunds.sub(amount);
        IERC20Token(cUsdTokenAddress).transfer(to, amount);
    }

    function vote(
        uint256 _candidateId,
        uint256 _electionId,
        uint256 amount,
        uint256 value
    ) public payable electionActive(_electionId) {
        Election storage election = elections[_electionId];
        require(election.creator != address(0), "this election does not exist");
        Candidate storage candidate = electionCandidates[_electionId][
            _candidateId
        ];
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                admin,
                amount
            ),
            "Transfer failed."
        );
        availableFunds = availableFunds.add(amount);
        candidate.vote += value;
    }

    function getCandidatesLength(uint256 _electionId)
        public
        view
        returns (uint256)
    {
        Election storage election = elections[_electionId];
        return (election.candidateLength);
    }

    function getElectionLength()
        public
        view
        returns (uint256)
    {
        return (electionsLength);
    }
}
