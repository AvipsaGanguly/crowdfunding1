const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname);
const srcDir = path.join(rootDir, 'src');

// 1. ErrorBoundary
const errorBoundaryCode = `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent-red)' }}>Oops!</h1>
          <p style={{ margin: '1rem 0' }}>Something went wrong. We are working on fixing it.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} aria-label="Reload Page">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
`;
fs.writeFileSync(path.join(srcDir, 'components', 'ErrorBoundary.jsx'), errorBoundaryCode);

// 2. useDocumentTitle hook
const useDocTitleCode = `import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = \`\${title} | Soroban Crowdfunding\`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
`;
fs.writeFileSync(path.join(srcDir, 'hooks', 'useDocumentTitle.jsx'), useDocTitleCode);

// 3. Update App.jsx for lazy loading and ErrorBoundary
let appCode = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
appCode = appCode.replace(
  /import Home from '\.\/pages\/Home';\nimport Dashboard from '\.\/pages\/Dashboard';\nimport CreateCampaign from '\.\/pages\/CreateCampaign';\nimport CampaignDetails from '\.\/pages\/CampaignDetails';/,
  `import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));
const CampaignDetails = lazy(() => import('./pages/CampaignDetails'));`
);

appCode = appCode.replace(
  `<Routes>`,
  `<ErrorBoundary>
          <Suspense fallback={<div className="loading-container">Loading...</div>}>
            <Routes>`
);
appCode = appCode.replace(
  `</Routes>`,
  `</Routes>
          </Suspense>
        </ErrorBoundary>`
);
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appCode);

// 4. Update index.html for SEO
let indexCode = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
indexCode = indexCode.replace(
  `<title>Vite + React</title>`,
  `<meta name="description" content="A decentralized crowdfunding platform built on Stellar Soroban." />
    <meta name="keywords" content="Stellar, Soroban, Crowdfunding, Web3, Blockchain" />
    <title>Soroban Crowdfunding</title>`
);
fs.writeFileSync(path.join(rootDir, 'index.html'), indexCode);

// 5. Update LiveFeed.jsx with React.memo
let liveFeedCode = fs.readFileSync(path.join(srcDir, 'components', 'LiveFeed.jsx'), 'utf8');
liveFeedCode = liveFeedCode.replace(`export default LiveFeed;`, `export default React.memo(LiveFeed);`);
fs.writeFileSync(path.join(srcDir, 'components', 'LiveFeed.jsx'), liveFeedCode);

// 6. Update WalletButton.jsx with accessibility
let walletCode = fs.readFileSync(path.join(srcDir, 'components', 'WalletButton.jsx'), 'utf8');
walletCode = walletCode.replace(
  `className="btn btn-primary"`,
  `className="btn btn-primary" aria-label="Connect your Stellar Wallet"`
);
walletCode = walletCode.replace(
  `className="btn btn-outline"`,
  `className="btn btn-outline" aria-label="Wallet connected: \${address.slice(0, 4)}..." tabIndex={0}`
);
fs.writeFileSync(path.join(srcDir, 'components', 'WalletButton.jsx'), walletCode);

// 7. Add useDocumentTitle to Home.jsx
let homeCode = fs.readFileSync(path.join(srcDir, 'pages', 'Home.jsx'), 'utf8');
homeCode = homeCode.replace(`import { useEvents } from '../hooks/useEvents';`, `import { useEvents } from '../hooks/useEvents';\nimport { useDocumentTitle } from '../hooks/useDocumentTitle';`);
homeCode = homeCode.replace(`const Home = () => {`, `const Home = () => {\n  useDocumentTitle('Home');`);
homeCode = homeCode.replace(`<div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>`, `<main className="animate-fade-in" style={{ paddingBottom: '3rem' }}>`);
homeCode = homeCode.replace(/(.*) <\/div>\n};/s, `$1 </main>\n};`);
fs.writeFileSync(path.join(srcDir, 'pages', 'Home.jsx'), homeCode);

// 8. Add useDocumentTitle to Dashboard.jsx
let dashCode = fs.readFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), 'utf8');
dashCode = dashCode.replace(`import { Link } from 'react-router-dom';`, `import { Link } from 'react-router-dom';\nimport { useDocumentTitle } from '../hooks/useDocumentTitle';`);
dashCode = dashCode.replace(`const Dashboard = () => {`, `const Dashboard = () => {\n  useDocumentTitle('Dashboard');`);
fs.writeFileSync(path.join(srcDir, 'pages', 'Dashboard.jsx'), dashCode);

// 9. Add useDocumentTitle to CreateCampaign.jsx
let createCode = fs.readFileSync(path.join(srcDir, 'pages', 'CreateCampaign.jsx'), 'utf8');
createCode = createCode.replace(`import { useTransaction } from '../hooks/useTransaction';`, `import { useTransaction } from '../hooks/useTransaction';\nimport { useDocumentTitle } from '../hooks/useDocumentTitle';`);
createCode = createCode.replace(`const CreateCampaign = () => {`, `const CreateCampaign = () => {\n  useDocumentTitle('Create Campaign');`);
fs.writeFileSync(path.join(srcDir, 'pages', 'CreateCampaign.jsx'), createCode);

console.log("Optimization successfully applied.");
