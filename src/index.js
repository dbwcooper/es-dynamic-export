import { actionsFactory } from './util';


const Actions = actionsFactory([
    'setState',
    'getCustomer',
], 'home');

console.log('Actionss: ', Actions);
