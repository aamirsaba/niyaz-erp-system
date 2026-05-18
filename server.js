const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Demo data for companies
const companies = [
    { id: 1, name: 'Niyaz International LLC', vat: 'OM1234567', logo: 'niyaz_logo.png' },
    { id: 2, name: 'Niyaz Facilities Management', vat: 'OM2345678', logo: 'niyaz_logo.png' },
    { id: 3, name: 'Niyaz Technical Services', vat: 'OM3456789', logo: 'niyaz_logo.png' }
];

// Demo dashboard stats per company
const stats = {
    1: { workers: 45, projects: 12, clients: 28, revenue: 125000, vatDue: 6250 },
    2: { workers: 28, projects: 8, clients: 15, revenue: 78000, vatDue: 3900 },
    3: { workers: 19, projects: 5, clients: 10, revenue: 45000, vatDue: 2250 }
};

// Demo alerts
const alerts = [
    { id: 1, type: 'warning', message: 'Contract renewal for Al Mouj Tower due in 5 days', date: '2026-05-23' },
    { id: 2, type: 'info', message: 'VAT return filing deadline: June 10', date: '2026-06-10' },
    { id: 3, type: 'success', message: 'Project "Mall Cleaning" completed on time', date: '2026-05-17' },
    { id: 4, type: 'danger', message: 'Worker Ahmed absent for 3 days', date: '2026-05-18' }
];

app.get('/api/companies', (req, res) => res.json(companies));
app.get('/api/stats/:companyId', (req, res) => res.json(stats[req.params.companyId] || stats[1]));
app.get('/api/alerts', (req, res) => res.json(alerts));

app.listen(port, () => {
    console.log(`Niyaz ERP Full running at http://localhost:${port}`);
});