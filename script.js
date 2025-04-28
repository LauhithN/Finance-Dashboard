// --- Mock Data ---
const expenses = [
  { category: 'Food', description: 'Groceries', amount: 120.50, date: '2024-06-01' },
  { category: 'Rent', description: 'June Rent', amount: 950, date: '2024-06-01' },
  { category: 'Utilities', description: 'Electricity', amount: 60, date: '2024-06-03' },
  { category: 'Entertainment', description: 'Movie', amount: 30, date: '2024-06-05' },
  { category: 'Transport', description: 'Bus Pass', amount: 45, date: '2024-06-02' },
  { category: 'Food', description: 'Dining Out', amount: 40, date: '2024-06-07' },
  { category: 'Utilities', description: 'Water', amount: 25, date: '2024-06-04' },
  { category: 'Other', description: 'Gift', amount: 50, date: '2024-06-06' },
];

const savingsGoals = [
  { name: 'Emergency Fund', target: 2000, saved: 1200 },
  { name: 'Vacation', target: 1500, saved: 600 },
  { name: 'New Laptop', target: 1200, saved: 900 },
];

const investmentHistory = [
  { date: '2024-05-01', value: 5000 },
  { date: '2024-05-10', value: 5100 },
  { date: '2024-05-20', value: 5200 },
  { date: '2024-06-01', value: 5400 },
  { date: '2024-06-10', value: 5600 },
  { date: '2024-06-15', value: 5550 },
  { date: '2024-06-20', value: 5700 },
];
const totalInvested = 5000;

const bills = [
  { name: 'Internet', due: '2024-06-12', status: 'Unpaid' },
  { name: 'Credit Card', due: '2024-06-10', status: 'Paid' },
  { name: 'Phone', due: '2024-06-15', status: 'Unpaid' },
  { name: 'Streaming', due: '2024-06-09', status: 'Unpaid' },
];

const budgets = [
  { category: 'Food', budgeted: 200 },
  { category: 'Rent', budgeted: 950 },
  { category: 'Utilities', budgeted: 100 },
  { category: 'Entertainment', budgeted: 80 },
  { category: 'Transport', budgeted: 60 },
  { category: 'Other', budgeted: 50 },
];

// --- Daily Transactions Data ---
const transactions = [
  { date: '2024-06-01', category: 'Income', description: 'Salary', amount: 3000 },
  { date: '2024-06-01', category: 'Rent', description: 'Monthly Rent', amount: -950 },
  { date: '2024-06-02', category: 'Food', description: 'Groceries', amount: -120.50 },
  { date: '2024-06-03', category: 'Utilities', description: 'Electricity Bill', amount: -60 },
  { date: '2024-06-04', category: 'Transport', description: 'Bus Pass', amount: -45 },
];

let currentSort = { field: 'date', ascending: true };
let currentFilter = 'all';

// --- Daily Transactions Functions ---
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function renderTransactions() {
  const tbody = document.querySelector('#transactions-table tbody');
  let filteredTransactions = transactions.filter(t => 
    currentFilter === 'all' || t.category === currentFilter
  );

  // Sort transactions
  filteredTransactions.sort((a, b) => {
    let aVal = a[currentSort.field];
    let bVal = b[currentSort.field];
    
    if (currentSort.field === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    return currentSort.ascending ? aVal - bVal : bVal - aVal;
  });

  tbody.innerHTML = filteredTransactions.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.category}</td>
      <td>${t.description}</td>
      <td class="${t.amount >= 0 ? 'amount-positive' : 'amount-negative'}">${formatAmount(t.amount)}</td>
    </tr>
  `).join('');

  // Update sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    const field = btn.dataset.sort;
    btn.classList.toggle('active', field === currentSort.field);
  });
}

// --- Transaction Form Handler ---
document.getElementById('transaction-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  
  const transaction = {
    date: data.get('date'),
    category: data.get('category'),
    description: data.get('description'),
    amount: parseFloat(data.get('amount')),
  };

  // Add to transactions array
  transactions.unshift(transaction);

  // If it's an expense (negative amount), add it to expenses array
  if (transaction.amount < 0) {
    expenses.push({
      category: transaction.category,
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      date: transaction.date
    });
  }

  // Reset form and update display
  form.reset();
  renderAll();
});

// --- Sort and Filter Handlers ---
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const field = btn.dataset.sort;
    if (currentSort.field === field) {
      currentSort.ascending = !currentSort.ascending;
    } else {
      currentSort = { field, ascending: true };
    }
    renderTransactions();
  });
});

document.getElementById('category-filter').addEventListener('change', (e) => {
  currentFilter = e.target.value;
  renderTransactions();
});

// --- Utility Functions ---
function groupExpensesByCategory(expenses) {
  const grouped = {};
  for (const exp of expenses) {
    if (!grouped[exp.category]) grouped[exp.category] = 0;
    grouped[exp.category] += exp.amount;
  }
  return grouped;
}

// --- Expense Chart (Pie) ---
function renderExpenseChart() {
  const grouped = groupExpensesByCategory(expenses);
  const categories = Object.keys(grouped);
  const values = Object.values(grouped);
  const total = values.reduce((a, b) => a + b, 0);
  const colors = ['#2d6cdf', '#6ec1e4', '#1ca97a', '#e23c3c', '#e6a700', '#a77ee6'];

  // Pie chart SVG
  let startAngle = 0;
  let svg = `<svg width="180" height="180" viewBox="0 0 180 180">`;
  values.forEach((val, i) => {
    const angle = (val / total) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;
    const r = 80, cx = 90, cy = 90;
    const x1 = cx + r * Math.cos((Math.PI / 180) * (startAngle - 90));
    const y1 = cy + r * Math.sin((Math.PI / 180) * (startAngle - 90));
    const x2 = cx + r * Math.cos((Math.PI / 180) * (endAngle - 90));
    const y2 = cy + r * Math.sin((Math.PI / 180) * (endAngle - 90));
    svg += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[i % colors.length]}" />`;
    startAngle += angle;
  });
  svg += '</svg>';
  // Legend
  svg += '<div style="display:flex;flex-direction:column;gap:0.3rem;margin-top:1rem;">';
  categories.forEach((cat, i) => {
    svg += `<span style="display:inline-flex;align-items:center;font-size:0.97rem;"><span style="display:inline-block;width:14px;height:14px;background:${colors[i % colors.length]};border-radius:3px;margin-right:7px;"></span>${cat}</span>`;
  });
  svg += '</div>';
  document.getElementById('expense-chart').innerHTML = svg;
}

// --- Expense Table ---
function renderExpenseTable() {
  const grouped = {};
  for (const exp of expenses) {
    if (!grouped[exp.category]) grouped[exp.category] = [];
    grouped[exp.category].push(exp);
  }
  let html = '<thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead><tbody>';
  for (const cat in grouped) {
    for (const exp of grouped[cat]) {
      html += `<tr><td>${exp.category}</td><td>${exp.description}</td><td>$${exp.amount.toFixed(2)}</td><td>${exp.date}</td></tr>`;
    }
  }
  html += '</tbody>';
  document.getElementById('expense-table').innerHTML = html;
}

// --- Savings Goals ---
function renderSavingsGoals() {
  let html = '';
  for (const goal of savingsGoals) {
    const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
    html += `<div class="savings-goal">
      <div class="savings-goal-title">${goal.name}</div>
      <div class="savings-goal-details">Saved: $${goal.saved} / $${goal.target} (${percent}%)</div>
      <div class="progress-bar-bg"><div class="progress-bar" style="width:0%" data-width="${percent}%"></div></div>
    </div>`;
  }
  document.getElementById('savings-goals').innerHTML = html;
  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.progress-bar').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width');
    });
  }, 100);
}

// --- Investment Chart (Line) ---
function renderInvestmentChart() {
  const w = 540, h = 180, pad = 40;
  const values = investmentHistory.map(d => d.value);
  const minVal = Math.min(...values), maxVal = Math.max(...values);
  const points = investmentHistory.map((d, i) => {
    const x = pad + (i * (w - 2 * pad)) / (investmentHistory.length - 1);
    const y = h - pad - ((d.value - minVal) * (h - 2 * pad)) / (maxVal - minVal || 1);
    return [x, y];
  });
  let svg = `<svg width="${w}" height="${h}">
    <polyline fill="none" stroke="#2d6cdf" stroke-width="3" points="${points.map(p => p.join(',')).join(' ')}" />`;
  // Dots
  points.forEach((p, i) => {
    svg += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#6ec1e4" />`;
  });
  // X axis labels
  investmentHistory.forEach((d, i) => {
    svg += `<text x="${points[i][0]}" y="${h - 10}" font-size="12" text-anchor="middle" fill="#888">${d.date.slice(5)}</text>`;
  });
  // Y axis min/max
  svg += `<text x="5" y="${h - pad}" font-size="12" fill="#888">$${minVal}</text>`;
  svg += `<text x="5" y="${pad}" font-size="12" fill="#888">$${maxVal}</text>`;
  svg += '</svg>';
  document.getElementById('investment-chart').innerHTML = svg;

  // Metrics
  const currentValue = values[values.length - 1];
  const profit = currentValue - totalInvested;
  let metrics = `<div class="metric">Total Invested<br>$${totalInvested}</div>`;
  metrics += `<div class="metric">Current Value<br>$${currentValue}</div>`;
  metrics += `<div class="metric">Profit/Loss<br><span style="color:${profit >= 0 ? '#1ca97a' : '#e23c3c'}">$${profit}</span></div>`;
  document.getElementById('investment-metrics').innerHTML = metrics;
}

// --- Bills Table ---
function renderBillsTable() {
  const today = new Date();
  let html = '<thead><tr><th>Bill</th><th>Due Date</th><th>Status</th></tr></thead><tbody>';
  for (const bill of bills) {
    const dueDate = new Date(bill.due);
    let statusClass = bill.status.toLowerCase();
    if (bill.status === 'Unpaid') {
      const diff = (dueDate - today) / (1000 * 60 * 60 * 24);
      if (diff <= 3 && diff >= 0) statusClass = 'due-soon';
    }
    html += `<tr><td>${bill.name}</td><td>${bill.due}</td><td><span class="bill-status ${statusClass}">${bill.status}</span></td></tr>`;
  }
  html += '</tbody>';
  document.getElementById('bills-table').innerHTML = html;
}

// --- Budget Metrics ---
function renderBudgetMetrics() {
  const grouped = groupExpensesByCategory(expenses);
  let html = '<table class="styled-table"><thead><tr><th>Category</th><th>Budgeted</th><th>Actual</th><th>Status</th></tr></thead><tbody>';
  for (const b of budgets) {
    const actual = grouped[b.category] || 0;
    const under = actual <= b.budgeted;
    html += `<tr><td>${b.category}</td><td>$${b.budgeted}</td><td>$${actual.toFixed(2)}</td><td><div class="budget-bar-bg"><div class="budget-bar ${under ? 'under' : 'over'}" style="width:0%" data-width="${Math.min(100, Math.round((actual / b.budgeted) * 100))}%"></div></div></td></tr>`;
  }
  html += '</tbody></table>';
  document.getElementById('budget-metrics').innerHTML = html;
  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.budget-bar').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width');
    });
  }, 100);
}

// --- Add Expense Modal Logic ---
const addBtn = document.getElementById('add-expense-btn');
const modal = document.getElementById('add-expense-modal');
const closeBtn = document.querySelector('.close-btn');
const form = document.getElementById('add-expense-form');

addBtn.onclick = () => { modal.classList.remove('hidden'); };
closeBtn.onclick = () => { modal.classList.add('hidden'); };
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

form.onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData(form);
  expenses.push({
    category: data.get('category'),
    description: data.get('description'),
    amount: parseFloat(data.get('amount')),
    date: data.get('date'),
  });
  modal.classList.add('hidden');
  form.reset();
  renderAll();
};

// --- Render All Sections ---
function renderAll() {
  renderExpenseChart();
  renderExpenseTable();
  renderTransactions();
  renderSavingsGoals();
  renderInvestmentChart();
  renderBillsTable();
  renderBudgetMetrics();
}

document.addEventListener('DOMContentLoaded', renderAll); 