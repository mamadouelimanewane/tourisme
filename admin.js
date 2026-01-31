const ADMIN_CODE = "DAKAR2026";
let pendingLocations = JSON.parse(localStorage.getItem('senegaltourisme_pending')) || [];
let approvedLocations = JSON.parse(localStorage.getItem('senegaltourisme_locations')) || [];

// Dashboard Data
const categories = [
    { id: 'hotels', label: 'Hôtels & Resorts', color: '#FF5A5F', icon: '🏨' },
    { id: 'auberges', label: 'Auberges', color: '#f39c12', icon: '🏠' },
    { id: 'sites', label: 'Sites Historiques', color: '#484848', icon: '🏛️' },
    { id: 'nature', label: 'Parcs & Réserves', color: '#2ECC71', icon: '🌳' },
    { id: 'plages', label: 'Plages', color: '#3498DB', icon: '🏖️' },
    { id: 'restaurants', label: 'Gastronomie', color: '#E74C3C', icon: '🍽️' },
    { id: 'culture', label: 'Musées & Culture', color: '#FF8C00', icon: '🎭' },
    { id: 'artisanat', label: 'Artisanat & Marchés', color: '#9B59B6', icon: '🛍️' },
    { id: 'loisirs', label: 'Loisirs & Sport', color: '#F1C40F', icon: '🏄' },
    { id: 'monuments', label: 'Monuments', color: '#7F8C8D', icon: '🗿' },
    { id: 'excursions', label: 'Excursions', color: '#1ABC9C', icon: '🚐' }
];

const regions = [
    { id: 'dakar', label: 'Dakar & Environs' },
    { id: 'petite-cote', label: 'Petite Côte (Saly/Mbour)' },
    { id: 'saint-louis', label: 'Saint-Louis & Nord' },
    { id: 'casamance', label: 'Ziguinchor & Casamance' },
    { id: 'sine-saloum', label: 'Sine-Saloum (Fatick)' },
    { id: 'senegal-oriental', label: 'Sénégal Oriental' },
    { id: 'lac-rose', label: 'Lac Rose / Lompoul' }
];

let adminSearchTerm = '';

document.getElementById('adminLoginForm').onsubmit = handleAdminLogin;

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_CODE) {
        document.getElementById('loginWall').style.display = 'none';
        document.getElementById('adminLayout').style.display = 'block';
        initAdmin();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function initAdmin() {
    renderAll();
    setupAdminListeners();
}

function setupAdminListeners() {
    document.getElementById('adminSearch').oninput = (e) => {
        adminSearchTerm = e.target.value.toLowerCase();
        renderApproved();
    };

    document.getElementById('editLocationForm').onsubmit = (e) => {
        e.preventDefault();
        saveEdit();
    };
}

function renderAll() {
    updateStats();
    renderPending();
    renderApproved();
    renderCharts();
}

function updateStats() {
    document.getElementById('statTotalLocations').textContent = approvedLocations.length;
    document.getElementById('statPendingLocations').textContent = pendingLocations.length;
    document.getElementById('pendingCountBadge').textContent = pendingLocations.length;
    document.getElementById('pendingCount').textContent = pendingLocations.length;

    const highRated = approvedLocations.filter(loc => loc.stars >= 4).length;
    document.getElementById('statHighRated').textContent = highRated;

    const uniqueRegions = new Set(approvedLocations.map(loc => loc.region)).size;
    document.getElementById('statRegionsCount').textContent = uniqueRegions;
}

function renderPending() {
    const list = document.getElementById('pendingList');
    list.innerHTML = '';

    if (pendingLocations.length === 0) {
        list.innerHTML = '<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-dim); background: var(--bg-card); border-radius: 20px; border: 1px dashed var(--border);">Aucune suggestion en attente.</div>';
    }

    pendingLocations.forEach(loc => {
        const card = createAdminCard(loc, true);
        list.appendChild(card);
    });
}

function renderApproved() {
    const list = document.getElementById('approvedList');
    list.innerHTML = '';

    const filtered = approvedLocations.filter(loc =>
        loc.title.toLowerCase().includes(adminSearchTerm) ||
        loc.venue.toLowerCase().includes(adminSearchTerm)
    );

    filtered.forEach(loc => {
        const card = createAdminCard(loc, false);
        list.appendChild(card);
    });
}

function createAdminCard(loc, isPending) {
    const card = document.createElement('div');
    card.className = 'event-card';
    const bgStyle = loc.image ? `url('${loc.image}')` : `linear-gradient(135deg, #333, #111)`;

    card.innerHTML = `
        <div class="card-img" style="background-image: ${bgStyle}; background-size: cover; height: 150px;">
            <span class="card-badge" style="background: ${isPending ? '#F1C40F' : '#2ECC71'}">${isPending ? 'En attente' : 'En ligne'}</span>
        </div>
        <div class="card-info">
            ${loc.stars > 0 ? `<div style="color: #f1c40f; font-size: 0.8rem; margin-bottom: 5px;">${"⭐".repeat(loc.stars)}</div>` : ''}
            <h3 class="card-title">${loc.title}</h3>
            <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 0.5rem;">📍 ${loc.venue}</p>
            ${loc.phone ? `<p style="color: var(--primary); font-size: 0.85rem; font-weight:700;">📞 ${loc.phone}</p>` : ''}
            ${loc.price ? `<p style="color: #2ECC71; font-size: 0.9rem; font-weight:800; margin-bottom:1rem;">🏷️ ${loc.price}</p>` : ''}
            
            ${loc.gallery && loc.gallery.length > 0 ? `
                <div style="display:flex; gap:5px; margin-bottom:15px; overflow-x:auto;">
                    ${loc.gallery.map(img => `<img src="${img}" style="width:50px; height:40px; object-fit:cover; border-radius:4px;">`).join('')}
                </div>
            ` : ''}

            ${isPending && loc.submittedBy ? `
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; margin-bottom: 15px;">
                    <p style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; font-weight: 800;">Soumis par :</p>
                    <p style="font-weight: 600; font-size: 0.9rem;">${loc.submittedBy.name}</p>
                    <p style="color: #94A3B8; font-size: 0.85rem;">📞 ${loc.submittedBy.phone}</p>
                </div>
            ` : ''}

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${isPending ? `
                    <button onclick="approveLocation(${loc.id})" class="btn-primary" style="flex: 2; padding: 10px; font-size: 0.85rem;">Approuver</button>
                    <button onclick="rejectLocation(${loc.id})" class="action-btn" style="flex: 1; padding: 10px; font-size: 0.85rem; color: #E74C3C;">Refuser</button>
                ` : `
                    <button onclick="openEdit(${loc.id})" class="action-btn" style="flex: 1; border-color: var(--primary); color: var(--primary);">Modifier</button>
                    <button onclick="deleteLocation(${loc.id})" class="action-btn" style="flex: 1; border-color: #E74C3C; color: #E74C3C;">Supprimer</button>
                `}
            </div>
        </div>
    `;
    return card;
}

function renderCharts() {
    const regionChart = document.getElementById('regionChart');
    const categoryChart = document.getElementById('categoryChart');

    // Stats per region
    const regStats = regions.map(r => ({
        label: r.label,
        count: approvedLocations.filter(l => l.region === r.id).length
    })).sort((a, b) => b.count - a.count);

    regionChart.innerHTML = regStats.map(s => `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 120px; font-size: 0.8rem; color: var(--text-dim);">${s.label}</div>
            <div style="flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                <div style="width: ${approvedLocations.length > 0 ? (s.count / approvedLocations.length * 100) : 0}%; height: 100%; background: var(--primary);"></div>
            </div>
            <div style="width: 30px; font-weight: 700; text-align: right;">${s.count}</div>
        </div>
    `).join('');

    // Stats per category
    const catStats = categories.map(c => ({
        label: c.label,
        color: c.color,
        count: approvedLocations.filter(l => l.category === c.id).length
    })).sort((a, b) => b.count - a.count);

    categoryChart.innerHTML = catStats.map(s => `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 120px; font-size: 0.8rem; color: var(--text-dim);">${s.label}</div>
            <div style="flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                <div style="width: ${approvedLocations.length > 0 ? (s.count / approvedLocations.length * 100) : 0}%; height: 100%; background: ${s.color};"></div>
            </div>
            <div style="width: 30px; font-weight: 700; text-align: right;">${s.count}</div>
        </div>
    `).join('');
}

function approveLocation(id) {
    const loc = pendingLocations.find(l => l.id === id);
    if (loc) {
        loc.status = 'approved';
        approvedLocations.unshift(loc);
        pendingLocations = pendingLocations.filter(l => l.id !== id);
        saveData();
        renderAll();
        alert("Lieu approuvé !");
    }
}

function rejectLocation(id) {
    if (confirm("Refuser cette suggestion ?")) {
        pendingLocations = pendingLocations.filter(l => l.id !== id);
        saveData();
        renderAll();
    }
}

function deleteLocation(id) {
    if (confirm("Supprimer ce lieu du site ?")) {
        approvedLocations = approvedLocations.filter(l => l.id !== id);
        saveData();
        renderAll();
    }
}

function openEdit(id) {
    const loc = approvedLocations.find(l => l.id === id);
    if (!loc) return;

    document.getElementById('editId').value = loc.id;
    document.getElementById('editTitle').value = loc.title;
    document.getElementById('editPrice').value = loc.price || '';
    document.getElementById('editPhone').value = loc.phone || '';
    document.getElementById('editStars').value = loc.stars || 0;
    document.getElementById('editVenue').value = loc.venue;

    document.getElementById('editLocationModal').style.display = 'flex';
}

function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const locIndex = approvedLocations.findIndex(l => l.id === id);
    if (locIndex === -1) return;

    approvedLocations[locIndex].title = document.getElementById('editTitle').value;
    approvedLocations[locIndex].price = document.getElementById('editPrice').value;
    approvedLocations[locIndex].phone = document.getElementById('editPhone').value;
    approvedLocations[locIndex].stars = parseInt(document.getElementById('editStars').value);
    approvedLocations[locIndex].venue = document.getElementById('editVenue').value;

    saveData();
    renderAll();
    closeModal('editLocationModal');
    alert("Modifications enregistrées !");
}

function saveData() {
    localStorage.setItem('senegaltourisme_locations', JSON.stringify(approvedLocations));
    localStorage.setItem('senegaltourisme_pending', JSON.stringify(pendingLocations));
}

function switchTab(tab, btn) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('sectionDashboard').style.display = tab === 'dashboard' ? 'block' : 'none';
    document.getElementById('sectionPending').style.display = tab === 'pending' ? 'block' : 'none';
    document.getElementById('sectionApproved').style.display = tab === 'approved' ? 'block' : 'none';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

window.switchTab = switchTab;
window.approveLocation = approveLocation;
window.rejectLocation = rejectLocation;
window.deleteLocation = deleteLocation;
window.openEdit = openEdit;
window.closeModal = closeModal;
