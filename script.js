let currentFilter = "Home";
let activeTaskTab = "daily";
let selectedTrackId = null;

const countCats = ["Home", "Bookmark", "History", "Wishlist", "Study", "Pavan Bookmark"];

// "Coins Bank" ని పూర్తిగా తొలగించి, "Gaming Zone" ని ప్రయారిటీగా యాడ్ చేశాను
const devasCats = [
    "Home", "Gaming Zone", "Bookmark", "History", "Wishlist", "Study", 
    "Pokemon GO", "Personal Interests", "Physical Training", "Budget", 
    "My playlist", "Movies/webseries", "My Jarvis goal", 
    "Daily tasks/special tasks", "My wife/my children", "My goals"
];

const pavansCats = [
    "JAV (Japanese)", "Manga / Manhwa", "Hentai", "Live Shows", 
    "Dirty thoughts/Dirty desires", "Ullu webseries", "Romantic angle", 
    "Pavan Bookmark", "Pavan Wishlist"
];

function toggleMenu() { 
    updateSidebar(); 
    document.getElementById('sidebar').classList.toggle('open'); 
    document.getElementById('overlay').classList.toggle('show'); 
}

function openForm() { 
    const selectDropdown = document.getElementById('vManualCategory');
    selectDropdown.innerHTML = "";
    pavansCats.forEach(cat => {
        if(cat === "Pavan Bookmark" || cat === "Pavan Wishlist") return;
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        selectDropdown.appendChild(opt);
    });
    // Gaming లో ఉన్నప్పుడు కూడా ఐటమ్స్ యాడ్ చేసుకోవడానికి డ్రాప్‌డౌన్ సపోర్ట్
    devasCats.forEach(cat => {
        if(cat === "Gaming Zone") {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            selectDropdown.appendChild(opt);
        }
    });
    document.getElementById('popupForm').classList.add('show'); 
    document.getElementById('overlay').classList.add('show'); 
}

function openTrainingForm() { 
    document.getElementById('trainingPopupForm').classList.add('show'); 
    document.getElementById('overlay').classList.add('show'); 
}

function closeAll() { 
    document.getElementById('sidebar').classList.remove('open'); 
    document.getElementById('popupForm').classList.remove('show'); 
    document.getElementById('trainingPopupForm').classList.remove('show'); 
    document.getElementById('taskTypePopup').classList.remove('show'); 
    document.getElementById('overlay').classList.remove('show'); 
}

function resetFilters() { 
    document.getElementById('mainSearch').value = ""; 
    render(); 
}

function switchTaskTab(tabType) { 
    activeTaskTab = tabType; 
    document.getElementById('tabDailyBtn').classList.toggle('active', tabType === 'daily'); 
    document.getElementById('tabSpecialBtn').classList.toggle('active', tabType === 'special'); 
    render(); 
}

function compressToThumbnail(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = 280;
            canvas.height = 160;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 280, 160);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.onerror = function() { callback(""); };
        img.src = e.target.result;
    };
    reader.onerror = function() { callback(""); };
    reader.readAsDataURL(file);
}

function saveData() {
    const saveBtn = document.getElementById('saveDataBtn');
    const code = document.getElementById('vCode').value.trim();
    const studio = document.getElementById('vStudio').value.trim() || "Unknown";
    const topic = document.getElementById('vTopic').value.trim() || "General";
    const tags = document.getElementById('vTags').value.trim() || "";
    
    let rawUrl = document.getElementById('vUrl').value.trim();
    const url = rawUrl ? encodeURI(rawUrl) : ""; 

    const manualCat = document.getElementById('vManualCategory').value;
    const status = document.getElementById('vStatus').value;
    const rating = document.getElementById('vRating').value;
    const fileInput = document.getElementById('vImageFile');

    if(!code) { alert("Name ఎంటర్ చెయ్ పవన్!"); return; }
    
    saveBtn.disabled = true;
    saveBtn.innerText = "SAVING...";

    const executeSave = (finalImgBase64) => {
        const newItem = {
            id: Date.now(),
            isTraining: false,
            code: code,
            studio: studio,
            topic: topic,
            tags: tags,
            url: decodeURI(url), 
            manualCat: manualCat,
            isPavanBookmarked: false, 
            status: status,
            rating: rating,
            image: finalImgBase64,
            date: new Date().getTime()
        };

        try {
            let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
            list.push(newItem);
            localStorage.setItem('deva_db_v98', JSON.stringify(list));
            alert("డేటా విజయవంతంగా సేవ్ అయ్యింది! 🎉");
        } catch(err) {
            alert("Error: బ్రౌజర్ స్టోరేజ్ లో సమస్య వచ్చింది!");
        }

        document.getElementById('vCode').value = "";
        document.getElementById('vStudio').value = "";
        document.getElementById('vTopic').value = "";
        document.getElementById('vTags').value = "";
        document.getElementById('vUrl').value = "";
        document.getElementById('vImageFile').value = "";
        
        saveBtn.disabled = false;
        saveBtn.innerText = "SAVE DATA";
        closeAll(); 
        render();
    };

    if(fileInput.files && fileInput.files[0]) {
        compressToThumbnail(fileInput.files[0], function(thumbnailBase64) {
            executeSave(thumbnailBase64);
        });
    } else {
        executeSave("");
    }
}

function togglePavanBookmark(id) {
    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    list = list.map(item => {
        if(item.id === id) {
            item.isPavanBookmarked = !item.isPavanBookmarked; 
        }
        return item;
    });
    localStorage.setItem('deva_db_v98', JSON.stringify(list));
    render(); 
}

function saveTrainingTemplate() {
    const exerciseName = document.getElementById('tExerciseName').value || "WORKOUT";
    const bodyPart = document.getElementById('tBodyPart').value || "GENERAL";
    const duration = document.getElementById('tDuration').value || "0 mins";

    const trainingItem = {
        id: Date.now(),
        isTraining: true,
        placedTarget: null, 
        isDone: false,
        manualCat: "Physical Training",
        exerciseName: exerciseName,
        bodyPart: bodyPart,
        duration: duration,
        status: "PENDING",
        date: new Date().getTime()
    };

    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    list.push(trainingItem);
    localStorage.setItem('deva_db_v98', JSON.stringify(list));
    
    document.getElementById('tExerciseName').value = "";
    document.getElementById('tBodyPart').value = "";
    document.getElementById('tDuration').value = "";
    
    render(); closeAll();
}

function askPlacementTarget(id) { 
    selectedTrackId = id; 
    document.getElementById('taskTypePopup').classList.add('show'); 
    document.getElementById('overlay').classList.add('show'); 
}

function confirmPlacement(targetType) {
    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    const repsLive = document.getElementById(`reps-${selectedTrackId}`).value;

    list = list.map(item => {
        if(item.id === selectedTrackId) {
            item.placedTarget = targetType;
            if(repsLive) item.duration = repsLive;
            item.isDone = false;
            item.status = "PENDING";
        }
        return item;
    });
    localStorage.setItem('deva_db_v98', JSON.stringify(list));
    closeAll(); render();
}

function removeHomeTaskOnTouch(id) {
    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    list = list.map(item => {
        if(item.id === id) {
            item.placedTarget = null;
            item.isDone = true;
            item.status = "COMPLETED";
        }
        return item;
    });
    localStorage.setItem('deva_db_v98', JSON.stringify(list));
    render();
}

function deleteItem(id) {
    if(confirm("ఈ రికార్డును డిలీట్ చేయాలా పవన్?")) {
        let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
        localStorage.setItem('deva_db_v98', JSON.stringify(list.filter(i => i.id !== id)));
        render();
    }
}

function updateSidebar() {
    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    const container = document.getElementById('sidebarSections');
    container.innerHTML = "";

    container.innerHTML += `<div class="sidebar-section-title">Deva's Core</div>`;
    devasCats.forEach(cat => {
        let showCount = countCats.includes(cat) || cat === "Gaming Zone";
        let isSel = (currentFilter === cat) ? " active-item" : "";
        let countNum = 0;
        if(cat === "Home") countNum = list.filter(i => !pavansCats.includes(i.manualCat) && !i.isTraining).length;
        else if(cat === "Pavan Bookmark") countNum = list.filter(i => i.isPavanBookmarked === true).length;
        else countNum = list.filter(i => i.manualCat === cat).length;
        
        container.innerHTML += `<div class="nav-item${isSel}" onclick="changeCategory('${cat}')">${cat} ${showCount ? ` <span class="nav-count">${countNum}</span>` : ''}</div>`;
    });

    container.innerHTML += `<div class="sidebar-section-title" style="margin-top:25px; color:#ff3e3e;">Pavan's Zone</div>`;
    container.innerHTML += `<button id="sidebarAddBtn" onclick="openForm()">ADD NEW +</button>`;
    pavansCats.forEach(cat => {
        let isSel = (currentFilter === cat) ? " active-item" : "";
        let countNum = (cat === "Pavan Bookmark") ? list.filter(i => i.isPavanBookmarked === true).length : list.filter(i => i.manualCat === cat).length;
        container.innerHTML += `<div class="nav-item${isSel}" onclick="changeCategory('${cat}')">${cat} <span class="nav-count" style="background:#ff3e3e; color:#fff;">${countNum}</span></div>`;
    });
}
function changeCategory(name) { 
    currentFilter = name; 
    document.getElementById('nav-title').innerText = name.toUpperCase(); 
    document.getElementById('bannerTitle').innerText = name + " COLLECTION";
    
    const taskTracker = document.getElementById('taskTrackerArea');
    const initBtnArea = document.getElementById('initialiseBtnArea');
    const bar = document.getElementById('controlBar');
    const gamingZone = document.getElementById('gamingZoneArea');
    const videoGrid = document.getElementById('videoGrid');
    const jvBanner = document.querySelector('.jv-banner');
    
    // 🔲 ఈవెంట్స్ ఏరియా సెలెక్టర్ (సమస్యను ఫిక్స్ చేయడానికి)
    const pokemonEvents = document.getElementById('pokemonEventsArea');

    // 🛑 సైడ్‌బార్ నల్లటి ఓవర్‌లే స్క్రీన్‌ని ఫోర్స్ క్లోజ్ చేసే లాజిక్
    const overlay = document.querySelector('.sidebar-overlay') || document.getElementById('overlay') || document.querySelector('.menu-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    }

    // గేమింగ్ జోన్ ఇంటర్‌ఫేస్ మేనేజ్‌మెంట్ లాజిక్
    if(name === "Gaming Zone") {
        if(gamingZone) gamingZone.style.display = "block"; // 8 బాక్సులు కనిపిస్తాయి
        if(pokemonEvents) pokemonEvents.style.display = "none"; // 💥 ఈవెంట్స్ లిస్ట్ పూర్తిగా హైడ్ అవుతుంది!
        if(jvBanner) jvBanner.style.setProperty('display', 'none', 'important'); 
        if(bar) bar.style.setProperty('display', 'none', 'important'); 
        if(videoGrid) videoGrid.style.display = "none";
        if(taskTracker) taskTracker.style.display = "none"; 
        if(initBtnArea) initBtnArea.style.display = "none"; 
    } 
    else if(name === "Daily tasks/special tasks") {
        if(gamingZone) gamingZone.style.display = "none";
        if(pokemonEvents) pokemonEvents.style.display = "none";
        if(jvBanner) jvBanner.style.display = "flex";
        if(videoGrid) videoGrid.style.display = "flex";
        if(taskTracker) taskTracker.style.display = "block"; 
        if(initBtnArea) initBtnArea.style.display = "none"; 
        if(bar) bar.classList.remove('active');
    } 
    else if(name === "Physical Training") {
        if(gamingZone) gamingZone.style.display = "none";
        if(pokemonEvents) pokemonEvents.style.display = "none";
        if(jvBanner) jvBanner.style.display = "flex";
        if(videoGrid) videoGrid.style.display = "flex";
        if(taskTracker) taskTracker.style.display = "none"; 
        if(initBtnArea) initBtnArea.style.display = "block"; 
        if(bar) bar.classList.remove('active');
    } 
    else {
        if(gamingZone) gamingZone.style.display = "none";
        if(pokemonEvents) pokemonEvents.style.display = "none";
        if(jvBanner) jvBanner.style.display = "flex";
        if(videoGrid) videoGrid.style.display = "flex";
        if(taskTracker) taskTracker.style.display = "none"; 
        if(initBtnArea) initBtnArea.style.display = "none";
        if(bar) {
            bar.style.display = ""; 
            countCats.includes(name) || pavansCats.includes(name) ? bar.classList.add('active') : bar.classList.remove('active');
        }
    }
    render(); 
    closeAll(); // మెనూ ప్యానెల్ క్లోజ్ చేయడానికి
}


function render() {
    const homeContainer = document.getElementById('downSheetsArea');
    const grid = document.getElementById('videoGrid');
    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    const search = document.getElementById('mainSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    
    homeContainer.innerHTML = ""; grid.innerHTML = "";
    let displayCount = 0;

    if(currentFilter === "Daily tasks/special tasks") {
        let placedTasks = list.filter(i => i.isTraining && i.placedTarget === activeTaskTab);
        if(placedTasks.length === 0) {
            homeContainer.innerHTML = `<div class="blank-rectangle-sheet"><span class="sheet-info-text">Empty Task Sheet - No Workouts Placed</span></div>`;
        } else {
            placedTasks.forEach(v => {
                const sheet = document.createElement('div');
                sheet.className = 'home-placed-card';
                sheet.setAttribute('onclick', `removeHomeTaskOnTouch(${v.id})`);
                sheet.innerHTML = `
                    <div class="home-card-left">
                        <div class="hc-row-top"><span class="hc-text">${v.exerciseName}</span><span class="hc-duration">${v.duration || '0 mins'}</span></div>
                        <div class="hc-row-bottom"><span class="hc-sub">${v.bodyPart}</span></div>
                    </div>
                    <div class="home-card-right-hint"><span class="remove-hint">TAP TO DONE</span></div>
                `;
                homeContainer.appendChild(sheet);
            });
        }
    }

    list.forEach(v => {
        let matchesCat = false;
        if(currentFilter === "Pavan Bookmark") {
            matchesCat = (v.isPavanBookmarked === true);
        } else if(currentFilter === "Home") {
            matchesCat = !pavansCats.includes(v.manualCat) && !v.isTraining;
        } else {
            matchesCat = (v.manualCat === currentFilter);
        }
        
        if(!matchesCat) return;

        if(statusFilter !== "ALL" && v.status !== statusFilter) return;
        if(ratingFilter !== "ALL" && v.rating !== "5 Stars") return;

        if(v.isTraining && currentFilter === "Physical Training") {
            displayCount++;
            const card = document.createElement('div'); card.className = 'training-card';
            card.innerHTML = `
                <div class="training-header"><span class="training-body-part">${v.bodyPart}</span><button class="action-btn" style="color:#ff3e3e; background:none;" onclick="deleteItem(${v.id})">✕</button></div>
                <div class="training-name">${v.exerciseName}</div>
                <div class="training-inputs">
                    <div class="training-field"><label>Duration</label><input type="text" id="reps-${v.id}" value="${v.duration || ''}"></div>
                </div>
                <button class="place-target-btn" onclick="askPlacementTarget(${v.id})">Place Target +</button>
            `;
            grid.appendChild(card);
            return;
        }

        if(!v.isTraining && v.code.toLowerCase().includes(search)) {
            displayCount++;
            const card = document.createElement('div'); card.className = 'card';
            
            const imgSrc = (v.image && v.image.trim() !== "") ? v.image : "";
            const imgHtml = imgSrc ? `<img src="${imgSrc}" class="card-img" alt="Uploaded Image">` : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; color:#555; background:#222; font-size:12px; font-weight:bold;">NO IMAGE</div>`;

            const glowClass = v.isPavanBookmarked ? "bookmark-btn-active" : "bookmark-btn-inactive";
            const showBookmarkBtn = `<div class="bookmark-action"><button class="action-btn ${glowClass}" title="Toggle Pavan Bookmark" onclick="togglePavanBookmark(${v.id})">🔖</button></div>`;

            card.innerHTML = `
                ${imgHtml}
                ${showBookmarkBtn}
                <div class="card-actions"><button class="action-btn" style="color:#ff3e3e" onclick="deleteItem(${v.id})">✕</button></div>
                <div class="card-info">
                    <div class="code-title">${v.code}</div>
                    <div class="card-studio">Studio: ${v.studio || 'Unknown'}</div>
                    <div class="card-topic">Topic: ${v.topic || 'General'}</div>
                    ${v.tags ? `<div class="card-tags">Tags: ${v.tags}</div>` : ''}
                    ${v.url ? `<a href="${v.url}" target="_blank" class="url-link">🔗 View Link</a>` : ''}
                    
                    <div class="card-status-row">
                        <div class="card-status">${v.status || 'PENDING'}</div>
                        <div class="card-rating">${v.rating || '5 Stars'}</div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        }
    });
    
    document.getElementById('mainCount').innerText = (currentFilter === "Daily tasks/special tasks") ? list.filter(i => i.isTraining && i.placedTarget === activeTaskTab).length + " Active Tasks" : displayCount + " Items";
}
// గేమింగ్ జోన్ సబ్-కేటగిరీ క్లిక్ హ్యాండ్లర్
function filterGaming(subCategory) {
    if (subCategory === 'Events') {
        // మెయిన్ 8 బాక్సులను దాచి, ఈవెంట్స్ ఏరియాను చూపిస్తాం
        document.getElementById('gamingZoneArea').style.display = 'none';
        document.getElementById('pokemonEventsArea').style.display = 'block';
        document.getElementById('nav-title').innerText = "POKEMON GO EVENTS";
        
        // లైవ్ ఈవెంట్స్ డేటాను లోడ్ చేయడం
        loadLiveEvents();
    } else {
        alert(subCategory + " ఫీచర్ త్వరలోనే అందుబాటులోకి వస్తుంది!");
    }
}

// ఈవెంట్స్ నుండి తిరిగి గేమింగ్ మెనూకి వెళ్ళడానికి
function backToGamingMenu() {
    document.getElementById('pokemonEventsArea').style.display = 'none';
    document.getElementById('gamingZoneArea').style.display = 'block';
    document.getElementById('nav-title').innerText = "GAMING ZONE";
}

// GitHub Action జనరేట్ చేసిన JSON నుండి డేటాను గ్రాబ్ చేసి చూపించే మెయిన్ ఫంక్షన్
function loadLiveEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = `<div style="color:white; text-align:center; padding:20px;">Loading Live Events...</div>`;

    // మనం GitHub Actions ద్వారా క్రియేట్ చేయబోయే ఎగ్జాక్ట్ ఫైల్ పాత్ ఇది
    fetch('./events_deep_data.json')
        .then(response => {
            if (!response.ok) throw new Error('No data found');
            return response.json();
        })
        .then(eventsData => {
            eventsGrid.innerHTML = ''; // క్లియర్ లోడింగ్ టెక్స్ట్
            
            eventsData.forEach((event, index) => {
                // లీక్‌డక్ లాంటి అందమైన కార్డ్ స్ట్రక్చర్
                const card = document.createElement('div');
                card.style.background = '#1a1a1a';
                card.style.borderLeft = `5px solid ${event.borderColor || '#FF3B30'}`;
                card.style.borderRadius = '8px';
                card.style.overflow = 'hidden';
                card.style.cursor = 'pointer';
                card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
                card.onclick = () => openEventModal(event);

                card.innerHTML = `
                    <div style="position: relative; width: 100%; height: 140px; background: url('${event.image}') center/cover no-repeat;">
                        <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.8); color: #fff; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px;">
                            ⏰ ${event.countdownText || 'Active'}
                        </div>
                    </div>
                    <div style="padding: 12px; color: #ffffff;">
                        <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${event.name}</h3>
                        <p style="margin: 0; font-size: 11px; color: #aaaaaa; font-weight: bold;">📅 ${event.dateRange}</p>
                    </div>
                `;
                eventsGrid.appendChild(card);
            });
        })
        .catch(err => {
            eventsGrid.innerHTML = `
                <div style="color:#ff3e3e; text-align:center; padding:20px; font-weight:bold; border: 1px dashed #ff3e3e;">
                    ⚠ Live Events Data is syncing via GitHub Actions. Please wait for the first deploy!
                </div>`;
        });
}

// కార్డ్ క్లిక్ చేసినప్పుడు ఇన్-యాప్ లోనే పూర్తి 10 రకాల స్పెషాలిటీస్ ఓపెన్ చేసే లాజిక్
function openEventModal(event) {
    const modal = document.getElementById('eventDetailsModal');
    const content = document.getElementById('modalEventContent');
    
    // బోనస్ ల లిస్ట్ బిల్డ్ చేయడం
    let bonusesHTML = '';
    if(event.specialties && event.specialties.length > 0) {
        event.specialties.forEach(spec => {
            bonusesHTML += `
                <div style="background: #141414; border: 1px solid #333; padding: 12px; margin-bottom: 10px; border-radius: 6px;">
                    <strong style="color: #FFCC00; font-size: 14px; display: block; margin-bottom: 5px;">🌟 ${spec.title}</strong>
                    <p style="margin: 0; font-size: 12px; color: #dddddd; line-height: 1.4;">${spec.description}</p>
                </div>
            `;
        });
    } else {
        bonusesHTML = `<p style="color:#aaa; font-size:12px;">No active bonuses listed for this event.</p>`;
    }

    content.innerHTML = `
        <img src="${event.image}" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); margin-bottom: 15px;">
        <h1 style="margin: 0 0 5px 0; font-size: 22px; font-weight: 900; color: #ffffff; text-transform: uppercase;">${event.name}</h1>
        <p style="margin: 0 0 20px 0; color: #FF3B30; font-weight: bold; font-size: 13px;">📅 ${event.dateRange}</p>
        
        <h3 style="border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 15px; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #4CD964;">✨ EVENT SPECIALTIES & BONUSES</h3>
        ${bonusesHTML}
    `;
    
    modal.style.display = "block";
}

function closeEventModal() {
    document.getElementById('eventDetailsModal').style.display = "none";
}

window.onload = () => {
    if (!localStorage.getItem('deva_db_v98')) {
        localStorage.setItem('deva_db_v98', JSON.stringify([]));
    }
    render();
};
