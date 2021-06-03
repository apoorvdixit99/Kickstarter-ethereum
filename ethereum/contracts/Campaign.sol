pragma solidity ^0.4.17;

contract CampaignFactory {
    
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    
    struct Request {
        string description; //purpose of request
        uint value; //ether to transfer
        address recipient;  //who gets the money
        bool complete;  //whether the request is done
        uint approvalCount; //track number of approvals
        mapping(address => bool) approvals; //track who has voted
    }
    
    //list of requests that the manager has created
    Request[] public requests;
    
    //address of the person who is managing the campaign
    address public manager;
    
    //minimum donation required to be considered a contributor/approver
    uint public minimumContribution;
    
    //list of addresses for every person who has donated money
    mapping(address => bool) public approvers;
    uint public approversCount;

    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    
    /*
    constructor function that sets the
    minimumContribution and the owner
    */
    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }
    
    /*
    called when someone wants to donate money
    to the campaign and become an approver
    */
    function contribute() public payable {
        require(msg.value > minimumContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    /*
    called by the manager to create a new spending request
    */
    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        requests.push(newRequest);
    }
    
    /*
    called by each contributor to approve a spending request
    */
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    /*
    after a request has gotten enough approvals
    the manager can call this to get money sent to the vendor
    */
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        require(request.approvalCount > uint(approversCount/2));
        require(!request.complete);
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    /*
    get summary
    */
    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    /*
    get requests count
    */
    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
    
    
}