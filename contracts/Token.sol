//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Stakable.sol";

contract Token is Ownable, Stakable {
    uint256 private _totalSupply;
    uint8 private _decimals;
    string private _symbol;
    string private _name;

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 tokenTotalSupply, string memory tokenName, string memory tokenSymbol, uint8 tokenDecimals) {
        _totalSupply = tokenTotalSupply;
        _name = tokenName;
        _symbol = tokenSymbol;
        _decimals = tokenDecimals;

        _balances[msg.sender] = _totalSupply;

        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Token: cannot transfer from zero address");
        require(recipient != address(0), "Token: cannot transfer to zero address");
        require(_balances[sender] >= amount, "Token: cannot transfer more than account owns");

        _balances[recipient] = _balances[recipient] + amount;
        _balances[sender] = _balances[sender] - amount;
        emit Transfer(sender, recipient, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Token: zero address cannot approve");
        require(spender != address(0), "Token: cannot approve zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address spender, address recipient, uint256 amount) external returns(bool) {
        require(_allowances[spender][msg.sender] >= amount, "Token: You cannot spend that much on this account");
        _transfer(spender, recipient, amount);
        _approve(spender, msg.sender, _allowances[spender][msg.sender] - amount);
        return true;
    }
    
    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Token: cannot mint to zero address");
        _totalSupply = _totalSupply + amount;
        _balances[account] = _balances[account] + amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Token: cannot burn from zero address");
        require(_balances[account] >= amount, "Token: cannot burn more than account owns");
        _balances[account] = _balances[account] - amount;
        _totalSupply = _totalSupply - amount;
        emit Transfer(account, address(0), amount);
    }

    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        _burn(account, amount);
        return true;
    }

    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    function stake(uint256 amount) public {
        require(amount <= _balances[msg.sender], "Token: cannot stake more than you own");
        _stake(amount);
        _burn(msg.sender, amount);
    }

    function claimReward() public {
        uint256 reward = _claimReward();
        _mint(msg.sender, reward);
    }

    function unstake(uint256 amount) public {
        uint256 stakes = _unstake(amount);
        _mint(msg.sender, stakes);
    }
 }