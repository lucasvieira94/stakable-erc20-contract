const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Stake", function () {
    let accounts;
    let contractFactory;
    let token;
    let owner;
    let lucas;

    it("Should be possible for the contract owner to stake some tokens", async function () {
        accounts = await ethers.getSigners();
        contractFactory = await ethers.getContractFactory("Token");
        token = await contractFactory.deploy(5000000, "StakableToken", "STKN", 18);
        await token.deployed();
        owner = accounts[0];
        let totalSupply = await token.totalSupply();
        let ownerBalance = await token.balanceOf(await owner.getAddress());

        await token.stake(100000);

        totalSupply = await token.totalSupply();
        ownerBalance = await token.balanceOf(await owner.getAddress());
        const stakeReport = await token.stakeReport();
        const totalStaked = stakeReport[1];

        assert.equal(
            totalSupply.toNumber(),
            4900000,
            "Supply was not correctly decreased"
        );

        assert.equal(
            ownerBalance.toNumber(),
            4900000,
            "Owner balance was not correctly decreased"
        );

        assert.equal(
            totalStaked.toNumber(),
            100000,
            "Did not stake the correct amount for the owner"
        );
    });

    it("Should not be possible for an user with no tokens to stake", async function () {
        lucas = accounts[1];

        await expect(token.connect(lucas).stake(50000)).to.be.revertedWith(
            "Token: cannot stake more than you own"
        );
    });

    it("Should be possible for an user to stake an amount less or equal than it has", async function () {
        await token.mint(await lucas.getAddress(), 100000);
        let lucasBalance = await token.balanceOf(await lucas.getAddress());
        let totalSupply = await token.totalSupply();

        assert.equal(
            lucasBalance.toNumber(),
            100000,
            "Lucas balance did not update"
        );

        assert.equal(
            totalSupply.toNumber(),
            5000000,
            "Supply did not update"
        );

        
        await token.connect(lucas).stake(50000);

        lucasBalance = await token.balanceOf(await lucas.getAddress());
        totalSupply = await token.totalSupply();
        const lucasStakeReport = await token.connect(lucas).stakeReport();
        const lucasTotalStaked = lucasStakeReport[1];

        assert.equal(
            lucasBalance.toNumber(),
            50000,
            "Lucas balance did not update"
        );

        assert.equal(
            totalSupply.toNumber(),
            4950000,
            "Supply did not update"
        );

        assert.equal(
            lucasTotalStaked.toNumber(),
            50000,
            "Did not stake the correct amount for lucas"
        );
    });

    it("Should increase stakes rewards with time", async function () {
        // Advancing 6 months
        await ethers.provider.send("evm_increaseTime", [15780000]);
        await ethers.provider.send("evm_mine");

        const ownerStakeReport = await token.stakeReport();
        const ownerReward = ownerStakeReport[0];

        const lucasStakeReport = await token.connect(lucas).stakeReport();
        const lucasReward = lucasStakeReport[0];

        assert.isAbove(
            ownerReward.toNumber(),
            0,
            "Owner reward did not increased"
        );

        assert.isAbove(
            lucasReward.toNumber(),
            0,
            "Lucas reward did not increased"
        );

        assert.isAbove(
            ownerReward.toNumber(),
            lucasReward.toNumber(),
            "Owner reward should be greater than lucas"
        );
    });

    it("Should be possible for users to claim their reawrds from stake", async function () {
        const previousBalance = await token.balanceOf(await lucas.getAddress());
        const previousSupply = await token.totalSupply();
        let lucasStakeReport = await token.connect(lucas).stakeReport();
        const claimableReward = lucasStakeReport[0];

        await token.connect(lucas).claimReward();

        const updatedBalance = await token.balanceOf(await lucas.getAddress());
        const updatedSupply = await token.totalSupply();
        lucasStakeReport = await token.connect(lucas).stakeReport();

        assert.equal(
            updatedBalance.toNumber(),
            previousBalance.toNumber() + claimableReward.toNumber(),
            "Did not retrieve the correct reward to lucas"
        );

        assert.equal(
            updatedSupply.toNumber(),
            previousSupply.toNumber() + claimableReward.toNumber(),
            "Did not updated correctly the supply"
        );

        assert.equal(
            lucasStakeReport[0],
            0,
            "Did not empty lucas available reward"
        );
    });

    it("Should be possible for users to unstake partially or all their tokens", async function () {
        const ownerPreviousBalance = await token.balanceOf(await owner.getAddress());
        const previousSupply = await token.totalSupply();
        let ownerStakeReport = await token.stakeReport();
        const ownerClaimableReward = ownerStakeReport[0];
        const ownerTotalStaked = ownerStakeReport[1];

        const lucasPreviousBalance = await token.balanceOf(await lucas.getAddress());
        let lucasStakeReport = await token.connect(lucas).stakeReport();
        const lucasClaimableReward = lucasStakeReport[0];
        const lucasTotalStaked = lucasStakeReport[1];

        await token.unstake(ownerTotalStaked / 2);
        await token.connect(lucas).unstake(lucasTotalStaked)

        const ownerUpdatedBalance = await token.balanceOf(await owner.getAddress());
        ownerStakeReport = await token.stakeReport();
        const lucasUpdatedBalance = await token.balanceOf(await lucas.getAddress());
        lucasStakeReport = await token.connect(lucas).stakeReport();
        const updatedSupply = await token.totalSupply();

        assert.equal(
            ownerUpdatedBalance.toNumber(),
            ownerPreviousBalance.toNumber() + ownerClaimableReward.toNumber() + (ownerTotalStaked / 2),
            "Did not unstake the correct amount to the owner"
        );

        assert.equal(
            ownerStakeReport[1].toNumber(),
            ownerTotalStaked.toNumber() / 2,
            "Did update correctly owner stakes"
        );

        assert.equal(
            lucasUpdatedBalance.toNumber(),
            lucasPreviousBalance.toNumber() + lucasClaimableReward.toNumber() + (lucasTotalStaked.toNumber()),
            "Did not unstake the correct amount to the owner"
        );

        assert.equal(
            lucasStakeReport[1].toNumber(),
            0,
            "Did update correctly lucas stakes"
        );

        assert.equal(
            updatedSupply.toNumber(),
            previousSupply.toNumber() + ownerClaimableReward.toNumber() + (ownerTotalStaked.toNumber() / 2) + lucasClaimableReward.toNumber() + (lucasTotalStaked.toNumber()),
            "Did update correctly token supply"
        );
    });
});