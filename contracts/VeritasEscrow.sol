// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IReputation {
    function addReputation(
        address user,
        int256 amount
    ) external;
}

contract VeritasEscrow is
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    bytes32 public constant
        ARBITER_ROLE =
        keccak256(
            "ARBITER_ROLE"
        );

    bytes32 public constant
        ADMIN_ROLE =
        keccak256(
            "ADMIN_ROLE"
        );

    IERC20 public immutable stableToken;

    IReputation public reputation;

    uint256 public totalJobs;

    uint256 public platformFeeBps =
        250;

    uint256 public constant
        MAX_BPS = 10000;

    uint256 public constant
        AUTO_CANCEL_TIME =
        7 days;

    address public treasury;

    enum JobStatus {
        NONE,
        CREATED,
        FUNDED,
        ACCEPTED,
        SUBMITTED,
        COMPLETED,
        DISPUTED,
        RESOLVED,
        CANCELLED
    }

    struct Job {
        uint256 id;
        address client;
        address worker;
        uint256 amount;
        uint256 feeAmount;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 acceptedAt;
        uint256 submittedAt;
        uint256 completedAt;
        bool exists;
        JobStatus status;
        string metadataURI;
        string evidenceURI;
    }

    mapping(uint256 => Job)
        public jobs;

    // -------------------------
    // EVENTS
    // -------------------------

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed worker,
        uint256 amount
    );

    event JobFunded(
        uint256 indexed jobId
    );

    event JobAccepted(
        uint256 indexed jobId
    );

    event WorkSubmitted(
        uint256 indexed jobId
    );

    event JobCompleted(
        uint256 indexed jobId
    );

    event DisputeOpened(
        uint256 indexed jobId,
        string evidenceURI
    );

    event DisputeResolved(
        uint256 indexed jobId,
        uint256 workerAmount,
        uint256 clientRefund
    );

    event JobCancelled(
        uint256 indexed jobId
    );

    event TreasuryUpdated(
        address treasury
    );

    event ReputationUpdated(
        address reputation
    );

    event FeeUpdated(
        uint256 fee
    );

    // -------------------------
    // CONSTRUCTOR
    // -------------------------

    constructor(
        address tokenAddress,
        address treasuryAddress,
        address reputationAddress
    ) {
        require(
            tokenAddress !=
                address(0),
            "Invalid token"
        );

        require(
            treasuryAddress !=
                address(0),
            "Invalid treasury"
        );

        stableToken = IERC20(
            tokenAddress
        );

        treasury =
            treasuryAddress;

        reputation =
            IReputation(
                reputationAddress
            );

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ARBITER_ROLE,
            msg.sender
        );
    }

    // -------------------------
    // CREATE JOB
    // -------------------------

    function createJob(
        address worker,
        uint256 amount,
        string memory metadataURI
    )
        external
        whenNotPaused
        returns (uint256)
    {
        require(
            worker != address(0),
            "Invalid worker"
        );

        require(
            amount > 0,
            "Invalid amount"
        );

        totalJobs++;

        uint256 feeAmount =
            (amount *
                platformFeeBps)
                / MAX_BPS;

        jobs[totalJobs] = Job({
            id: totalJobs,
            client: msg.sender,
            worker: worker,
            amount: amount,
            feeAmount: feeAmount,
            createdAt: block.timestamp,
            fundedAt: 0,
            acceptedAt: 0,
            submittedAt: 0,
            completedAt: 0,
            exists: true,
            status:
                JobStatus.CREATED,
            metadataURI:
                metadataURI,
            evidenceURI: ""
        });

        emit JobCreated(
            totalJobs,
            msg.sender,
            worker,
            amount
        );

        return totalJobs;
    }

    // -------------------------
    // FUND JOB
    // -------------------------

    function fundJob(
        uint256 jobId
    )
        external
        nonReentrant
        whenNotPaused
    {
        Job storage job =
            jobs[jobId];

        require(
            job.exists,
            "Job missing"
        );

        require(
            msg.sender ==
                job.client,
            "Not client"
        );

        require(
            job.status ==
                JobStatus.CREATED,
            "Invalid state"
        );

        stableToken.transferFrom(
            msg.sender,
            address(this),
            job.amount
        );

        job.status =
            JobStatus.FUNDED;

        job.fundedAt =
            block.timestamp;

        emit JobFunded(jobId);
    }

    // -------------------------
    // ACCEPT JOB
    // -------------------------

    function acceptJob(
        uint256 jobId
    )
        external
        whenNotPaused
    {
        Job storage job =
            jobs[jobId];

        require(
            msg.sender ==
                job.worker,
            "Not worker"
        );

        require(
            job.status ==
                JobStatus.FUNDED,
            "Invalid state"
        );

        job.status =
            JobStatus.ACCEPTED;

        job.acceptedAt =
            block.timestamp;

        emit JobAccepted(
            jobId
        );
    }

    // -------------------------
    // SUBMIT WORK
    // -------------------------

    function submitWork(
        uint256 jobId
    )
        external
        whenNotPaused
    {
        Job storage job =
            jobs[jobId];

        require(
            msg.sender ==
                job.worker,
            "Not worker"
        );

        require(
            job.status ==
                JobStatus.ACCEPTED,
            "Invalid state"
        );

        job.status =
            JobStatus.SUBMITTED;

        job.submittedAt =
            block.timestamp;

        emit WorkSubmitted(
            jobId
        );
    }

    // -------------------------
    // COMPLETE JOB
    // -------------------------

    function completeJob(
        uint256 jobId
    )
        external
        nonReentrant
        whenNotPaused
    {
        Job storage job =
            jobs[jobId];

        require(
            msg.sender ==
                job.client,
            "Not client"
        );

        require(
            job.status ==
                JobStatus.SUBMITTED,
            "Invalid state"
        );

        uint256 payout =
            job.amount -
            job.feeAmount;

        stableToken.transfer(
            job.worker,
            payout
        );

        stableToken.transfer(
            treasury,
            job.feeAmount
        );

        job.status =
            JobStatus.COMPLETED;

        job.completedAt =
            block.timestamp;

        reputation
            .addReputation(
                job.worker,
                10
            );

        reputation
            .addReputation(
                job.client,
                2
            );

        emit JobCompleted(
            jobId
        );
    }

    // -------------------------
    // OPEN DISPUTE
    // -------------------------

    function openDispute(
        uint256 jobId,
        string memory evidenceURI
    )
        external
        whenNotPaused
    {
        Job storage job =
            jobs[jobId];

        require(
            msg.sender ==
                job.client ||
                msg.sender ==
                job.worker,
            "Unauthorized"
        );

        require(
            job.status ==
                JobStatus.SUBMITTED,
            "Invalid state"
        );

        job.status =
            JobStatus.DISPUTED;

        job.evidenceURI =
            evidenceURI;

        emit DisputeOpened(
            jobId,
            evidenceURI
        );
    }

    // -------------------------
    // RESOLVE DISPUTE
    // -------------------------

    function resolveDispute(
        uint256 jobId,
        uint256 workerAmount
    )
        external
        nonReentrant
        onlyRole(
            ARBITER_ROLE
        )
    {
        Job storage job =
            jobs[jobId];

        require(
            job.status ==
                JobStatus.DISPUTED,
            "Not disputed"
        );

        require(
            workerAmount <=
                job.amount,
            "Invalid amount"
        );

        uint256 refund =
            job.amount -
            workerAmount;

        if (workerAmount > 0) {
            stableToken.transfer(
                job.worker,
                workerAmount
            );
        }

        if (refund > 0) {
            stableToken.transfer(
                job.client,
                refund
            );
        }

        if (
            workerAmount >
            refund
        ) {
            reputation
                .addReputation(
                    job.worker,
                    5
                );

            reputation
                .addReputation(
                    job.client,
                    -3
                );
        } else {
            reputation
                .addReputation(
                    job.worker,
                    -5
                );

            reputation
                .addReputation(
                    job.client,
                    2
                );
        }

        job.status =
            JobStatus.RESOLVED;

        emit DisputeResolved(
            jobId,
            workerAmount,
            refund
        );
    }

    // -------------------------
    // AUTO CANCEL
    // -------------------------

    function autoCancel(
        uint256 jobId
    ) external nonReentrant {
        Job storage job =
            jobs[jobId];

        require(
            job.status ==
                JobStatus.FUNDED,
            "Not funded"
        );

        require(
            block.timestamp >
                job.fundedAt +
                    AUTO_CANCEL_TIME,
            "Too early"
        );

        stableToken.transfer(
            job.client,
            job.amount
        );

        job.status =
            JobStatus.CANCELLED;

        emit JobCancelled(
            jobId
        );
    }

    // -------------------------
    // ADMIN
    // -------------------------

    function setTreasury(
        address newTreasury
    )
        external
        onlyRole(
            ADMIN_ROLE
        )
    {
        treasury =
            newTreasury;

        emit TreasuryUpdated(
            newTreasury
        );
    }

    function setFee(
        uint256 newFee
    )
        external
        onlyRole(
            ADMIN_ROLE
        )
    {
        require(
            newFee <= 1000,
            "Fee too high"
        );

        platformFeeBps =
            newFee;

        emit FeeUpdated(
            newFee
        );
    }

    function pause()
        external
        onlyRole(
            ADMIN_ROLE
        )
    {
        _pause();
    }

    function unpause()
        external
        onlyRole(
            ADMIN_ROLE
        )
    {
        _unpause();
    }
}
