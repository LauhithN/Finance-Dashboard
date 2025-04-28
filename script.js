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

// --- Modal Management ---
function setupModal(modalId) {
  const modal = document.getElementById(modalId);
  const closeBtn = modal.querySelector('.close-btn');
  
  closeBtn.onclick = () => {
    hideModal(modal);
  };
  
  window.onclick = (e) => {
    if (e.target === modal) {
      hideModal(modal);
    }
  };
  
  return modal;
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('hidden');
  // Trigger reflow for animation
  void modal.offsetWidth;
  modal.classList.add('fade-in');
}

function hideModal(modal) {
  modal.classList.remove('fade-in');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

function showSuccessAlert(message) {
  const alert = document.getElementById('success-alert');
  const alertMessage = alert.querySelector('.alert-message');
  alertMessage.textContent = message;
  alert.classList.remove('hidden');
  void alert.offsetWidth; // Trigger reflow
  alert.classList.add('fade-in');
  
  setTimeout(() => {
    alert.classList.remove('fade-in');
    setTimeout(() => {
      alert.classList.add('hidden');
    }, 300);
  }, 2000);
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

// --- Savings Goals Updates ---
function renderSavingsGoals() {
  let html = '';
  savingsGoals.forEach((goal, index) => {
    const percent = Math.min(100, Math.round((goal.saved / goal.target) * 100));
    html += `
      <div class="savings-goal" data-index="${index}">
        <div class="savings-goal-title">
          ${goal.name}
          <button class="update-btn" data-action="update-savings" data-index="${index}">Update</button>
        </div>
        <div class="savings-goal-details">Saved: $${goal.saved.toFixed(2)} / $${goal.target.toFixed(2)} (${percent}%)</div>
        <div class="progress-bar-bg">
          <div class="progress-bar" style="width:0%" data-width="${percent}%"></div>
        </div>
      </div>`;
  });
  
  const container = document.getElementById('savings-goals');
  container.innerHTML = html;
  
  // Attach event listeners to new buttons
  container.querySelectorAll('.update-btn[data-action="update-savings"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      openSavingsModal(index);
    });
  });
  
  // Animate progress bars
  setTimeout(() => {
    container.querySelectorAll('.progress-bar').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width');
    });
  }, 100);
}

function openSavingsModal(index = -1) {
  const modal = document.getElementById('savings-modal');
  const form = document.getElementById('savings-form');
  const deleteBtn = form.querySelector('.delete-btn');
  
  if (index >= 0) {
    const goal = savingsGoals[index];
    form.goalIndex.value = index;
    form.name.value = goal.name;
    form.target.value = goal.target;
    form.saved.value = goal.saved;
    deleteBtn.classList.remove('hidden');
  } else {
    form.reset();
    form.goalIndex.value = '';
    deleteBtn.classList.add('hidden');
  }
  
  showModal('savings-modal');
}

document.getElementById('savings-form').onsubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    target: parseFloat(form.target.value),
    saved: parseFloat(form.saved.value)
  };
  
  const index = form.goalIndex.value;
  if (index === '') {
    savingsGoals.push(data);
  } else {
    savingsGoals[parseInt(index)] = data;
  }
  
  hideModal(document.getElementById('savings-modal'));
  renderSavingsGoals();
  showSuccessAlert('Savings goal updated successfully!');
};

document.querySelector('#savings-form .delete-btn').onclick = (e) => {
  const index = document.getElementById('savings-form').goalIndex.value;
  if (index !== '') {
    savingsGoals.splice(parseInt(index), 1);
    hideModal(document.getElementById('savings-modal'));
    renderSavingsGoals();
    showSuccessAlert('Savings goal deleted successfully!');
  }
};

// --- Investment Updates ---
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

  // Add update button event listener
  document.getElementById('update-investment-btn').addEventListener('click', openInvestmentModal);
}

function openInvestmentModal() {
  const modal = document.getElementById('investment-modal');
  const form = document.getElementById('investment-form');
  const lastValue = investmentHistory[investmentHistory.length - 1].value;
  
  form.currentValue.value = lastValue;
  form.totalInvested.value = totalInvested;
  
  showModal('investment-modal');
}

// Add investment form submit handler
document.getElementById('investment-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const newValue = parseFloat(form.currentValue.value);
  const newTotalInvested = parseFloat(form.totalInvested.value);
  
  // Update investment history
  const today = new Date().toISOString().split('T')[0];
  investmentHistory.push({ date: today, value: newValue });
  
  // Update total invested
  window.totalInvested = newTotalInvested;
  
  hideModal(document.getElementById('investment-modal'));
  renderInvestmentChart();
  showSuccessAlert('Investment updated successfully!');
});

// --- Bills Updates ---
function renderBillsTable() {
  const today = new Date();
  let html = '<thead><tr><th>Bill</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
  
  bills.forEach((bill, index) => {
    const dueDate = new Date(bill.due);
    let statusClass = bill.status.toLowerCase();
    if (bill.status === 'Unpaid') {
      const diff = (dueDate - today) / (1000 * 60 * 60 * 24);
      if (diff <= 3 && diff >= 0) statusClass = 'due-soon';
    }
    
    html += `
      <tr class="${bill.status === 'Paid' ? 'bill-row-paid' : ''}" data-index="${index}">
        <td>${bill.name}</td>
        <td>${bill.due}</td>
        <td><span class="bill-status ${statusClass}">${bill.status}</span></td>
        <td>
          ${bill.status === 'Unpaid' ? 
            `<button class="mark-paid-btn" data-action="mark-paid" data-index="${index}">Mark Paid</button>` :
            ''
          }
          <button class="update-btn" data-action="update-bill" data-index="${index}">Edit</button>
        </td>
      </tr>`;
  });
  
  html += '</tbody>';
  const table = document.getElementById('bills-table');
  table.innerHTML = html;
  
  // Attach event listeners to new buttons
  table.querySelectorAll('.mark-paid-btn[data-action="mark-paid"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      markBillPaid(index);
    });
  });
  
  table.querySelectorAll('.update-btn[data-action="update-bill"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      openBillModal(index);
    });
  });
}

function markBillPaid(index) {
  bills[index].status = 'Paid';
  const row = document.querySelector(`#bills-table tr[data-index="${index}"]`);
  row.classList.add('highlight-row');
  renderBillsTable();
  showSuccessAlert('Bill marked as paid!');
}

function openBillModal(index = -1) {
  const modal = document.getElementById('bill-modal');
  const form = document.getElementById('bill-form');
  const deleteBtn = form.querySelector('.delete-btn');
  
  if (index >= 0) {
    const bill = bills[index];
    form.billIndex.value = index;
    form.name.value = bill.name;
    form.due.value = bill.due;
    form.status.value = bill.status;
    deleteBtn.classList.remove('hidden');
  } else {
    form.reset();
    form.billIndex.value = '';
    deleteBtn.classList.add('hidden');
  }
  
  showModal('bill-modal');
}

document.getElementById('bill-form').onsubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    due: form.due.value,
    status: form.status.value
  };
  
  const index = form.billIndex.value;
  if (index === '') {
    bills.push(data);
  } else {
    bills[parseInt(index)] = data;
  }
  
  hideModal(document.getElementById('bill-modal'));
  renderBillsTable();
  showSuccessAlert('Bill updated successfully!');
};

document.querySelector('#bill-form .delete-btn').onclick = (e) => {
  const index = document.getElementById('bill-form').billIndex.value;
  if (index !== '') {
    bills.splice(parseInt(index), 1);
    hideModal(document.getElementById('bill-modal'));
    renderBillsTable();
    showSuccessAlert('Bill deleted successfully!');
  }
};

// --- Budget Updates ---
function renderBudgetMetrics() {
  const grouped = groupExpensesByCategory(expenses);
  let html = '<table class="styled-table"><thead><tr><th>Category</th><th>Budgeted</th><th>Actual</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
  
  budgets.forEach((b, index) => {
    const actual = grouped[b.category] || 0;
    const under = actual <= b.budgeted;
    const percent = Math.min(100, Math.round((actual / b.budgeted) * 100));
    
    html += `
      <tr data-index="${index}">
        <td>${b.category}</td>
        <td>$${b.budgeted.toFixed(2)}</td>
        <td>$${actual.toFixed(2)}</td>
        <td>
          <div class="budget-bar-bg">
            <div class="budget-bar ${under ? 'under' : 'over'}" style="width:0%" data-width="${percent}%"></div>
          </div>
        </td>
        <td>
          <button class="update-btn" data-action="update-budget" data-index="${index}">Update</button>
        </td>
      </tr>`;
  });
  
  html += '</tbody></table>';
  const container = document.getElementById('budget-metrics');
  container.innerHTML = html;
  
  // Attach event listeners to new buttons
  container.querySelectorAll('.update-btn[data-action="update-budget"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      openBudgetModal(index);
    });
  });
  
  // Animate bars
  setTimeout(() => {
    container.querySelectorAll('.budget-bar').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width');
    });
  }, 100);
}

function openBudgetModal(index) {
  const modal = document.getElementById('budget-modal');
  const form = document.getElementById('budget-form');
  const budget = budgets[index];
  
  form.budgeted.value = budget.budgeted;
  form.dataset.index = index;
  form.category.value = budget.category;
  
  showModal('budget-modal');
}

document.getElementById('budget-form').onsubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  const index = parseInt(form.dataset.index);
  const budgeted = parseFloat(form.budgeted.value);
  
  budgets[index].budgeted = budgeted;
  
  hideModal(document.getElementById('budget-modal'));
  renderBudgetMetrics();
  showSuccessAlert('Budget updated successfully!');
};

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  // Setup all modals
  setupModal('savings-modal');
  setupModal('investment-modal');
  setupModal('bill-modal');
  setupModal('budget-modal');
  
  // Add new item button handlers
  document.getElementById('add-savings-goal-btn')?.addEventListener('click', () => openSavingsModal());
  document.getElementById('add-bill-btn')?.addEventListener('click', () => openBillModal());
  
  // Add update button handlers
  document.getElementById('update-investment-btn')?.addEventListener('click', openInvestmentModal);
  
  // Initial render
  renderAll();
});

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