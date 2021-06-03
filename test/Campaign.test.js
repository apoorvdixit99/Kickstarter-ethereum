const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {

    //Get accounts from ganache
    accounts = await web3.eth.getAccounts();
    
    //Create and deploy CampaignFactory Contract
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });
    
    //Invoke createCampaign() function of CampaignFactory Contract
    //This creates a new Campaign
    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });

    //Get the address of the new Campaign
    const addresses = await factory.methods.getDeployedCampaigns().call();
    campaignAddress = addresses[0];

    //Get the instance of the new Campaign
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaign', () => {

    it('deploys a factory', () => {
        assert.ok(factory.options.address);
    });

    it('deploys a campaign', () => {
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();    //manager() is a getter function automatically generated
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();    //approvers() is a getter function automatically generated
        assert(isContributor);
    });

    it('requires a minimum contribution', async () => {
        try{
            await campaign.methods.contribute().send({
                value: '5',
                from: accounts[1]
            });
            assert(false);
        } catch(err){
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Buy Batteries', '100', accounts[1])
            .send({
                from : accounts[0],
                gas : '1000000'
            });
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy Batteries', request.description);
    });

    //End to end test
    //file:///home/darealappu/Desktop/Udemy - Ethereum and Solidity The Complete Developer's Guide/06 Ethereum Project Infrastructure/143 One End to End Test.mp4

});