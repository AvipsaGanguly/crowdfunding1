import { STROOPS_PER_XLM } from './constants';

/**
 * Address & Currency formatting utilities.
 */

/**
 * Truncates a Stellar G... address or C... contract ID.
 * @param {string} address 
 * @param {number} startChars 
 * @param {number} endChars 
 * @returns {string}
 */
export const truncateAddress = (address, startChars = 6, endChars = 6) => {
  if (!address || typeof address !== 'string') return 'N/A';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formats a stroop amount (BigInt or number) to XLM decimal string.
 * @param {bigint|number|string} stroops 
 * @returns {string}
 */
export const stroopsToXlm = (stroops) => {
  if (stroops === undefined || stroops === null) return '0';
  const num = Number(stroops) / STROOPS_PER_XLM;
  return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 7 });
};
