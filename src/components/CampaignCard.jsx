import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const CampaignCard = ({ id, title, desc, raised, goal, daysLeft }) => {
  const progress = (raised / goal) * 100;
  return (
    <Link to={`/campaign/${id}`} className="glass campaign-card animate-fade-in">
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
