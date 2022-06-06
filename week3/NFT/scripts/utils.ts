import { ethers } from "ethers";

function setupProvider() {
    const infuraOptions = process.env.PROVIDER_OPTIONS_INFURA_PROJECT_ID
        ? process.env.PROVIDER_OPTIONS_INFURA_PROJECT_SECRET
            ? {
                projectId: process.env.PROVIDER_OPTIONS_INFURA_PROJECT_ID,
                projectSecret: process.env.PROVIDER_OPTIONS_INFURA_PROJECT_SECRET,
            }
            : process.env.PROVIDER_OPTIONS_INFURA_PROJECT_ID
        : "";
    const options = {
        alchemy: process.env.ALCHEMY_RINKEBY_API_KEY,
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