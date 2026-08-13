import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../hooks/useTransaction';
import { buildCreateCampaignTx } from '../services/campaign';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const CreateCampaign = () => {
  useDocumentTitle('Create Campaign');
  const navigate = useNavigate();
  const { execute, isPending } = useTransaction();
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    category: 'Technology',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validate title & description ──────────────────────────────────────────
    const trimmedTitle = form.title.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      alert('Campaign title must be between 3 and 100 characters.');
      return;
    }

    const trimmedDescription = (form.description || '').trim();
    if (trimmedDescription.length > 500) {
      alert('Description cannot exceed 500 characters.');
      return;
    }

    // ── Parse goal ───────────────────────────────────────────────────────────
    const goalXLM = Number(form.goal);
    if (!goalXLM || goalXLM <= 0) {
      alert('Goal must be a positive number.');
      return;
    }
    if (goalXLM > 1_000_000) {
      alert('Maximum campaign goal is 1,000,000 XLM.');
      return;
    }
    const goalStroops = BigInt(Math.round(goalXLM * 10_000_000));

    // ── Parse deadline ───────────────────────────────────────────────────────
    const deadlineDate = new Date(`${form.deadline}T23:59:59`);
    const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
    const nowTimestamp = Math.floor(Date.now() / 1000);

    if (deadlineTimestamp <= nowTimestamp) {
      alert(
        `Deadline is in the past!\n\n` +
        `Deadline : ${deadlineDate.toLocaleString()} (unix ${deadlineTimestamp})\n` +
        `Now      : ${new Date(nowTimestamp * 1000).toLocaleString()} (unix ${nowTimestamp})\n\n` +
        `Please pick a future date.`
      );
      return;
    }

    const success = await execute(
      (address) => buildCreateCampaignTx(address, {
        title: trimmedTitle,
        description: form.description || '',
        goal: goalStroops,
        deadline: deadlineTimestamp,
        category: form.category,
      }),
      'Campaign created successfully!'
    );

    if (success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 5%', maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="section-title">Create Campaign</h2>
      <form className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>

        <input type="text" name="title" placeholder="Campaign Title" required className="input-field" onChange={handleChange} />
        <textarea name="description" placeholder="Description (optional)" rows="4" className="input-field" onChange={handleChange}></textarea>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="number" name="goal" placeholder="Goal (XLM)" required min="1" className="input-field" style={{ flex: 1 }} onChange={handleChange} />
          <input type="date" name="deadline" required min={tomorrowStr} className="input-field" style={{ flex: 1 }} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Processing...' : 'Submit Campaign'}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
