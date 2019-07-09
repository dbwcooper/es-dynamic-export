import { actionsFactory } from './util';


export default Actions = actionsFactory([
    'setState',
    'getCustomersd',
], 'home');

console.log('Actionss: ', Actions);
