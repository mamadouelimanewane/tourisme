const ADMIN_CODE = "DAKAR2026";
let pendingLocations = JSON.parse(localStorage.getItem('senegaltourisme_pending')) || [];
let approvedLocations = JSON.parse(localStorage.getItem('senegaltourisme_locations')) || [];

document.getElementById('adminLoginForm').onsubmit = handleAdminLogin;

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_CODE) {
        document.getElementById('loginWall').style.display = 'none';
        document.getElementById('adminLayout').style.display = 'block';
        renderAll();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function renderAll() {
    renderPending();
    renderApproved();
}

function renderPending() {
    const list = document.getElementById('pendingList');
    document.getElementById('pendingCount').textContent = pendingLocations.length;
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
    approvedLocations.forEach(loc => {
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

            <div style="display: flex; gap: 10px;">
                ${isPending ? `
                    <button onclick="approveLocation(${loc.id})" class="btn-primary" style="flex: 2; padding: 10px; font-size: 0.85rem;">Approuver</button>
                    <button onclick="rejectLocation(${loc.id})" class="action-btn" style="flex: 1; padding: 10px; font-size: 0.85rem; color: #E74C3C;">Refuser</button>
                ` : `
                    <button onclick="deleteLocation(${loc.id})" class="action-btn" style="width: 100%; border-color: #E74C3C; color: #E74C3C;">Supprimer</button>
                `}
            </div>
        </div>
    `;
    return card;
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

function saveData() {
    localStorage.setItem('senegaltourisme_locations', JSON.stringify(approvedLocations));
    localStorage.setItem('senegaltourisme_pending', JSON.stringify(pendingLocations));
}

function switchTab(tab, btn) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('sectionPending').style.display = tab === 'pending' ? 'block' : 'none';
    document.getElementById('sectionApproved').style.display = tab === 'approved' ? 'block' : 'none';
}

window.switchTab = switchTab;
window.approveLocation = approveLocation;
window.rejectLocation = rejectLocation;
window.deleteLocation = deleteLocation;
