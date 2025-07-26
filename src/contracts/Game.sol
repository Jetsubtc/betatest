// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract AxieGame {
    using ECDSA for bytes32;

    IERC20 public usdc;
    address public owner;
    uint256 public minBet;
    uint256 public maxBet;
    mapping(bytes32 => bool) public usedSignatures;

    event GameStarted(address indexed player, uint256 amount);
    event GameWon(address indexed player, uint256 amount, uint256 multiplier);
    event GameLost(address indexed player, uint256 amount);

    constructor(address _usdc, uint256 _minBet, uint256 _maxBet) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
        minBet = _minBet;
        maxBet = _maxBet;
    }

    function startGame(uint256 amount) external {
        require(amount >= minBet && amount <= maxBet, "Invalid bet amount");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit GameStarted(msg.sender, amount);
    }

    function claimReward(uint256 amount, uint256 multiplier, bytes calldata signature) external {
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, amount, multiplier));
        bytes32 signedMessageHash = messageHash.toEthSignedMessageHash();

        require(!usedSignatures[signedMessageHash], "Signature already used");
        require(signedMessageHash.recover(signature) == owner, "Invalid signature");

        usedSignatures[signedMessageHash] = true;

        // Note: Ensure your multiplier logic on the frontend matches this.
        // If your multiplier is a float (e.g., 1.59), you'll need to handle it as a fixed-point number.
        // For example, pass 159 and divide by 100 here.
        uint256 reward = (amount * multiplier) / 100; 
        require(usdc.transfer(msg.sender, reward), "Reward transfer failed");
        emit GameWon(msg.sender, reward, multiplier);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not the owner");
        payable(owner).transfer(address(this).balance);
    }
}