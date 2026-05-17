 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VeritasEscrow is AccessControl {

    bytes32 public constant ARBITER_ROLE =
        keccak256("ARBITER_ROLE");

    enum Status {
        CREATED,
        FUNDED,
        IN_PROGRESS,
        COMPLETED,
        DISPUTED,
        RELEASED,
        CANCELLED
    }

    struct Job {
        address client;
        address worker;
        uint256 amount;
        uint256 platformFee;
        Status status;
        bool exists;
    }

    IERC20 public stableToken;

    uint256 public feePercent = 100; 
    // 1% = 100 basis points

    mapping(uint256 => Job) public jobs;
    uint256 public jobCounter;

    constructor(address tokenAddress) {
        stableToken = IERC20(tokenAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITER_ROLE, msg.sender);
    }

    // ----------------------------
    // CREATE JOB (client sets worker)
    // ----------------------------
    function createJob(address worker)
        external
        returns (uint256)
    {
        jobCounter++;

        jobs[jobCounter] = Job({
            client: msg.sender,
            worker: worker,
            amount: 0,
            platformFee: 0,
            status: Status.CREATED,
            exists: true
        });

        return jobCounter;
    }

    // ----------------------------
    // FUND JOB
    // ----------------------------
    function fundJob(uint256 jobId, uint256 amount)
        external
    {
        Job storage job = jobs[jobId];

        require(job.exists, "Job not found");
        require(msg.sender == job.client, "Not client");
        require(job.status == Status.CREATED, "Invalid state");

        uint256 fee = (amount * feePercent) / 10000;
        uint256 total = amount + fee;

        stableToken.transferFrom(msg.sender, address(this), total);

        job.amount = amount;
        job.platformFee = fee;
        job.status = Status.FUNDED;
    }

    // ----------------------------
    // START WORK
    // ----------------------------
    function startWork(uint256 jobId) external {
        Job storage job = jobs[jobId];

        require(msg.sender == job.worker, "Not worker");
        require(job.status == Status.FUNDED, "Not funded");

        job.status = Status.IN_PROGRESS;
    }

    // ----------------------------
    // COMPLETE JOB
    // ----------------------------
    function completeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];

        require(msg.sender == job.client, "Not client");
        require(job.status == Status.IN_PROGRESS, "Not in progress");

        job.status = Status.COMPLETED;
    }

    // ----------------------------
    // RELEASE PAYMENT
    // ----------------------------
    function releasePayment(uint256 jobId) external {
        Job storage job = jobs[jobId];

        require(
            msg.sender == job.client ||
            hasRole(ARBITER_ROLE, msg.sender),
            "Not authorized"
        );

        require(
            job.status == Status.COMPLETED,
            "Job not completed"
        );

        job.status = Status.RELEASED;

        stableToken.transfer(job.worker, job.amount);
    }

    // ----------------------------
    // DISPUTE JOB
    // ----------------------------
    function disputeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];

        require(
            msg.sender == job.client ||
            msg.sender == job.worker,
            "Not participant"
        );

        require(
            job.status == Status.IN_PROGRESS ||
            job.status == Status.COMPLETED,
            "Invalid state"
        );

        job.status = Status.DISPUTED;
    }

    // ----------------------------
    // ARBITER RESOLUTION
    // ----------------------------
    function resolveDispute(
        uint256 jobId,
        bool payWorker
    )
        external
        onlyRole(ARBITER_ROLE)
    {
        Job storage job = jobs[jobId];

        require(job.status == Status.DISPUTED, "Not disputed");

        job.status = Status.RELEASED;

        if (payWorker) {
            stableToken.transfer(job.worker, job.amount);
        } else {
            stableToken.transfer(job.client, job.amount);
        }
    }

    // ----------------------------
    // VIEW JOB
    // ----------------------------
    function getJob(uint256 jobId)
        external
        view
        returns (Job memory)
    {
        return jobs[jobId];
    }
}a