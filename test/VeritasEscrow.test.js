import { expect } from "chai";
import hre from "hardhat";

describe(
  "VeritasEscrow",
  function () {
    let owner;
    let client;
    let worker;

    let identity;
    let reputation;
    let escrow;
    let usdc;

    beforeEach(async function () {
      [
        owner,
        client,
        worker
      ] =
        await hre.ethers.getSigners();

      // -------------------------
      // DEPLOY IDENTITY
      // -------------------------

      const Identity =
        await hre.ethers.getContractFactory(
          "VeritasIdentityNFT"
        );

      identity =
        await Identity.deploy();

      await identity.waitForDeployment();

      // -------------------------
      // DEPLOY REPUTATION
      // -------------------------

      const Reputation =
        await hre.ethers.getContractFactory(
          "VeritasReputation"
        );

      reputation =
        await Reputation.deploy(
          await identity.getAddress()
        );

      await reputation.waitForDeployment();

      // -------------------------
      // DEPLOY MOCK USDC
      // -------------------------

      const MockUSDC =
        await hre.ethers.getContractFactory(
          "MockUSDC"
        );

      usdc =
        await MockUSDC.deploy();

      await usdc.waitForDeployment();

      // -------------------------
      // DEPLOY ESCROW
      // -------------------------

      const Escrow =
        await hre.ethers.getContractFactory(
          "VeritasEscrow"
        );

      escrow =
        await Escrow.deploy(
          await usdc.getAddress(),
          owner.address,
          await reputation.getAddress()
        );

      await escrow.waitForDeployment();

      // -------------------------
      // MINT IDENTITY NFTs
      // -------------------------

      await identity.mintIdentity(
        client.address,
        "ipfs://client"
      );

      await identity.mintIdentity(
        worker.address,
        "ipfs://worker"
      );

      // -------------------------
      // MINT USDC
      // -------------------------

      await usdc.mint(
        client.address,
        hre.ethers.parseUnits(
          "1000",
          6
        )
      );
    });

    it(
      "completes escrow flow",
      async function () {
        const amount =
          hre.ethers.parseUnits(
            "500",
            6
          );

        // APPROVE

        await usdc
          .connect(client)
          .approve(
            await escrow.getAddress(),
            amount
          );

        // CREATE JOB

        await escrow
          .connect(client)
          .createJob(
            worker.address,
            amount,
            "ipfs://job"
          );

        // FUND

        await escrow
          .connect(client)
          .fundJob(1);

        // ACCEPT

        await escrow
          .connect(worker)
          .acceptJob(1);

        // SUBMIT

        await escrow
          .connect(worker)
          .submitWork(1);

        // COMPLETE

        await escrow
          .connect(client)
          .completeJob(1);

        const balance =
          await usdc.balanceOf(
            worker.address
          );

        expect(balance).to.be.gt(0);
      }
    );

    it(
      "opens dispute",
      async function () {
        const amount =
          hre.ethers.parseUnits(
            "200",
            6
          );

        await usdc
          .connect(client)
          .approve(
            await escrow.getAddress(),
            amount
          );

        await escrow
          .connect(client)
          .createJob(
            worker.address,
            amount,
            "ipfs://job"
          );

        await escrow
          .connect(client)
          .fundJob(1);

        await escrow
          .connect(worker)
          .acceptJob(1);

        await escrow
          .connect(worker)
          .submitWork(1);

        await escrow
          .connect(client)
          .openDispute(
            1,
            "ipfs://evidence"
          );

        const job =
          await escrow.jobs(1);

        expect(
          job.status
        ).to.equal(6);
      }
    );

    it(
      "arbiter resolves dispute",
      async function () {
        const amount =
          hre.ethers.parseUnits(
            "300",
            6
          );

        await usdc
          .connect(client)
          .approve(
            await escrow.getAddress(),
            amount
          );

        await escrow
          .connect(client)
          .createJob(
            worker.address,
            amount,
            "ipfs://job"
          );

        await escrow
          .connect(client)
          .fundJob(1);

        await escrow
          .connect(worker)
          .acceptJob(1);

        await escrow
          .connect(worker)
          .submitWork(1);

        await escrow
          .connect(client)
          .openDispute(
            1,
            "ipfs://evidence"
          );

        await escrow
          .connect(owner)
          .resolveDispute(
            1,
            hre.ethers.parseUnits(
              "200",
              6
            )
          );

        const job =
          await escrow.jobs(1);

        expect(
          job.status
        ).to.equal(7);
      }
    );

    it(
      "blocks unauthorized dispute resolution",
      async function () {
        const amount =
          hre.ethers.parseUnits(
            "100",
            6
          );

        await usdc
          .connect(client)
          .approve(
            await escrow.getAddress(),
            amount
          );

        await escrow
          .connect(client)
          .createJob(
            worker.address,
            amount,
            "ipfs://job"
          );

        await escrow
          .connect(client)
          .fundJob(1);

        await escrow
          .connect(worker)
          .acceptJob(1);

        await escrow
          .connect(worker)
          .submitWork(1);

        await escrow
          .connect(client)
          .openDispute(
            1,
            "ipfs://evidence"
          );

        await expect(
          escrow
            .connect(worker)
            .resolveDispute(
              1,
              amount
            )
        ).to.be.reverted;
      }
    );
  }
);
