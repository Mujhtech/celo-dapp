// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
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

    uint internal candidatesLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    
    constructor(
    ) {
        admin = msg.sender;
    }

    struct Candidate {
        string name;
        string image;
        string description;
        string occupation;
        uint vote;
    }

    mapping (uint => Candidate) internal candidates;
    address public admin;
    uint256 public availableFunds;

    function writeCandidate(
        string memory _name,
        string memory _image,
        string memory _description, 
        string memory _occupation
    ) public {
        uint _vote = 0;
        candidates[candidatesLength] = Candidate(
            _name,
            _image,
            _description,
            _occupation,
            _vote
        );
        candidatesLength++;
    }

    function readCandidate(uint _index) public view returns (
        string memory, 
        string memory, 
        string memory, 
        string memory, 
        uint
    ) {
        return (
            candidates[_index].name, 
            candidates[_index].image, 
            candidates[_index].description, 
            candidates[_index].occupation, 
            candidates[_index].vote
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
    
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }
    
    function vote(uint _index, uint256 amount, uint256 value) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            admin,
            amount
          ),
          "Transfer failed."
        );
        availableFunds = availableFunds.add(amount);
        candidates[_index].vote += value;
    }
    
    function getCandidatesLength() public view returns (uint) {
        return (candidatesLength);
    }
}