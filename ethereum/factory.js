//Tell web3 that a deployed copy of the 'CampaignFactory' exists
import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0x92FE4F58492A33C54d59088476303e6fE0fe957D'
);

export default instance;