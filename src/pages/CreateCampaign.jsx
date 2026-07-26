import React, { useState } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { buildCreateCampaignTx } from '../services/campaign';

const CreateCampaign = () => {
  useDocumentTitle('Create Campaign');
  const { execute, isPending } = useTransaction();
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    category: 'Technology',
    imageUrl: ''
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);
    
    await execute(
      (address) => buildCreateCampaignTx(address, {
        title: form.title,
        description: form.description,
        goal: BigInt(form.goal * 10000000), // XLM decimals
        deadline: deadlineTimestamp,
        category: form.category,
        imageUrl: form.imageUrl
      }),
      'Campaign created successfully!'
    );
  };

  return (
    <div className="animate-fade-in" style={{padding: '2rem 5%', maxWidth: '600px', margin: '0 auto'}}>
      <h2 className="section-title">Create Campaign</h2>
      <form className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}} onSubmit={handleSubmit}>
        
        <input type="text" name="title" placeholder="Campaign Title" required className="input-field" onChange={handleChange} />
        <textarea name="description" placeholder="Description" required rows="4" className="input-field" onChange={handleChange}></textarea>
        
        <div style={{display: 'flex', gap: '1rem'}}>
          <input type="number" name="goal" placeholder="Goal (XLM)" required min="1" className="input-field" style={{flex: 1}} onChange={handleChange} />
          <input type="date" name="deadline" required className="input-field" style={{flex: 1}} onChange={handleChange} />
        </div>
        
        <input type="url" name="imageUrl" placeholder="Image URL (optional)" className="input-field" onChange={handleChange} />
        
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Processing...' : 'Submit Campaign'}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
