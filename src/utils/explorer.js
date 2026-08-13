/**
 * Stellar Expert explorer helper utilities for Testnet.
 */

const BASE_EXPLORER_URL = 'https://stellar.expert/explorer/testnet';

/**
 * Returns the Stellar Expert explorer link for a transaction hash.
 * @param {string} txHash 
 * @returns {string}
 */
export const getTxExplorerUrl = (txHash) => {
  if (!txHash) return BASE_EXPLORER_URL;
  return `${BASE_EXPLORER_URL}/tx/${txHash}`;
};

/**
 * Returns the Stellar Expert explorer link for a contract or account address.
 * @param {string} address 
 * @returns {string}
 */
export const getContractExplorerUrl = (address) => {
  if (!address) return BASE_EXPLORER_URL;
  return `${BASE_EXPLORER_URL}/contract/${address}`;
};
