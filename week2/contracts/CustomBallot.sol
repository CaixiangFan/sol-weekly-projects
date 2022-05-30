// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/// @title Interface of the ERC20 tokenized vote
/// @author Matheus Pagani
/// @notice You can use this interface to connect a deployed token contract with
/// a ballot/voting contract
/// @dev This interface only defines a function returning the post votes
interface IERC20Votes {
    /// @dev Returns the past votes at the time of token deloyment
    function getPastVotes(address, uint256) external view returns (uint256);
}


/// @title A customed voting contract based on ERC20 token
/// @author Matheus Pagani
/// @notice You can use this contract for running a tokenized voting
/// @dev This contract implements a set of voting related functions
contract CustomBallot {
    /// @dev This event defines the voter, voted proposal, vote weight, and
    /// proposal votes. It will emitted after each vote.
    event Voted(
        address indexed voter,
        uint256 indexed proposal,
        uint256 weight,
        uint256 proposalVotes
    );

    /// @notice This structure has a name and corresponding vote count
    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    /// @dev This mapping records the sepnt vote powers of an address
    mapping(address => uint256) public spentVotePower;

    /// @dev This proposal array records all candidates
    Proposal[] public proposals;
    /// @dev This interface connects tooken with ballot contract
    IERC20Votes public voteToken;
    /// @dev This is the reference block number of past voting power at ballot
    /// contract deployment
    uint256 public referenceBlock;

    /// @dev This constructor deploys a ballot contract
    /// @param proposalNames The list(array) of proposals
    /// @param _voteToken The deploy address of the ERC20 token contract
    constructor(bytes32[] memory proposalNames, address _voteToken) {
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        /// @dev Connects ballot with token contract using interface and token address
        voteToken = IERC20Votes(_voteToken);
        /// @dev Gets the reference block number at ballot contract deployment 
        referenceBlock = block.number;
    }

    /// @dev This function defines the vote operation
    /// @param proposal The proposal index to vote
    /// @param amount The vote amount cast to a proposal
    function vote(uint256 proposal, uint256 amount) external {
        uint256 votingPowerAvailable = votingPower();
        require(votingPowerAvailable >= amount, "Has not enough voting power");
        spentVotePower[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
        emit Voted(msg.sender, proposal, amount, proposals[proposal].voteCount);
    }

    /// @dev This function gets the vote results by returning winner name
    /// @return winnerName_ The name of the winner
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    /// @dev This function can query the winning proposal in the process of voting
    /// @return winningProposal_ The winning proposal
    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    /// @dev This function return the total voting power of the message sender
    /// @return votingPower_ The voting power of message sender
    function votingPower() public view returns (uint256 votingPower_) {
        votingPower_ = voteToken.getPastVotes(
            msg.sender,
            referenceBlock
        ) - spentVotePower[msg.sender]; 
    }
}
