// ===================================
// CONFIGURATION DES DONNÉES TOURISME
// ===================================
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
    { id: 'dakar', label: 'Dakar & Environs', lat: 14.71, lng: -17.44 },
    { id: 'petite-cote', label: 'Petite Côte (Saly/Mbour)', lat: 14.41, lng: -16.96 },
    { id: 'saint-louis', label: 'Saint-Louis & Nord', lat: 16.02, lng: -16.50 },
    { id: 'casamance', label: 'Ziguinchor & Casamance', lat: 12.58, lng: -16.27 },
    { id: 'sine-saloum', label: 'Sine-Saloum (Fatick)', lat: 14.13, lng: -16.43 },
    { id: 'senegal-oriental', label: 'Sénégal Oriental', lat: 13.77, lng: -13.67 },
    { id: 'lac-rose', label: 'Lac Rose / Lompoul', lat: 14.83, lng: -17.00 }
];

// ===================================
// ÉTAT GLOBAL
// ===================================
let tourismData = JSON.parse(localStorage.getItem('senegaltourisme_locations')) || [];
let map = null;
let markers = [];
let userLocation = null;
let currentUser = JSON.parse(localStorage.getItem('senegaltourisme_user')) || null;

let activeFilters = {
    category: null,
    region: null,
    search: '',
    mapCategories: new Set(categories.map(c => c.id)) // Toutes les catégories par défaut
};
let currentView = 'map';

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Force refresh sample data to include new images and fix locations
    if (!localStorage.getItem('tourisme_v3')) {
        localStorage.removeItem('senegaltourisme_locations');
        localStorage.setItem('tourisme_v3', 'true');
        tourismData = [];
    }
    generateSampleData();
    initUI();
    setupMapLegend();
    renderLocations();
    setupEventListeners();

    const mapBtn = document.getElementById('btnMap');
    if (mapBtn) mapBtn.click(); // Force l'état initial coloré et affiche la carte
});

function generateSampleData() {
    if (tourismData.length > 0) return;

    const names = {
        hotels: ["King Fahd Palace", "Terrou-Bi Resort", "Lamantin Beach Resort", "Royal Decameron Baobab", "Hôtel de la Poste Saint-Louis", "Ecolodge de Simal", "Esperanto Lodge Kafountine"],
        auberges: ["Auberge du Désert", "Auberge Marie-Lucien", "Le Campement du Saloum", "Auberge de la Plage", "Auberge Culturelle"],
        sites: ["Île de Gorée", "Quartier Colonial Saint-Louis", "Maison des Esclaves", "Fort d'Estrées", "Vestiges de Carabane"],
        nature: ["Parc National du Niokolo-Koba", "Réserve de Bandia", "Djoudj Bird Sanctuary", "Forêt de Casamance", "Delta du Saloum"],
        plages: ["Plage des Almadies", "Plage de Cap Skirring", "Plage de Toubab Dialaw", "Plage de Popenguine", "Plage de Ngor"],
        restaurants: ["Le Lagon 1", "La Fourchette", "Chez Loutcha", "Restaurant du Fleuve", "Le Jardin Thaï"],
        culture: ["Musée Théodore Monod", "Musée des Civilisations Noires", "Village des Arts", "IFAN Dakar"],
        artisanat: ["Marché Soumbédioune", "Marché HLM", "Marché Kermel", "Village Artisanal de Thiès"],
        loisirs: ["Surf à Dakar", "Golf de Saly", "Accrobaobab", "Pêche au gros à Dakar"],
        monuments: ["Monument de la Renaissance Africaine", "Phare des Mamelles", "Grande Mosquée de Dakar"],
        excursions: ["Visite du Lac Rose", "Désert de Lompoul", "Excursion au Delta du Saloum", "Safari à Bandia"]
    };

    let counter = 1;
    regions.forEach(reg => {
        categories.forEach(cat => {
            const list = names[cat.id];
            if (list) {
                list.forEach(name => {
                    const isHotelOrAuberge = cat.id === 'hotels' || cat.id === 'auberges';

                    // Assign demonstration images
                    let demoImage = null;
                    let demoGallery = [];
                    if (cat.id === 'hotels') {
                        demoImage = 'assets/hotel1.png';
                        demoGallery = ['assets/hotel1.png', 'assets/hotel2.png'];
                    } else if (cat.id === 'auberges') {
                        demoImage = 'assets/auberge1.png';
                        demoGallery = ['assets/auberge1.png'];
                    } else if (cat.id === 'nature') {
                        demoImage = 'assets/nature1.png';
                        demoGallery = ['assets/nature1.png'];
                    }

                    tourismData.push({
                        id: counter++,
                        title: `${name} - ${reg.label}`,
                        category: cat.id,
                        venue: `${name}, région de ${reg.label}`,
                        region: reg.id,
                        lat: reg.lat + (Math.random() - 0.5) * 0.4, // Augmentation de la dispersion
                        lng: reg.lng + (Math.random() - 0.5) * 0.4,
                        price: isHotelOrAuberge ? `${(Math.floor(Math.random() * 5) + 2) * 10000} FCFA` : "Prix variable",
                        phone: isHotelOrAuberge ? `+221 33 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}` : null,
                        stars: isHotelOrAuberge ? Math.floor(Math.random() * 5) + 1 : 0,
                        image: demoImage,
                        gallery: demoGallery,
                        status: 'approved'
                    });
                });
            }
        });
    });
    localStorage.setItem('senegaltourisme_locations', JSON.stringify(tourismData));
}

function initUI() {
    // Categories Sidebar
    const catContainer = document.getElementById('genreFilters');
    categories.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.innerHTML = `${c.icon} ${c.label}`;
        btn.onclick = () => toggleSidebarFilter('category', c.id, btn);
        catContainer.appendChild(btn);
    });

    // Regions Sidebar
    const regContainer = document.getElementById('regionFilters');
    regions.forEach(r => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.textContent = r.label;
        btn.onclick = () => toggleSidebarFilter('region', r.id, btn);
        regContainer.appendChild(btn);
    });

    // Modals Selects
    const pubCatSelect = document.getElementById('pubCategory');
    if (pubCatSelect) {
        pubCatSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    }
    const pubRegSelect = document.getElementById('pubRegion');
    if (pubRegSelect) {
        pubRegSelect.innerHTML = regions.map(r => `<option value="${r.id}">${r.label}</option>`).join('');
    }
}

function setupEventListeners() {
    const openSubmit = () => {
        if (!currentUser) document.getElementById('authModal').style.display = 'flex';
        else document.getElementById('submitLocationModal').style.display = 'flex';
    };

    document.getElementById('proposeLocationBtn').onclick = openSubmit;
    document.getElementById('proposeLocationBtnTop').onclick = openSubmit;

    document.getElementById('userAuthForm').onsubmit = (e) => {
        e.preventDefault();
        currentUser = {
            name: document.getElementById('userName').value,
            phone: document.getElementById('userPhone').value
        };
        localStorage.setItem('senegaltourisme_user', JSON.stringify(currentUser));
        closeModal('authModal');
        document.getElementById('submitLocationModal').style.display = 'flex';
    };

    document.getElementById('publicSubmitForm').onsubmit = (e) => {
        e.preventDefault();
        submitPendingLocation(e);
    };

    // View Switching Logic from parent app
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            const isMap = btn.dataset.mode === 'map';
            document.querySelectorAll('.view-btn').forEach(b => {
                b.classList.remove('active');
                b.style.opacity = "0.6";
                b.style.boxShadow = "none";
            });

            btn.classList.add('active');
            btn.style.opacity = "1";

            if (isMap) {
                btn.style.background = "var(--primary)";
                btn.style.boxShadow = "0 8px 20px rgba(255, 140, 0, 0.5)";
                document.getElementById('btnGrid').style.background = "#E74C3C";
                document.getElementById('btnGrid').style.opacity = "0.6";
            } else {
                btn.style.background = "#E74C3C";
                btn.style.boxShadow = "0 8px 20px rgba(231, 76, 60, 0.6)";
                document.getElementById('btnMap').style.background = "var(--primary)";
                document.getElementById('btnMap').style.opacity = "0.6";
            }
            switchView(btn.dataset.mode);
        };
    });

    document.getElementById('globalSearch').oninput = (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        renderLocations();
    };

    document.getElementById('nearMeGlobal').onclick = handleLocation;

    // Mobile Sidebar
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        };
    }
    document.addEventListener('click', () => {
        if (window.innerWidth <= 1024) sidebar.classList.remove('active');
    });
}

function submitPendingLocation(e) {
    const files = document.getElementById('pubImage').files;
    const promises = [];
    const gallery = [];

    for (let i = 0; i < files.length; i++) {
        promises.push(new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                gallery.push(event.target.result);
                resolve();
            };
            reader.readAsDataURL(files[i]);
        }));
    }

    Promise.all(promises).then(() => {
        const pending = {
            id: Date.now(),
            title: document.getElementById('pubTitle').value,
            category: document.getElementById('pubCategory').value,
            region: document.getElementById('pubRegion').value,
            stars: parseInt(document.getElementById('pubStars').value),
            venue: document.getElementById('pubAddress').value,
            phone: document.getElementById('pubPhone').value,
            price: document.getElementById('pubPrice').value ? `${document.getElementById('pubPrice').value} FCFA` : null,
            image: gallery[0] || null, // Image principale
            gallery: gallery,
            status: 'pending',
            submittedBy: currentUser,
            lat: 14.7, lng: -17.4
        };

        const allPending = JSON.parse(localStorage.getItem('senegaltourisme_pending')) || [];
        allPending.push(pending);
        localStorage.setItem('senegaltourisme_pending', JSON.stringify(allPending));

        alert("Merci ! Votre suggestion a été envoyée pour validation.");
        closeModal('submitLocationModal');
        e.target.reset();
    });
}

function renderLocations() {
    const filtered = tourismData.filter(loc => {
        const isApproved = !loc.status || loc.status === 'approved';
        const matchCat = !activeFilters.category || loc.category === activeFilters.category;
        const matchReg = !activeFilters.region || loc.region === activeFilters.region;
        const matchSearch = !activeFilters.search || loc.title.toLowerCase().includes(activeFilters.search);
        // Filtre carte : si on est en mode carte, on respecte mapCategories
        const matchMapCat = currentView === 'map' ? activeFilters.mapCategories.has(loc.category) : true;

        return isApproved && matchCat && matchReg && matchSearch && matchMapCat;
    });

    const grid = document.getElementById('gridView');
    if (!grid) return;
    grid.innerHTML = '';

    if (filtered.length === 0 && currentView === 'grid') {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-dim);">Aucun lieu trouvé.</div>';
    }

    if (currentView === 'grid') {
        filtered.forEach(loc => {
            const catInfo = categories.find(c => c.id === loc.category) || categories[0];
            const card = document.createElement('div');
            card.className = 'event-card';
            card.style.borderTop = `4px solid ${catInfo.color}`;

            const galleryHtml = loc.gallery && loc.gallery.length > 0
                ? `<div class="mini-gallery" style="display:flex; gap:5px; margin-top:10px; overflow-x:auto; padding-bottom:5px;">
                    ${loc.gallery.map(img => `<img src="${img}" style="width:60px; height:45px; object-fit:cover; border-radius:4px; flex-shrink:0;">`).join('')}
                   </div>`
                : '';

            const bgStyle = loc.image ? `url('${loc.image}')` : `linear-gradient(135deg, ${catInfo.color}22, ${catInfo.color}44)`;

            const starsHtml = loc.stars > 0 ? `<div style="color: #f1c40f; margin-bottom: 5px;">${"⭐".repeat(loc.stars)}</div>` : '';

            card.innerHTML = `
                <div class="card-img" style="background-image: ${bgStyle}; background-size: cover; background-position: center;">
                    <span class="card-badge" style="background: ${catInfo.color}">${catInfo.icon} ${catInfo.label}</span>
                </div>
                <div class="card-info">
                    ${starsHtml}
                    <h3 class="card-title">${loc.title}</h3>
                    <div class="card-meta">
                        <div class="meta-item"><span>📌 ${loc.venue}</span></div>
                        ${loc.phone ? `<div class="meta-item" style="color:var(--primary); font-weight:700;"><span>📞 ${loc.phone}</span></div>` : ''}
                        ${loc.price ? `<div class="meta-item" style="font-size:1.1rem; color:var(--secondary); font-weight:800; margin-top:5px;"><span>🏷️ ${loc.price} / nuit</span></div>` : ''}
                    </div>
                    ${galleryHtml}
                    <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}', '_blank')" 
                            style="margin-top: 15px; width: 100%; padding: 12px; border-radius: 10px; border: none; background: #4285F4; color: white; font-weight: 700; cursor: pointer;">
                        Itinéraire Google Maps
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    if (map) updateMapMarkers(filtered);
}

function switchView(mode) {
    currentView = mode;
    document.getElementById('gridView').style.display = mode === 'grid' ? 'grid' : 'none';
    document.getElementById('mapView').style.display = mode === 'map' ? 'block' : 'none';
    if (mode === 'map') { initMap(); setTimeout(() => map.invalidateSize(), 150); }
    renderLocations();
}

function initMap() {
    if (map) return;
    map = L.map('mainMap', { zoomControl: false }).setView([14.4974, -14.4524], 7); // Center of Senegal
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { attribution: 'OSM France' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    document.getElementById('maximizeMapControl').onclick = () => document.getElementById('mapView').classList.toggle('map-fullscreen');
    document.getElementById('mapLocateBtn').onclick = handleLocation;
    setupMapLegend();
    renderLocations();
}

function setupMapLegend() {
    const legendContainer = document.getElementById('legendFilterItems');
    if (!legendContainer) return;
    legendContainer.innerHTML = '';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        // Vide par défaut comme demandé
        item.innerHTML = `<input type="checkbox" id="map-cat-${cat.id}" ${activeFilters.mapCategories.has(cat.id) ? 'checked' : ''}><label for="map-cat-${cat.id}"><span class="dot-indicator" style="background: ${cat.color}"></span> ${cat.icon} ${cat.label}</label>`;
        item.querySelector('input').onchange = (e) => {
            if (e.target.checked) activeFilters.mapCategories.add(cat.id);
            else activeFilters.mapCategories.delete(cat.id);
            renderLocations();
        };
        legendContainer.appendChild(item);
    });
}

function updateMapMarkers(data) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    data.forEach(loc => {
        const cat = categories.find(c => c.id === loc.category) || categories[0];
        const marker = L.circleMarker([loc.lat, loc.lng], { radius: 10, fillColor: cat.color, color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map);

        marker.bindPopup(`
            <div style="padding: 10px; min-width: 200px">
                ${loc.stars > 0 ? `<div style="color: #f1c40f; margin-bottom: 5px;">${"⭐".repeat(loc.stars)}</div>` : ''}
                <strong style="display:block; margin-bottom: 5px; font-size: 1.1rem;">${loc.title}</strong>
                <span style="font-size:12px; color:#94A3B8; display:block; margin-bottom:8px;">${cat.icon} ${cat.label}</span>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <span style="font-size:13px; color:#fff">📍 ${loc.venue}</span>
                    ${loc.phone ? `<span style="font-size:13px; color:var(--primary); font-weight:700;">📞 ${loc.phone}</span>` : ''}
                    ${loc.price ? `<span style="font-size:14px; color:#2ECC71; font-weight:800; margin-top:5px;">🏷️ ${loc.price} / nuit</span>` : ''}
                </div>
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}', '_blank')" 
                        style="margin-top: 15px; width: 100%; padding: 8px; border-radius: 8px; border: none; background: #4285F4; color: white; font-weight: 700; cursor: pointer;">
                    Itinéraire Maps
                </button>
            </div>
        `);
        markers.push(marker);
    });
}

function handleLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (map) {
            map.setView([userLocation.lat, userLocation.lng], 12);
            L.marker([userLocation.lat, userLocation.lng], {
                icon: L.divIcon({ className: 'user-pos-marker', html: '<div class="user-pos-pulse"></div>', iconSize: [20, 20] })
            }).addTo(map);
        }
    });
}

function toggleSidebarFilter(type, value, btn) {
    if (activeFilters[type] === value) {
        activeFilters[type] = null;
        btn.classList.remove('active');
    } else {
        activeFilters[type] = value;
        document.querySelectorAll(`#${type === 'category' ? 'genreFilters' : 'regionFilters'} .pill`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
    }
    renderLocations();
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.closeModal = closeModal;
