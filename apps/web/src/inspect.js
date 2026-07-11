const privyAuth = require('@privy-io/react-auth');
const privyWagmi = require('@privy-io/wagmi');
const zeroDevWagmi = require('@zerodev/wagmi');

console.log('--- @privy-io/react-auth ---');
console.log(Object.keys(privyAuth).filter(k => k.includes('Provider') || k.includes('use')));

console.log('--- @privy-io/wagmi ---');
console.log(Object.keys(privyWagmi));

console.log('--- @zerodev/wagmi ---');
console.log(Object.keys(zeroDevWagmi));
