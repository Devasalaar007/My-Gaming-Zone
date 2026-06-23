let currentFilter = "Home";
let activeTaskTab = "daily";
let selectedTrackId = null;
let timerInterval = null; // టైమర్ క్లియర్ చేయడానికి

const countCats = ["Home", "Bookmark", "History", "Wishlist", "Study", "Pavan Bookmark"];

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
    if(document.getElementById('taskTypePopup')) {
        document.getElementById('taskTypePopup').classList.remove('show');
    }
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
    if(!container) return;
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
    const pokemonEvents = document.getElementById('pokemonEventsArea');

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('show');

    // అవసరమైతే పాత ఇంటర్వెల్స్ క్లియర్ చేయడానికి
    if(timerInterval) clearInterval(timerInterval);

    if(name === "Gaming Zone") {
        if(gamingZone) gamingZone.style.display = "block"; 
        if(pokemonEvents) pokemonEvents.style.display = "none"; 
        if(jvBanner) jvBanner.style.setProperty('display', 'none', 'important'); 
        if(bar) bar.style.setProperty('display', 'none', 'important'); 
        if(videoGrid) videoGrid.style.display = "none";
        if(taskTracker) taskTracker.style.display = "none"; 
        if(initBtnArea) initBtnArea.style.display = "none"; 
    } 
    else if(name === "Daily tasks/special tasks") {
        if(gamingZone) gamingZone.style.display = "none";
        if(pokemonEvents) pokemonEvents.style.display = "none";
        if(jvBanner) jvBanner.style.setProperty('display', 'flex', 'important');
        if(videoGrid) videoGrid.style.display = "flex";
        if(taskTracker) taskTracker.style.display = "block"; 
        if(initBtnArea) initBtnArea.style.display = "none"; 
        if(bar) bar.style.setProperty('display', 'none', 'important');
    } 
    else if(name === "Physical Training") {
        if(gamingZone) gamingZone.style.display = "none";
        if(pokemonEvents) pokemonEvents.style.display = "none";
        if(jvBanner) jvBanner.style.setProperty('display', 'flex', 'important');
        if(videoGrid) videoGrid.style.display = "flex";
        if(taskTracker) taskTracker.style.display = "none"; 
        if(initBtnArea) initBtnArea.style.display = "block"; 
        if(bar) bar.style.setProperty('display', 'none', 'important');
    } 
    else {
        if(gamingZone) gamingZone.style.display = "none";
        if(pokemonEvents) pokemonEvents.style.display = "none";
        if(jvBanner) jvBanner.style.setProperty('display', 'flex', 'important');
        if(videoGrid) videoGrid.style.display = "flex";
        if(taskTracker) taskTracker.style.display = "none"; 
        if(initBtnArea) initBtnArea.style.display = "none";
        if(bar) {
            bar.style.setProperty('display', 'flex', 'important'); 
            countCats.includes(name) || pavansCats.includes(name) ? bar.classList.add('active') : bar.classList.remove('active');
        }
    }
    render(); 
    closeAll(); 
}

function render() {
    const homeContainer = document.getElementById('downSheetsArea');
    const grid = document.getElementById('videoGrid');
    let list = JSON.parse(localStorage.getItem('deva_db_v98')) || [];
    const search = document.getElementById('mainSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    
    if(homeContainer) homeContainer.innerHTML = ""; 
    if(grid) grid.innerHTML = "";
    let displayCount = 0;

    if(currentFilter === "Daily tasks/special tasks" && homeContainer) {
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

        if(v.isTraining && currentFilter === "Physical Training" && grid) {
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

        if(!v.isTraining && v.code.toLowerCase().includes(search) && grid) {
            displayCount++;
            const card = document.createElement('div'); card.className = 'card';
            
            const imgSrc = (v.image && v.image.trim() !== "") ? v.image : "";
            const imgHtml = imgSrc ? `<img src="${imgSrc}" class="card-img" alt="Uploaded Image">` : `<div class="card-img" style="display:flex; align-items:center; justify-content:center; color:#555; background:#222; font-size:12px; font-weight:bold; height:110px;">NO IMAGE</div>`;

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
    
    const countBadge = document.getElementById('mainCount');
    if(countBadge) {
        countBadge.innerText = (currentFilter === "Daily tasks/special tasks") ? list.filter(i => i.isTraining && i.placedTarget === activeTaskTab).length + " Active Tasks" : displayCount + " Items";
    }
}

// 🎮 UNIFIED GAMING ZONE LOGIC
function filterGaming(subCategory) {
    const modal = document.getElementById('gamingZoneModal');
    const content = document.getElementById('modalDynamicContent');
    
    if(document.getElementById('pokemonEventsArea')) {
        document.getElementById('pokemonEventsArea').style.display = 'none';
    }

    if(timerInterval) clearInterval(timerInterval);

    if (subCategory === 'Events') {
        modal.style.display = "block";
        content.innerHTML = `
            <h2 style="color: #FF3B30; text-transform: uppercase; margin-bottom: 15px; font-weight: 900; letter-spacing: 1px; text-align: center;">📅 Live Pokémon GO Events</h2>
            <div id="modalEventsGrid" style="display: flex; flex-direction: column; gap: 16px;">
                <div style="color:#aaa; text-align:center; padding:20px;">🔄 Loading live data from events_deep_data.json...</div>
            </div>
        `;
        loadLiveEventsData();
    } 
    else if (subCategory === 'Free Fire MAX') {
        modal.style.display = "block";
        content.innerHTML = `
            <h2 style="color: #FFCC00; text-transform: uppercase; margin-bottom: 15px; font-weight: 900;">🔥 Free Fire MAX Zone</h2>
            <div style="background: #141414; border: 1px solid #333; padding: 15px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #FFF;">💎 Diamond & Membership Tracker</h4>
                <p style="font-size: 12px; color: #aaa; margin: 0 0 10px 0;">Track your upcoming bundles, weekly cards, and special items safely inside your portal.</p>
                <div style="border: 1px dashed #FFCC00; padding: 10px; text-align: center; color: #FFCC00; font-size: 13px; font-weight: bold; border-radius: 4px;">📦 BOX STATUS: READY FOR DATA LINK</div>
            </div>
        `;
    }
    else if (subCategory === 'Pokémon GO' || subCategory === 'My Pokemon') {
        modal.style.display = "block";
        content.innerHTML = `
            <h2 style="color: #4CD964; text-transform: uppercase; margin-bottom: 15px; font-weight: 900;">⚡ Pokémon GO IV & Mega Space</h2>
            <div style="background: #141414; border: 1px solid #333; padding: 15px; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #FFF;">📊 Perfect 100% IV Checklist</h4>
                <p style="font-size: 12px; color: #aaa; margin: 0;">Zacian, Steelix, Scorbunny stats and Mega Energy tracker box.</p>
                <div style="border: 1px dashed #4CD964; padding: 10px; text-align: center; color: #4CD964; font-size: 13px; font-weight: bold; border-radius: 4px; margin-top: 15px;">📦 BOX STATUS: READY FOR DATA LINK</div>
            </div>
        `;
    }
    else {
        modal.style.display = "block";
        content.innerHTML = `
            <h2 style="color: #007AFF; text-transform: uppercase; margin-bottom: 15px; font-weight: 900;">📦 ${subCategory} Station</h2>
            <div style="background: #141414; border: 1px solid #333; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="font-size: 13px; color: #bbb; margin: 0 0 15px 0;">This specialty box is successfully created in your website dashboard.</p>
                <div style="color: #007AFF; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">🔒 Secure In-App Module Active</div>
            </div>
        `;
    }
}

// గ్లోబల్ వేరియబుల్ గా ఈవెంట్స్ డేటాను సేవ్ చేయడానికి
let globalEventsData = [];

function loadLiveEventsData() {
    const grid = document.getElementById('modalEventsGrid');
    fetch('./events_deep_data.json')
        .then(res => {
            if (!res.ok) throw new Error('Syncing...');
            return res.json();
        })
        .then(data => {
            if(!grid) return;
            grid.innerHTML = '';
            globalEventsData = data; // డేటాను సేవ్ చేస్తున్నాం
            
            let currentSection = "";

            data.forEach((event, index) => {
                if(event.section && event.section !== currentSection) {
                    currentSection = event.section;
                    const secHeader = document.createElement('div');
                    secHeader.style.cssText = "color: #8E8E93; font-size: 12px; font-weight: 700; margin-top: 15px; border-bottom: 1px solid #222; padding-bottom: 4px; letter-spacing: 0.5px; text-transform: uppercase;";
                    secHeader.innerText = currentSection;
                    grid.appendChild(secHeader);
                }

                // రీడైరెక్ట్ అవ్వకుండా ఉండటానికి నార్మల్ div క్రియేట్ చేసి onclick ఫంక్షన్ పెట్టాం
                const card = document.createElement('div');
                card.style.display = "block";
                card.className = "pogo-event-card-wrapper";
                
                card.innerHTML = `
                    <div class="pogo-event-card" onclick="openEventDetails(${index})" style="cursor: pointer; transition: transform 0.2s;">
                        <div class="pogo-card-body">
                            <img src="${event.imageUrl || 'https://images.gameinfo.io/item/128/pokeball.png'}" 
                                 class="pogo-card-img" 
                                 onerror="this.src='https://images.gameinfo.io/item/128/pokeball.png'">
                            <div class="pogo-card-details">
                                <span class="pogo-badge" style="background-color: ${event.typeColor || '#FF3B30'}">${event.type}</span>
                                <div class="pogo-event-name">${event.name}</div>
                                <div class="pogo-event-time">${event.timeLabel}</div>
                            </div>
                        </div>
                        <div class="pogo-card-footer">
                            <span>Ends in:</span>
                            <span id="countdown-${index}" class="pogo-countdown-text">Calculating...</span>
                        </div>
                    </div>
                `;
                
                grid.appendChild(card);
            });

            if(timerInterval) clearInterval(timerInterval);

            timerInterval = setInterval(() => {
                data.forEach((event, index) => {
                    const timerElement = document.getElementById(`countdown-${index}`);
                    if (!timerElement) return;

                    const now = new Date().getTime();
                    const target = new Date(event.endTime).getTime();
                    const distance = target - now;

                    if (distance < 0) {
                        timerElement.innerText = "Event Ended";
                        timerElement.style.color = "#FF3B30";
                    } else {
                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

                        if (days > 0) {
                            timerElement.innerText = `${days}d ${hours}h ${minutes}m`;
                        } else {
                            timerElement.innerText = `${hours}h ${minutes}m`;
                        }
                        timerElement.style.color = "#007AFF"; 
                    }
                });
            }, 1000);
        })
        .catch(() => {
            if(grid) {
                grid.innerHTML = `<div style="color:#ff3e3e; font-size:12px; text-align:center; padding:10px;">⚠ Live Events Data is syncing...</div>`;
            }
        });
}

// వెబ్‌సైట్ లోపలే వివరాలు చూపించే ఫంక్షన్స్
function openEventDetails(index) {
    const event = globalEventsData[index];
    if(!event) return;

    document.getElementById('popEventImg').src = event.imageUrl || 'https://images.gameinfo.io/item/128/pokeball.png';
    
    const badge = document.getElementById('popEventBadge');
    badge.innerText = event.type;
    badge.style.backgroundColor = event.typeColor || '#FF3B30';
    
    document.getElementById('popEventName').innerText = event.name;
    document.getElementById('popEventTime').innerText = event.timeLabel;
    
    // కౌంట్‌డౌన్ ని బట్టి లైవ్ స్టేటస్ చూపించడం
    const countdownText = document.getElementById(`countdown-${index}`).innerText;
    const statusEl = document.getElementById('popEventStatus');
    statusEl.innerText = countdownText;
    statusEl.style.color = countdownText === "Event Ended" ? "#FF3B30" : "#007AFF";

    document.getElementById('eventDetailsPopup').style.display = 'flex';
}

function closeEventDetails() {
    document.getElementById('eventDetailsPopup').style.display = 'none';
}

function backToGamingMenu() {
    if(document.getElementById('pokemonEventsArea')) {
        document.getElementById('pokemonEventsArea').style.display = 'none';
    }
    const gamingZone = document.getElementById('gamingZoneArea');
    if(gamingZone) gamingZone.style.display = "block";
    document.getElementById('nav-title').innerText = "GAMING ZONE";
}

function closeGamingModal() {
    if(timerInterval) clearInterval(timerInterval); // మోడల్ మూసేసినప్పుడు బ్యాక్‌గ్రౌండ్ టైమర్ ఆపేస్తాం
    document.getElementById('gamingZoneModal').style.display = "none";
}

window.onload = () => {
    if (!localStorage.getItem('deva_db_v98')) {
        localStorage.setItem('deva_db_v98', JSON.stringify([]));
    }
    render();
    updateSidebar(); 
};