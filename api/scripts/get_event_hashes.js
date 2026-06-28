const { ethers } = require('ethers');

const songCreatedSig = 'SongCreated(uint256,address,string)';
const editionCreatedSig = 'EditionCreated(uint256,uint256,string,uint256)';

console.log('SongCreated:', ethers.id(songCreatedSig));
console.log('EditionCreated:', ethers.id(editionCreatedSig));
