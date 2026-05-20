const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Secret key for JWT
const JWT_SECRET = 'niyaz-erp-secret-key-2026';

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// User database
const users = [
    { id: 1, email: 'admin@niyaz.com', password: 'admin123', name: 'Admin User', role: 'admin', companyAccess: 'all' },
    { id: 2, email: 'hr@niyaz.com', password: 'hr123', name: 'HR Manager', role: 'hr_manager', companyAccess: '1' },
    { id: 3, email: 'finance@niyaz.com', password: 'finance123', name: 'Finance Manager', role: 'finance_manager', companyAccess: 'all' },
    { id: 4, email: 'project@niyaz.com', password: 'project123', name: 'Project Manager', role: 'project_manager', companyAccess: '2' },
    { id: 5, email: 'supervisor@niyaz.com', password: 'super123', name: 'Site Supervisor', role: 'supervisor', companyAccess: '1' },
    { id: 6, email: 'employee@niyaz.com', password: 'emp123', name: 'Employee', role: 'employee', companyAccess: '1' }
];

// Role-based menu access
const roleMenus = {
    admin: ['index', 'company', 'users', 'hr', 'accounting', 'projects', 'crm', 'reports', 'alerts'],
    hr_manager: ['index', 'hr', 'reports', 'alerts'],
    finance_manager: ['index', 'accounting', 'reports', 'alerts'],
    project_manager: ['index', 'projects', 'reports', 'alerts'],
    supervisor: ['index', 'hr', 'reports', 'alerts'],
    employee: ['index', 'alerts'],
    client_viewer: ['index', 'projects']
};

// ========== LOGIN API ==========
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log('📧 Login attempt:', email);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role, companyAccess: user.companyAccess },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        
        console.log('✅ Login successful:', user.email, 'Role:', user.role);
        res.json({ 
            success: true, 
            token: token,
            user: { name: user.name, role: user.role, email: user.email }
        });
    } else {
        console.log('❌ Login failed for:', email);
        res.json({ success: false, message: 'Invalid email or password' });
    }
});

// ========== VERIFY TOKEN API ==========
app.get('/api/verify', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.json({ valid: false });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ valid: false });
        }
        res.json({ valid: true, user: decoded });
    });
});

// ========== USER MENU API ==========
app.get('/api/user-menu', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.json({ menus: [], loggedIn: false });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ menus: [], loggedIn: false });
        }
        const menus = roleMenus[decoded.role] || roleMenus.employee;
        res.json({ menus, role: decoded.role, name: decoded.name, loggedIn: true });
    });
});

// ========== COMPANY DATA ==========
const companiesData = {
    1: {
        workers: 45, projects: 12, clients: 28, revenue: 125000, vatDue: 6250,
        employees: [
            { id: 1, name: 'Ahmed Al Balushi', position: 'HVAC Supervisor', basic: 850, housing: 200, transport: 100, phone: '91234567', whatsapp: '+96891234567', site: 'Al Mouj Tower', status: 'Active' },
            { id: 2, name: 'Salim Al Hinai', position: 'Cleaning Manager', basic: 750, housing: 150, transport: 80, phone: '92345678', whatsapp: '+96892345678', site: 'City Centre Mall', status: 'Active' }
        ],
        alerts: [
            { id: 1, type: 'warning', message: 'Contract renewal for Al Mouj Tower due in 5 days', date: '2026-05-23' },
            { id: 2, type: 'info', message: 'VAT return filing deadline: June 10', date: '2026-06-10' }
        ]
    },
    2: {
        workers: 28, projects: 8, clients: 15, revenue: 78000, vatDue: 3900,
        employees: [
            { id: 1, name: 'Mohammed Al Riyami', position: 'MEP Technician', basic: 650, housing: 120, transport: 70, phone: '93456789', whatsapp: '+96893456789', site: 'Industrial Area', status: 'Active' }
        ],
        alerts: [
            { id: 1, type: 'warning', message: 'Equipment maintenance due next week', date: '2026-05-25' }
        ]
    },
    3: {
        workers: 19, projects: 5, clients: 10, revenue: 45000, vatDue: 2250,
        employees: [
            { id: 1, name: 'Rashid Al Saadi', position: 'Security Guard', basic: 450, housing: 80, transport: 50, phone: '94567890', whatsapp: '+96894567890', site: 'Airport', status: 'Active' }
        ],
        alerts: [
            { id: 1, type: 'success', message: 'New security contract signed', date: '2026-05-20' }
        ]
    }
};

// API endpoints
app.get('/api/companies', (req, res) => {
    res.json([
        { id: 1, name: 'Niyaz International LLC', vat: 'OM1234567' },
        { id: 2, name: 'Niyaz Facilities Management', vat: 'OM2345678' },
        { id: 3, name: 'Niyaz Technical Services', vat: 'OM3456789' }
    ]);
});

app.get('/api/stats/:companyId', (req, res) => {
    const companyId = req.params.companyId;
    const data = companiesData[companyId] || companiesData[1];
    res.json({
        workers: data.workers,
        projects: data.projects,
        clients: data.clients,
        revenue: data.revenue,
        vatDue: data.vatDue
    });
});

app.get('/api/alerts/:companyId', (req, res) => {
    const companyId = req.params.companyId;
    const data = companiesData[companyId] || companiesData[1];
    res.json(data.alerts);
});

app.get('/api/employees/:companyId', (req, res) => {
    const companyId = req.params.companyId;
    const data = companiesData[companyId] || companiesData[1];
    res.json(data.employees);
});

// Serve pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Niyaz ERP running at http://localhost:${port}`);
    console.log(`📧 Login: admin@niyaz.com / admin123`);
});