import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const CampaignCard = ({ id, title, desc, raised, goal, daysLeft, image, category }) => {
  const progress = goal > 0 ? (raised / goal) * 100 : 0;
  const descriptionText = desc && String(desc).trim() !== '' ? String(desc) : 'No description provided.';
  const hasImage = Boolean(image && String(image).trim() !== '');

  return (
    <Link to={`/campaign/${id}`} className="glass campaign-card animate-fade-in">
      {hasImage && (
        <div className="card-image-container">
          <img src={image} alt={title} className="card-image" />
        </div>
      )}
      {category && (
        <span style={{
          alignSelf: 'flex-start',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          marginBottom: '0.5rem',
          display: 'inline-block',
        }}>
          {category}
        </span>
      )}
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{descriptionText}</p>

      <div>
        <div className="card-stats">
          <span><strong>{raised} XLM</strong> raised</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} />
        <div className="card-stats" style={{ marginTop: '0.5rem' }}>
          <span>Goal: {goal} XLM</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
