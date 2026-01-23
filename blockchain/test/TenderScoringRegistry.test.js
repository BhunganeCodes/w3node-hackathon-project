const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TenderScoringRegistry", function () {
    let registry, owner, user, oracle;

    beforeEach(async () => {
        [owner, user, oracle] = await ethers.getSigners();
        const Registry = await ethers.getContractFactory("TenderScoringRegistry");
        registry = await Registry.deploy();
        await registry.deployed();
    });

    it("Owner can set oracle", async () => {
        await registry.setScoringOracle(oracle.address);
        expect(await registry.scoringOracle()).to.equal(oracle.address);
    });

    it("Non-owner cannot set oracle", async () => {
        await expect(
            registry.connect(user).setScoringOracle(oracle.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Oracle can submit score", async () => {
        await registry.setScoringOracle(oracle.address);
        await registry.connect(oracle).submitScore(1, user.address, 9000, ethers.constants.HashZero);
        const [score] = await registry.getScore(1, user.address);
        expect(score).to.equal(9000);
    });

    it("Non-oracle cannot submit score", async () => {
        await registry.setScoringOracle(oracle.address);
        await expect(
            registry.connect(user).submitScore(1, user.address, 9000, ethers.constants.HashZero)
        ).to.be.revertedWith("Not authorized oracle");
    });
});
