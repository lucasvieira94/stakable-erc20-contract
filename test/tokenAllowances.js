const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Allowances", function () {
  let accounts;
  let contractFactory;
  let token;
  let lucas;
  let joao;
  let carol;

  it("Should be possible for an account to approve another to manage some of its tokens", async function () {
    accounts = await ethers.getSigners();
    contractFactory = await ethers.getContractFactory("Token");
    token = await contractFactory.deploy(5000000, "NiceToken", "NTKN", 18);
    await token.deployed();
    lucas = accounts[1];
    joao = accounts[2];
    
    await token.transfer(await lucas.getAddress(), 10000);
    await token.connect(lucas).approve(await joao.getAddress(), 5000);
    const joaoAllowance = await token.allowance(await lucas.getAddress(), await joao.getAddress());

    assert.equal(
        joaoAllowance.toNumber(),
        5000,
        "Joao has not the correct allowance"
    );
  });

  it("Should not be possible for an account to transfer from more than it has as allowance", async function () {
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

    await expect(token.connect(joao).transferFrom(await lucas.getAddress(), await carol.getAddress(), 15000)).to.be.revertedWith(
        "Token: You cannot spend that much on this account"
    );

    lucasBalance = await token.balanceOf(await lucas.getAddress());
    carolBalance = await token.balanceOf(await carol.getAddress());

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
  });

  it("Should be possible for an account to trasnfer from what it has as allowance", async function () {
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

    await token.connect(joao).transferFrom(await lucas.getAddress(), await carol.getAddress(), 5000);

    lucasBalance = await token.balanceOf(await lucas.getAddress());
    carolBalance = await token.balanceOf(await carol.getAddress());

    assert.equal(
        lucasBalance.toNumber(),
        5000,
        "Lucas has not the correct updated balance"
      );
  
      assert.equal(
        carolBalance.toNumber(),
        5000,
        "Carol has not the correct updated balance"
      );
  });
});
