import { ethers } from "ethers";

function setupProvider() {
    const infuraOptions = process.env.INFURA_API_KEY
      ? process.env.INFURA_API_SECRET
        ? {
            projectId: process.env.INFURA_API_KEY,
            projectSecret: process.env.INFURA_API_SECRET,
          }
        : process.env.INFURA_API_KEY
      : "";
    const options = {
      alchemy: process.env.ALCHEMY_API_KEY,
      infura: infuraOptions,
    };
    const provider = ethers.providers.getDefaultProvider("goerli", options);
    return provider;
  }

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
        bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

export {
    EXPOSED_KEY,
    setupProvider,
    convertStringArrayToBytes32
  }