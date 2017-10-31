pragma solidity ^0.4.11;

import "./ERC20.sol";
import "./SafeMath.sol";
import "./Ownable.sol";

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
    uint public decimals = 18;

    uint public totalSupply;
    uint public totalInitialSupply;

    struct transferInStruct {
    uint128 amount;
    uint64 time;
    }

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;
    mapping(address => transferInStruct[]) transferIns;

    event Burn(address indexed burner, uint256 value);

    /**
     * @dev Fix for the ERC20 short address attack.
     */
    modifier onlyPayloadSize(uint size) {
        require(msg.data.length >= size + 4);
        _;
    }

    modifier onlyMinter() {
        // TODO: only allow addresses in the allowedMinters to mint
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
        if (transferIns[msg.sender].length > 0) delete transferIns[msg.sender];

        uint64 _now = uint64(now);
        transferIns[msg.sender].push(transferInStruct(uint128(balances[msg.sender]),_now));
        transferIns[_to].push(transferInStruct(uint128(_value),_now));
        return true;
    }

    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
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
        if (transferIns[_from].length > 0) delete transferIns[_from];
        uint64 _now = uint64(now);
        transferIns[_from].push(transferInStruct(uint128(balances[_from]),_now));
        transferIns[_to].push(transferInStruct(uint128(_value),_now));

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
    
    // modifies the total amount of coins in existance and gives the coins to the owner of the contract.
    function mint(uint256 _reward) onlyMinter public returns (bool) {
        if(balances[msg.sender] <= 0) return false;
        if(transferIns[msg.sender].length <= 0) return false;
        if(_reward <= 0) return false;

        // increase total supply of coins in existence
        totalSupply = totalSupply.add(_reward);

        // new coins are sent to the owner
        balances[msg.sender] = balances[msg.sender].add(_reward);

        // the mapping of who owns what is updated.
        delete transferIns[msg.sender];
        transferIns[msg.sender].push(transferInStruct(uint128(balances[msg.sender]),uint64(now)));

        Mint(msg.sender, _reward);
        return true;
    }

    /* Batch token transfer. Used by contract creator to distribute initial tokens to holders */
    function batchTransfer(address[] _recipients, uint[] _values) public onlyOwner returns (bool) {
        require( _recipients.length > 0 && _recipients.length == _values.length);

        uint total = 0;
        for (uint i = 0; i < _values.length; i++) {
            total = total.add(_values[i]);
        }
        require(total <= balances[msg.sender]);

        uint64 _now = uint64(now);
        for (uint j = 0; j < _recipients.length; j++) {
            balances[_recipients[j]] = balances[_recipients[j]].add(_values[j]);
            transferIns[_recipients[j]].push(transferInStruct(uint128(_values[j]),_now));
            Transfer(msg.sender, _recipients[j], _values[j]);
        }

        balances[msg.sender] = balances[msg.sender].sub(total);
        if (transferIns[msg.sender].length > 0) delete transferIns[msg.sender];
        if (balances[msg.sender] > 0) transferIns[msg.sender].push(transferInStruct(uint128(balances[msg.sender]),_now));

        return true;
    }

    /* List inputs for an address */
    function getTransferInStructs(address _address) public constant returns (uint128[], uint64[]) {
        transferInStruct[] memory transferInStructs = transferIns[_address];
        uint length = transferInStructs.length;

        uint128[] memory amount = new uint128[](length);
        uint64[] memory time = new uint64[](length);

        for (uint i = 0; i < length; i++) {
            transferInStruct memory currentTransferInStruct;
            currentTransferInStruct = transferInStructs[i];
            amount[i] = currentTransferInStruct.amount;
            time[i] = currentTransferInStruct.time;

        }
        return (amount, time);        
    }
}