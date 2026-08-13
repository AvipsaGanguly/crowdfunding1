import { useEffect } from 'react';

/**
 * Custom hook to dynamically set document title with brand suffix.
 * @param {string} title - Page title prefix
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | StellarFund`;
    } else {
      document.title = 'StellarFund | Stellar Crowdfunding Platform';
    }
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
