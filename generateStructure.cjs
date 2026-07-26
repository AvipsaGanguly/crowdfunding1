const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const folders = [
  'assets',
  'components',
  'pages',
  'hooks',
  'services',
  'styles',
  'utils'
];

const components = [
  'Navbar.jsx',
  'Footer.jsx',
  'WalletButton.jsx',
  'CampaignCard.jsx',
  'CampaignDetailsCard.jsx',
  'ProgressBar.jsx',
  'LoadingSpinner.jsx',
  'Toast.jsx',
  'Modal.jsx',
  'HeroSection.jsx',
  'StatsCard.jsx'
];

const pages = [
  'Home.jsx',
  'CreateCampaign.jsx',
  'CampaignDetails.jsx',
  'Dashboard.jsx',
  'About.jsx',
  'NotFound.jsx'
];

const services = [
  'wallet.js',
  'stellar.js',
  'campaign.js',
  'contract.js',
  'eventService.js'
];

const hooks = [
  'useWallet.js',
  'useCampaign.js',
  'useTransaction.js'
];

const utils = [
  'constants.js',
  'helpers.js',
  'formatter.js',
  'validation.js'
];

const styles = [
  'globals.css',
  'variables.css',
  'animations.css'
];

// Create folders
folders.forEach(folder => {
  const dirPath = path.join(srcDir, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Helper to create a component file with boilerplate
function createComponent(dir, name) {
  const componentName = name.replace('.jsx', '');
  const content = `import React from 'react';\n\nconst ${componentName} = () => {\n  return (\n    <div>\n      ${componentName} Component\n    </div>\n  );\n};\n\nexport default ${componentName};\n`;
  fs.writeFileSync(path.join(srcDir, dir, name), content);
}

// Helper to create an empty JS/CSS file
function createEmptyFile(dir, name) {
  fs.writeFileSync(path.join(srcDir, dir, name), '// ' + name + '\n');
}

// Create files
components.forEach(c => createComponent('components', c));
pages.forEach(p => createComponent('pages', p));
services.forEach(s => createEmptyFile('services', s));
hooks.forEach(h => createEmptyFile('hooks', h));
utils.forEach(u => createEmptyFile('utils', u));
styles.forEach(s => createEmptyFile('styles', s));

// Update App.jsx to include React Router and a basic layout
const appContent = `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import NotFound from './pages/NotFound';

import './styles/globals.css';
import './styles/variables.css';
import './styles/animations.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
`;
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appContent);

// Update main.jsx to not use index.css since we have styles folder
const mainContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
fs.writeFileSync(path.join(srcDir, 'main.jsx'), mainContent);

// Remove default index.css and App.css
if (fs.existsSync(path.join(srcDir, 'index.css'))) {
  fs.unlinkSync(path.join(srcDir, 'index.css'));
}
if (fs.existsSync(path.join(srcDir, 'App.css'))) {
  fs.unlinkSync(path.join(srcDir, 'App.css'));
}

console.log('Project structure created successfully!');
