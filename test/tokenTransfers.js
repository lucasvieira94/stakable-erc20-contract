const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Transfers", function () {
  let accounts;
  let contractFactory;
  let token;
  let owner;
  let lucas;
  let joao;
  let carol;

  it("Should be possible for the owner transfer tokens to another account", async function () {
    accounts = await ethers.getSigners();
    contractFactory = await ethers.getContractFactory("Token");
    token = await contractFactory.deploy(5000000, "NiceToken", "NTKN", 18);
    await token.deployed();
    owner = accounts[0];
    lucas = accounts[1];
    let ownerBalance = await token.balanceOf(await owner.getAddress());
    let lucasBalance = await token.balanceOf(await lucas.getAddress());

    assert.equal(
      ownerBalance.toNumber(),
      5000000,
      "Owner has not all tokens at begining"
    );

    assert.equal(
      lucasBalance.toNumber(),
      0,
      "Lucas has not an empty balance"
    );

    await token.transfer(await lucas.getAddress(), 10000);

    ownerBalance = await token.balanceOf(await owner.getAddress());
    lucasBalance = await token.balanceOf(await lucas.getAddress());

    assert.equal(
      ownerBalance.toNumber(),
      4990000,
      "Owner balance was not updated correctly"
    );

    assert.equal(
      lucasBalance.toNumber(),
      10000,
      "Lucas balance was not updated correctly"
    );
  });

  it("Should not be possible for an account to trasnfer more than it owns", async function () {
    joao = accounts[2];
    let lucasBalance = await token.balanceOf(await lucas.getAddress());
    let joaoBalance = await token.balanceOf(await joao.getAddress());

    assert.equal(
      lucasBalance.toNumber(),
      10000,
      "Lucas has not the correct balance"
    );

    assert.equal(
      joaoBalance.toNumber(),
      0,
      "Joao has not an empty balance"
    );

    await expect(token.connect(lucas).transfer(await joao.getAddress(), 15000)).to.be.revertedWith(
      "Token: cannot transfer more than account owns"
    );

    lucasBalance = await token.balanceOf(await lucas.getAddress());
    joaoBalance = await token.balanceOf(await joao.getAddress());

    assert.equal(
      lucasBalance.toNumber(),
      10000,
      "Lucas balance was not supposed to change"
    );

    assert.equal(
      joaoBalance.toNumber(),
      0,
      "Joao balance was not supposed to change"
    );
  });

  it("Should be possible for an account to transfer less than it owns", async function () {
    carol = accounts[3];
    let lucasBalance = await token.balanceOf(await lucas.getAddress());
    let carolBalance = await token.balanceOf(await carol.getAddress());
  
    assert.equal(
      lucasBalance.toNumber(),
      10000,
      "Lucas has not the correct balance"
    );

    assert.equal(
      carolBalance.toNumber(),
      0,
      "Carol has not an empty balance"
    );

    await token.connect(lucas).transfer(await carol.getAddress(), 5000);

    lucasBalance = await token.balanceOf(await lucas.getAddress());
    carolBalance = await token.balanceOf(await carol.getAddress());

    assert.equal(
      lucasBalance.toNumber(),
      5000,
      "Lucas balance was not updated correctly"
    );

    assert.equal(
      carolBalance.toNumber(),
      5000,
      "Carol balance was not updated correctly"
    );
  });
});
