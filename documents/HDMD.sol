/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
    uint256 public totalSupply;
    function balanceOf(address who) constant returns (uint256);
    function transfer(address to, uint256 value) returns (bool);
    
    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public constant returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;


    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    function Ownable() {
        owner = msg.sender;
    }


    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal constant returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal constant returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

/**
 * @title PoSTokenStandard
 * @dev the interface of PoSTokenStandard
 */
contract PoSTokenStandard {
    function mint(uint256 _reward) public returns (bool);
    event Mint(address indexed _address, uint _reward);
}

contract HDMDToken is ERC20,PoSTokenStandard, Ownable {
    using SafeMath for uint256;

    string public name = "HopeDiamond";
    string public symbol = "HDMD";
    uint public decimals = 8; // HDMD should have the same decimals as DMD
    string public version = "0.1";

    uint public totalSupply;
    uint public totalInitialSupply;

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;
    mapping(address => bool) allowedMinters;

    // This notifies clients about the amount burnt
    event Burn(address indexed burner, bytes32 dmdAddress, uint256 value);

    /**
     * @dev Fix for the ERC20 short address attack.
     */
    modifier onlyPayloadSize(uint size) {
        require(msg.data.length >= size + 4);
        _;
    }

    modifier onlyMinter() {
        require(allowedMinters[msg.sender]);
        _;
    }

    function HDMDToken() public {
        totalInitialSupply = 10000; // DMD masternode

        balances[msg.sender] = totalInitialSupply;
        totalSupply = totalInitialSupply;
    }

    function transfer(address _to, uint256 _value) onlyPayloadSize(2 * 32) public returns (bool) {
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    function burn(uint _value, bytes32 _dmdAddress) public returns (bool) {
        require(_value > 0);
        balances[msg.sender] = balances[msg.sender].sub(_value);  // Subtract from the sender
        totalSupply = totalSupply.sub(_value); // Updates totalSupply        
        Burn(msg.sender, _dmdAddress, _value);
        return true;
    }

    // TODO: how do we validate the dmd address, and is bytes32 the correct datatype?
    function burnFrom(address _from, uint _value, bytes32 _dmdAddress) public returns (bool) {
        require(_value > 0);
        var _allowance = allowed[_from][msg.sender];

        balances[_from] = balances[_from].sub(_value);  // subtract from the sender
        allowed[_from][msg.sender] = _allowance.sub(_value); // subtract from the sender's allowance
        totalSupply = totalSupply.sub(_value); // subtract from totalSupply
        Burn(msg.sender, _dmdAddress, _value);
    }    

    function transferFrom(address _from, address _to, uint256 _value) public onlyPayloadSize(3 * 32) returns (bool) {
        require(_to != address(0));
        var _allowance = allowed[_from][msg.sender];
        // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
        // require (_value <= _allowance);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = _allowance.sub(_value);
        Transfer(_from, _to, _value);

        return true;
    }

    // approve another account to transfer your tokens
    function approve(address _spender, uint256 _value) public returns (bool) {
        require((_value == 0) || (allowed[msg.sender][_spender] == 0));

        Approval(msg.sender, _spender, _value);
        return true;
    }

    // how much the spender can spend from the owner's address
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function allowMinter(address _minter) onlyOwner public returns (bool) {
        allowedMinters[_minter] = true;
        return true;
    }
    
    function disallowMinter(address _minter) onlyOwner public returns (bool) {
        delete allowedMinters[_minter];
        return true;
    }

    function canMint(address _minter) public constant returns (bool) {
        return allowedMinters[_minter];
    }
    
    // modifies the total amount of coins in existance and gives the coins to the owner of the contract.
    function mint(uint256 _reward) onlyMinter public returns (bool) {
        if(balances[msg.sender] <= 0) return false;
        if(_reward <= 0) return false;

        // increase total supply of coins in existence
        totalSupply = totalSupply.add(_reward);

        // new coins are sent to the owner, which also updates the mapping
        balances[msg.sender] = balances[msg.sender].add(_reward);

        Mint(msg.sender, _reward);
        return true;
    }

    /* Batch token transfer. Used by contract creator to distribute initial and staked tokens to holders */
    function batchTransfer(address[] _recipients, uint[] _values) public onlyOwner returns (bool) {
        require( _recipients.length > 0 && _recipients.length == _values.length);

        uint total = 0;
        for (uint i = 0; i < _values.length; i++) {
            total = total.add(_values[i]);
        }
        require(total <= balances[msg.sender]);

        for (uint j = 0; j < _recipients.length; j++) {
            balances[_recipients[j]] = balances[_recipients[j]].add(_values[j]);
            Transfer(msg.sender, _recipients[j], _values[j]);
        }

        balances[msg.sender] = balances[msg.sender].sub(total);
  
        return true;
    }
    
    /* Contract owner can transfer from any account so erroneous transactions can be easily reversed */
    function ownerTransfer(address _from, address _to, uint256 _value) public onlyOwner onlyPayloadSize(3 * 32) returns (bool) {
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(_from, _to, _value);
        return true;
    }

    /* Contract owner can batch transfer back from multiple accounts */
    function reverseBatchTransfer(address[] _recipients, uint[] _values) public onlyOwner returns (bool) {
        require( _recipients.length > 0 && _recipients.length == _values.length);

        uint total = 0;
        for (uint i = 0; i < _values.length; i++) {
            total = total.add(_values[i]);
        }
        require(total <= balances[msg.sender]);

        for (uint j = 0; j < _recipients.length; j++) {
            balances[_recipients[j]] = balances[_recipients[j]].sub(_values[j]);
            Transfer(_recipients[j], msg.sender, _values[j]);
        }

        balances[msg.sender] = balances[msg.sender].add(total);
  
        return true;        
    }
}