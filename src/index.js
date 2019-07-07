import { actionsFactory } from './util';

const actions = [
    'getDeploymentByNo',
    'queryCustomer',
    'saveCustomer',
    'createCustomer',
    'getDevicesByOrderNo',
    'getCustomerAddress',
    'queryDevices',
    'initDeployment',

    'setState',
    'setTitle',
    'saveDeployment',
    'setCustomerInfo',
    'setCustomerFields'
]
export const Actions = actionsFactory(actions, 'home');
console.log('Actions: ', Actions);
