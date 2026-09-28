import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const sections = ['Dashboard', 'Expenses', 'Budget', 'Profile'];
const categories = ['Food', 'Groceries', 'Transport', 'Shopping', 'Education', 'Entertainment', 'Other'];

export default function App() {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState('');
  const totalSpent = useMemo(() => expenses.reduce((total, item) => total + item.amount, 0), [expenses]);

  function addExpense(expense) {
    setExpenses((items) => [{ ...expense, id: crypto.randomUUID() }, ...items]);
    setActiveSection('Dashboard');
  }

  function loadGroceryExamples() {
    const samples = [
      { id: crypto.randomUUID(), title: 'Milk and bread', amount: 85, category: 'Groceries' },
      { id: crypto.randomUUID(), title: 'Fruit and snacks', amount: 140, category: 'Groceries' },
      { id: crypto.randomUUID(), title: 'College lunch', amount: 120, category: 'Food' },
    ];
    setExpenses(samples);
    setActiveSection('Dashboard');
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span className="brand-mark">₹</span><span>MintMate</span></a>
      <nav aria-label="Main navigation">
        {sections.map((section) => <button key={section} className={`nav-item ${activeSection === section ? 'active' : ''}`} onClick={() => setActiveSection(section)}>{section}</button>)}
      </nav>
      <div className="sidebar-tip"><p><strong>Money, minus the confusion.</strong><br />Start with one small expense.</p></div>
    </aside>
    <main className="main-content" id="top">
      <header className="topbar"><div><p className="eyebrow">{activeSection}</p><h1>{activeSection === 'Dashboard' ? 'Your money space' : activeSection}</h1></div><button className="profile-button">S</button></header>
      {activeSection === 'Dashboard' && <Dashboard expenses={expenses} totalSpent={totalSpent} budget={budget} goTo={setActiveSection} loadGroceryExamples={loadGroceryExamples} />}
      {activeSection === 'Expenses' && <ExpenseManager expenses={expenses} onSave={addExpense} />}
      {activeSection === 'Budget' && <BudgetManager budget={budget} setBudget={setBudget} totalSpent={totalSpent} />}
      {activeSection === 'Profile' && <Profile />}
    </main>
  </div>;
}

function Dashboard({ expenses, totalSpent, budget, goTo, loadGroceryExamples }) {
  const remaining = budget ? Number(budget) - totalSpent : null;
  return <>
    <section className="hero-card"><div><span className="hero-kicker">YOUR PERSONAL MONEY SPACE</span><h2>Know where your money goes - without complicated maths.</h2><p>Follow the three easy steps below. Your totals update automatically in rupees.</p><button className="primary-button" onClick={() => goTo('Expenses')}>Start step 1: Add an expense</button></div><div className="hero-graphic"><span>₹</span></div></section>
    <section className="summary-grid"><Summary title="Total spent" value={money(totalSpent)} note={`${expenses.length} expense${expenses.length === 1 ? '' : 's'} added`} tone="purple" /><Summary title="This month" value={money(totalSpent)} note="This browser session" tone="blue" /><Summary title="My budget" value={budget ? money(budget) : 'Not set'} note={budget ? 'Your chosen limit' : 'Start step 2'} tone="orange" /><Summary title="Money left" value={remaining === null ? '-' : money(remaining)} note={remaining === null ? 'Set a budget first' : remaining >= 0 ? 'Within your budget' : 'Over your budget'} tone="green" /></section>
    <section className="start-here"><div className="start-copy"><span>START HERE</span><h2>Learn it in three easy steps</h2><p>You only need to enter what you spend.</p></div><div className="steps"><Step number="1" title="Add an expense" text="Example: Rs. 120 for lunch." action="Add expense" onClick={() => goTo('Expenses')} /><Step number="2" title="Choose a budget" text="Example: Rs. 5,000 for this month." action="Set budget" onClick={() => goTo('Budget')} /><Step number="3" title="Check your result" text="Come back here to see your progress." action="View dashboard" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} /></div></section>
    <section className="example-guide"><div><span className="example-label">A SIMPLE EXAMPLE</span><h2>How to add a Grocery expense</h2><p>If you buy milk and bread for ₹85, fill the form like this:</p></div><div className="example-row"><span className="food-icon">🛒</span><div><strong>What did you buy?</strong><span>Milk and bread</span></div><div><strong>Category</strong><span className="food-chip">Groceries</span></div><div><strong>Amount</strong><span className="amount-example">₹85</span></div><button className="example-action" onClick={() => goTo('Expenses')}>Add grocery</button></div><p className="example-note">Want to see how the dashboard works? <button className="inline-button" onClick={loadGroceryExamples}>Load sample groceries</button> (this replaces practice-mode entries).</p></section>
    <section className="category-guide"><div><h2>Choose the closest category</h2><p>Categories help you understand where your money goes.</p></div><div className="category-chips"><span>🛒 Groceries</span><span>🍛 Food</span><span>🚌 Transport</span><span>📚 Education</span><span>🎮 Entertainment</span><span>🛍️ Shopping</span></div></section>
    <section className="dashboard-grid"><article className="panel chart-panel"><div className="panel-heading"><div><h2>Where did my money go?</h2><p>{expenses.length ? 'Hover over a bar to see the exact amount in rupees.' : 'Add an expense or load sample groceries to see your graph.'}</p></div><span className="pill">By category</span></div><CategoryChart expenses={expenses} /></article><SmartCoach expenses={expenses} budget={budget} totalSpent={totalSpent} /></section>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Latest expenses</h2><p>The things you recently paid for appear here.</p></div><button className="text-button" onClick={() => goTo('Expenses')}>Add or view expenses</button></div>{expenses.length === 0 ? <div className="empty-state"><h3>No expenses yet</h3><p>Try adding one small expense. You can use a real example from today.</p><button className="secondary-button" onClick={() => goTo('Expenses')}>Add first expense</button></div> : <div className="transaction-list">{expenses.slice(0, 4).map((item) => <div className="transaction" key={item.id}><span className="transaction-icon">Rs</span><div><strong>{item.title}</strong><p>{item.category}</p></div><b>{money(item.amount)}</b></div>)}</div>}</section>
  </>;
}

function Step({ number, title, text, action, onClick }) { return <article><b>{number}</b><div><h3>{title}</h3><p>{text}</p><button onClick={onClick}>{action}</button></div></article>; }
function Summary({ title, value, note, tone }) { return <article className={`summary-card ${tone}`}><p>{title}</p><h2>{value}</h2><span>{note}</span></article>; }
function SmartCoach({ expenses, budget, totalSpent }) {
  const categoryTotals = expenses.reduce((totals, expense) => ({ ...totals, [expense.category]: (totals[expense.category] || 0) + expense.amount }), {});
  const largestCategory = Object.entries(categoryTotals).sort(([, first], [, second]) => second - first)[0];
  let insight = 'Add a few expenses and I will show a simple summary of your spending.';
  if (largestCategory) insight = `${largestCategory[0]} is your biggest category so far: ${money(largestCategory[1])}.`;
  if (budget && totalSpent >= Number(budget) * 0.9) insight = `You have used ${Math.round((totalSpent / Number(budget)) * 100)}% of your budget. Check optional spending before adding more.`;
  return <article className="panel insight-panel smart-coach"><span className="insight-icon">AI</span><p className="coach-label">SMART SPENDING COACH</p><h2>A simple money insight</h2><p>{insight}</p><span className="status">Rule-based, not financial advice</span></article>;
}
function CategoryChart({ expenses }) {
  const data = Object.entries(expenses.reduce((totals, expense) => ({ ...totals, [expense.category]: (totals[expense.category] || 0) + expense.amount }), {})).map(([category, amount]) => ({ category, amount }));
  const colors = ['#6d63d8', '#58b985', '#f5ad61', '#64a7e6', '#e97790', '#8d73d4'];
  if (!data.length) return <div className="chart-empty"><div className="chart-bars"><i /><i /><i /><i /><i /><i /></div><p>Your detailed graph will appear here.</p></div>;
  return <div className="real-chart"><ResponsiveContainer width="100%" height={255}><BarChart data={data} margin={{ top: 18, right: 6, left: -18, bottom: 2 }}><CartesianGrid vertical={false} stroke="#eeedf5" /><XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: '#78758d', fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#a19eae', fontSize: 11 }} tickFormatter={(value) => `₹${value}`} /><Tooltip cursor={{ fill: '#f5f4ff' }} formatter={(value) => [money(value), 'Spent']} labelFormatter={(label) => `${label} spending`} contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5f3', boxShadow: '0 8px 18px #302b5c18' }} /><Bar dataKey="amount" radius={[8, 8, 2, 2]} maxBarSize={64}>{data.map((item, index) => <Cell key={item.category} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer><p className="graph-caption">Each bar is one category. A taller bar means you spent more there.</p></div>;
}

function ExpenseManager({ expenses, onSave }) {
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState(''); const [category, setCategory] = useState('Food'); const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); if (!title.trim() || Number(amount) <= 0) { setError('Please enter what you bought and an amount greater than zero.'); return; } onSave({ title: title.trim(), amount: Number(amount), category }); }
  return <section className="workspace"><div className="guide-banner"><span>STEP 1 OF 3</span><h2>Add something you paid for</h2><p>One line is enough. For example: Lunch - ₹120.</p></div><div className="form-layout"><form className="panel expense-form" onSubmit={submit}><label>What did you buy?<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: College lunch" autoFocus /></label><label>How much did it cost? (₹)<input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0.01" step="0.01" placeholder="Example: 120" /></label><label>What type of expense?<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>{error && <p className="form-message">{error}</p>}<button className="primary-button">Save this expense</button><p className="demo-note">Practice mode: entries stay only until you refresh the page.</p></form><article className="panel help-card"><h2>What should I add?</h2><p>Anything you spend money on: snacks, travel, games, books, mobile recharge, or a gift.</p><p>Tip: choose <strong>Food</strong> for lunch, snacks, coffee, or dinner.</p><p>You do not need to enter income here - only expenses.</p></article></div>{expenses.length > 0 && <p className="saved-count">You added {expenses.length} expense{expenses.length === 1 ? '' : 's'} in this session.</p>}</section>;
}

function BudgetManager({ budget, setBudget, totalSpent }) { const [value, setValue] = useState(budget); const [saved, setSaved] = useState(false); function submit(event) { event.preventDefault(); if (Number(value) > 0) { setBudget(value); setSaved(true); } } return <section className="workspace"><div className="guide-banner"><span>STEP 2 OF 3</span><h2>Choose a monthly spending limit</h2><p>This is not a strict rule. It simply helps you notice your spending.</p></div><form className="panel budget-form" onSubmit={submit}><label>My monthly budget (Rs.)<input value={value} onChange={(event) => setValue(event.target.value)} type="number" min="1" placeholder="Example: 5000" /></label><button className="primary-button">Save my budget</button>{saved && <p className="success-message">Saved. You have {money(Number(value) - totalSpent)} left in this session.</p>}<p className="demo-note">Practice mode: the budget resets when you refresh.</p></form></section>; }
function Profile() { return <section className="panel coming-soon"><h2>Keep it simple for now</h2><p>Use the three-step guide: add an expense, set a budget, then return to the dashboard.</p></section>; }
function money(value) { return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0))}`; }
