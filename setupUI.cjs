const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const stylesDir = path.join(srcDir, 'styles');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

// --- 1. CSS Files ---

const variablesCss = `:root {
  /* Colors */
  --bg-deep: #020617;
  --bg-dark: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.4);
  
  --accent-cyan: #06b6d4;
  --accent-cyan-glow: rgba(6, 182, 212, 0.5);
  --accent-purple: #8b5cf6;
  --accent-purple-glow: rgba(139, 92, 246, 0.5);
  
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-border-hover: rgba(255, 255, 255, 0.2);

  /* Geometry & Effects */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  
  --blur-md: 12px;
  --blur-lg: 24px;

  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
}
`;

const globalsCss = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: radial-gradient(circle at top right, var(--bg-dark), var(--bg-deep) 70%);
  color: var(--text-main);
  min-height: 100vh;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', sans-serif;
  color: var(--text-main);
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding-top: 80px; /* offset for fixed navbar */
}

/* Glassmorphism Utilities */
.glass {
  background: var(--bg-card);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.glass-panel {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
  border: 1px solid var(--glass-border);
}

/* Glowing text utilities */
.text-gradient {
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
`;

const animationsCss = `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 var(--accent-cyan-glow); }
  70% { box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
  100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.animate-fade-in { animation: fadeIn 0.5s ease forwards; }
.animate-slide-up { animation: slideUp 0.6s ease forwards; }
.animate-float { animation: float 6s ease-in-out infinite; }

/* Skeleton Class */
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
}
`;

const componentsCss = `/* Navbar */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  z-index: 1000;
  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}
.nav-logo { font-size: 1.5rem; font-weight: 700; font-family: 'Outfit', sans-serif; }
.nav-links { display: flex; gap: 2rem; }
.nav-links a { color: var(--text-muted); transition: var(--transition-normal); font-weight: 500; }
.nav-links a:hover { color: var(--text-main); }

/* Buttons */
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  transition: all var(--transition-normal);
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.btn-primary {
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple));
  color: #fff;
  box-shadow: 0 4px 15px var(--accent-cyan-glow);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-purple-glow);
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--accent-cyan);
  color: var(--accent-cyan);
}
.btn-outline:hover {
  background: rgba(6, 182, 212, 0.1);
}

/* Hero Section */
.hero {
  min-height: 80vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 2rem 5%; position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -20%; left: 10%; width: 400px; height: 400px;
  background: var(--accent-purple); filter: blur(150px); opacity: 0.3; border-radius: 50%; z-index: -1;
}
.hero::after {
  content: ''; position: absolute; bottom: -20%; right: 10%; width: 400px; height: 400px;
  background: var(--accent-cyan); filter: blur(150px); opacity: 0.3; border-radius: 50%; z-index: -1;
}
.hero h1 { font-size: 4rem; line-height: 1.1; margin-bottom: 1.5rem; }
.hero p { font-size: 1.25rem; color: var(--text-muted); max-width: 600px; margin-bottom: 2.5rem; }
.hero-actions { display: flex; gap: 1rem; }

/* Campaign Card */
.campaign-card {
  padding: 1.5rem;
  transition: transform var(--transition-normal), border-color var(--transition-normal);
  display: flex; flex-direction: column; gap: 1rem; cursor: pointer;
}
.campaign-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.3);
}
.card-image-placeholder {
  width: 100%; height: 180px; border-radius: var(--radius-md); background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center; color: var(--text-muted);
}
.card-title { font-size: 1.25rem; margin-bottom: 0.5rem; }
.card-desc { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; flex-grow: 1; }
.card-stats { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.card-stats span strong { color: var(--text-main); font-family: 'Outfit'; }

/* Progress Bar */
.progress-container {
  width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: var(--radius-full); overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-purple));
  border-radius: var(--radius-full); transition: width 1s ease-in-out;
}

/* Stats Card */
.stats-card {
  padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: center;
}
.stats-val { font-size: 2.5rem; font-weight: 700; }
.stats-label { color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

/* Dashboard Layout */
.dashboard-grid {
  display: grid; grid-template-columns: 1fr 3fr; gap: 2rem; padding: 2rem 5%;
}
@media (max-width: 768px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}
.wallet-card { padding: 1.5rem; text-align: center; }
.wallet-card h3 { margin-bottom: 1rem; color: var(--text-muted); }
.wallet-address { background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: var(--radius-sm); font-family: monospace; color: var(--accent-cyan); margin-bottom: 1.5rem; word-break: break-all; }

/* Grid container for generic lists */
.grid-container {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding: 2rem 5%;
}
.section-title { padding: 0 5%; margin-bottom: 1rem; font-size: 2rem; }

/* Footer */
.footer {
  padding: 2rem 5%; text-align: center; color: var(--text-muted); border-radius: 0;
  border-bottom: none; border-left: none; border-right: none; margin-top: auto;
}
`;

fs.writeFileSync(path.join(stylesDir, 'variables.css'), variablesCss);
fs.writeFileSync(path.join(stylesDir, 'globals.css'), globalsCss);
fs.writeFileSync(path.join(stylesDir, 'animations.css'), animationsCss);
fs.writeFileSync(path.join(stylesDir, 'components.css'), componentsCss);


// --- 2. React Components ---

const navbarJsx = `import React from 'react';
import { Link } from 'react-router-dom';
import WalletButton from './WalletButton';

const Navbar = () => {
  return (
    <nav className="glass-panel navbar">
      <Link to="/" className="nav-logo text-gradient">StellarFund</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-campaign">Create</Link>
      </div>
      <WalletButton />
    </nav>
  );
};

export default Navbar;
`;

const walletButtonJsx = `import React from 'react';

const WalletButton = () => {
  return (
    <button className="btn btn-primary" style={{ animation: 'pulse-glow 2s infinite' }}>
      Connect Wallet
    </button>
  );
};

export default WalletButton;
`;

const footerJsx = `import React from 'react';

const Footer = () => {
  return (
    <footer className="glass-panel footer">
      <p>&copy; {new Date().getFullYear()} StellarFund. Master Level 3 Architecture.</p>
    </footer>
  );
};

export default Footer;
`;

const heroSectionJsx = `import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="hero">
      <h1 className="animate-slide-up">Fuel the Future with <br/><span className="text-gradient animate-float" style={{display: 'inline-block'}}>Stellar</span></h1>
      <p className="animate-slide-up" style={{animationDelay: '0.1s'}}>
        Empower creators, support innovation, and join a decentralized community of backers.
      </p>
      <div className="hero-actions animate-slide-up" style={{animationDelay: '0.2s'}}>
        <Link to="/create-campaign" className="btn btn-primary">Start a Campaign</Link>
        <Link to="/about" className="btn btn-outline">Learn More</Link>
      </div>
    </section>
  );
};

export default HeroSection;
`;

const progressBarJsx = `import React from 'react';

const ProgressBar = ({ progress = 0 }) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  return (
    <div className="progress-container">
      <div className="progress-fill" style={{ width: \`\${safeProgress}%\` }}></div>
    </div>
  );
};

export default ProgressBar;
`;

const campaignCardJsx = `import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const CampaignCard = ({ id, title, desc, raised, goal, daysLeft }) => {
  const progress = (raised / goal) * 100;
  return (
    <Link to={\`/campaign/\${id}\`} className="glass campaign-card animate-fade-in">
      <div className="card-image-placeholder">
        <span>Image</span>
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{desc}</p>
      
      <div>
        <div className="card-stats">
          <span><strong>{raised} XLM</strong> raised</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} />
        <div className="card-stats" style={{marginTop: '0.5rem'}}>
          <span>Goal: {goal} XLM</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
`;

const statsCardJsx = `import React from 'react';

const StatsCard = ({ label, value }) => {
  return (
    <div className="glass stats-card animate-slide-up">
      <div className="stats-val text-gradient">{value}</div>
      <div className="stats-label">{label}</div>
    </div>
  );
};

export default StatsCard;
`;

// Loading Skeletons
const loadingSpinnerJsx = `import React from 'react';

// Renamed from Spinner to Skeleton usage or generic loaders
export const LoadingSkeleton = ({ height = '200px', width = '100%', borderRadius = '12px' }) => {
  return (
    <div className="skeleton" style={{ height, width, borderRadius }}></div>
  );
};

const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="skeleton" style={{width: '50px', height: '50px', borderRadius: '50%'}}></div>
    </div>
  );
};

export default LoadingSpinner;
`;


fs.writeFileSync(path.join(componentsDir, 'Navbar.jsx'), navbarJsx);
fs.writeFileSync(path.join(componentsDir, 'WalletButton.jsx'), walletButtonJsx);
fs.writeFileSync(path.join(componentsDir, 'Footer.jsx'), footerJsx);
fs.writeFileSync(path.join(componentsDir, 'HeroSection.jsx'), heroSectionJsx);
fs.writeFileSync(path.join(componentsDir, 'ProgressBar.jsx'), progressBarJsx);
fs.writeFileSync(path.join(componentsDir, 'CampaignCard.jsx'), campaignCardJsx);
fs.writeFileSync(path.join(componentsDir, 'StatsCard.jsx'), statsCardJsx);
fs.writeFileSync(path.join(componentsDir, 'LoadingSpinner.jsx'), loadingSpinnerJsx);


// --- 3. Pages ---

const homeJsx = `import React from 'react';
import HeroSection from '../components/HeroSection';
import StatsCard from '../components/StatsCard';
import CampaignCard from '../components/CampaignCard';

const dummyCampaigns = [
  { id: 1, title: 'Eco-Friendly Smart Home', desc: 'A revolutionary system to manage home energy efficiently.', raised: 5000, goal: 10000, daysLeft: 12 },
  { id: 2, title: 'Quantum Computing Ed', desc: 'Accessible courses for the next generation of devs.', raised: 12000, goal: 15000, daysLeft: 5 },
  { id: 3, title: 'Ocean Cleanup Drone', desc: 'Autonomous drone to collect microplastics.', raised: 1500, goal: 20000, daysLeft: 30 },
];

const Home = () => {
  return (
    <div className="animate-fade-in">
      <HeroSection />
      
      <div style={{ padding: '0 5%', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <StatsCard label="Total Raised" value="1.2M XLM" />
          <StatsCard label="Projects Funded" value="342" />
          <StatsCard label="Active Backers" value="12.5K" />
        </div>
      </div>

      <h2 className="section-title">Trending Campaigns</h2>
      <div className="grid-container">
        {dummyCampaigns.map(c => (
          <CampaignCard key={c.id} {...c} />
        ))}
      </div>
    </div>
  );
};

export default Home;
`;

const dashboardJsx = `import React from 'react';
import CampaignCard from '../components/CampaignCard';

const Dashboard = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <h2 className="section-title" style={{ marginTop: '2rem' }}>Dashboard</h2>
      
      <div className="dashboard-grid">
        <aside>
          <div className="glass wallet-card">
            <h3>Your Wallet</h3>
            <div className="wallet-address">GABC...XYZ123</div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Balance: </span>
              <strong style={{ fontSize: '1.2rem' }}>5,230 XLM</strong>
            </div>
            <button className="btn btn-outline" style={{width: '100%'}}>Disconnect</button>
          </div>
        </aside>
        
        <main>
          <h3 style={{ marginBottom: '1rem' }}>Your Campaigns</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <CampaignCard 
              id={99} title="My Awesome Project" desc="This is my project." 
              raised={200} goal={1000} daysLeft={22} 
            />
             <div className="glass campaign-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <span style={{ color: 'var(--text-muted)' }}>+ Create New</span>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
`;

fs.writeFileSync(path.join(pagesDir, 'Home.jsx'), homeJsx);
fs.writeFileSync(path.join(pagesDir, 'Dashboard.jsx'), dashboardJsx);


// --- 4. App.jsx Updates ---

const appJsx = `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './styles/components.css';

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
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx);

console.log("UI Implementation generated successfully.");
