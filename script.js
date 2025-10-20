// إعدادات API
const API_SECRET = "pella_secret_2024"; // نفس السر في البوت!

class PellaAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-secret': API_SECRET,
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`خطأ في API: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getServers() {
        return await this.request('/api/servers');
    }

    async getMembers(guildId) {
        return await this.request(`/api/servers/${guildId}/members`);
    }

    async getStats(guildId) {
        return await this.request(`/api/servers/${guildId}/stats`);
    }

    async updatePoints(guildId, userId, action, amount) {
        return await this.request(`/api/servers/${guildId}/members/${userId}/points`, {
            method: 'POST',
            body: JSON.stringify({ action, amount })
        });
    }

    async testConnection() {
        try {
            await this.getServers();
            return { success: true, message: 'الاتصال ناجح مع البوت' };
        } catch (error) {
            return { success: false, message: 'فشل الاتصال: ' + error.message };
        }
    }
}

// حالة التطبيق
let appState = {
    api: null,
    currentServerId: null,
    currentMemberId: null
};

// إدارة الصفحات
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    if (connected) {
        statusEl.innerHTML = '<i class="fas fa-circle"></i> متصل';
        statusEl.className = 'status-online';
    } else {
        statusEl.innerHTML = '<i class="fas fa-circle"></i> غير متصل';
        statusEl.className = 'status-offline';
    }
}

// تسجيل الدخول
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('login-code').value;
    const apiUrl = document.getElementById('api-url').value;
    const messageEl = document.getElementById('login-message');

    if (code !== 'xdr4xdr4') {
        messageEl.textContent = 'كود الدخول غير صحيح!';
        messageEl.className = 'message error';
        return;
    }

    if (!apiUrl) {
        messageEl.textContent = 'يرجى إدخال رابط API!';
        messageEl.className = 'message error';
        return;
    }

    try {
        messageEl.textContent = 'جاري الاتصال بالبوت...';
        messageEl.className = 'message';

        appState.api = new PellaAPI(apiUrl);
        const testResult = await appState.api.testConnection();

        if (testResult.success) {
            localStorage.setItem('pella_api_url', apiUrl);
            showPage('dashboard-page');
            updateConnectionStatus(true);
            loadServers();
        } else {
            messageEl.textContent = testResult.message;
            messageEl.className = 'message error';
        }
    } catch (error) {
        messageEl.textContent = 'فشل الاتصال بالبوت: ' + error.message;
        messageEl.className = 'message error';
    }
});

// تسجيل الخروج
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('pella_api_url');
    appState.api = null;
    showPage('login-page');
    updateConnectionStatus(false);
});

// فحص الاتصال
async function testConnection() {
    if (!appState.api) return;
    
    const result = await appState.api.testConnection();
    alert(result.message);
    updateConnectionStatus(result.success);
}

// تحميل السيرفرات
async function loadServers() {
    const grid = document.getElementById('servers-grid');
    const loading = document.getElementById('loading-servers');
    
    grid.innerHTML = '';
    loading.style.display = 'block';

    try {
        const servers = await appState.api.getServers();
        loading.style.display = 'none';

        if (servers.length === 0) {
            grid.innerHTML = '<div class="no-data">لا توجد سيرفرات متاحة</div>';
            return;
        }

        servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            serverCard.innerHTML = `
                <i class="fas fa-server"></i>
                <h3>${server.name}</h3>
                <p>إدارة نقاط الأعضاء في هذا السيرفر</p>
                <div class="server-stats">
                    <div class="stat">
                        <i class="fas fa-users"></i>
                        <span>${server.memberCount} أعضاء</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-coins"></i>
                        <span>${server.totalPoints} نقطة</span>
                    </div>
                </div>
            `;
            
            serverCard.addEventListener('click', () => {
                appState.currentServerId = server.id;
                document.getElementById('current-server-name').textContent = server.name;
                loadMembers(server.id);
                showSection('members-section');
            });
            
            grid.appendChild(serverCard);
        });
    } catch (error) {
        loading.style.display = 'none';
        grid.innerHTML = `<div class="error">خطأ في تحميل السيرفرات: ${error.message}</div>`;
    }
}

// تحميل الأعضاء
async function loadMembers(guildId) {
    const membersList = document.getElementById('members-list');
    const loading = document.getElementById('loading-members');
    
    membersList.innerHTML = '';
    loading.style.display = 'block';

    try {
        const [members, stats] = await Promise.all([
            appState.api.getMembers(guildId),
            appState.api.getStats(guildId)
        ]);

        loading.style.display = 'none';

        // تحديث الإحصائيات
        document.getElementById('total-members').textContent = stats.totalMembers;
        document.getElementById('total-points').textContent = stats.totalPoints;
        document.getElementById('average-points').textContent = stats.averagePoints;

        if (members.length === 0) {
            membersList.innerHTML = '<div class="no-data">لا يوجد أعضاء في هذا السيرفر</div>';
            return;
        }

        members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <div class="member-info">
                    <img src="${member.avatar}" alt="Avatar" class="member-avatar">
                    <div class="member-details">
                        <h4>${member.username}</h4>
                        <p>ID: ${member.id}</p>
                    </div>
                </div>
                <div class="member-actions">
                    <div class="member-points">${member.points} AC🪙</div>
                    <button class="btn-primary" onclick="openPointsModal('${member.id}', '${member.username}', '${member.avatar}', ${member.points})">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                </div>
            `;
            membersList.appendChild(memberItem);
        });
    } catch (error) {
        loading.style.display = 'none';
        membersList.innerHTML = `<div class="error">خطأ في تحميل الأعضاء: ${error.message}</div>`;
    }
}

// إدارة النقاط
function openPointsModal(memberId, username, avatar, currentPoints) {
    document.getElementById('modal-avatar').src = avatar;
    document.getElementById('modal-username').textContent = username;
    document.getElementById('modal-current-points').textContent = `النقاط الحالية: ${currentPoints} AC🪙`;
    
    appState.currentMemberId = memberId;
    
    document.getElementById('add-amount').value = '';
    document.getElementById('remove-amount').value = '';
    document.getElementById('set-amount').value = '';
    
    openModal('points-modal');
}

async function modifyPoints(action) {
    const amountInput = document.getElementById(`${action}-amount`);
    const amount = parseInt(amountInput.value);

    if (!amount || amount <= 0) {
        alert('يرجى إدخال رقم صحيح موجب');
        return;
    }

    try {
        const result = await appState.api.updatePoints(
            appState.currentServerId,
            appState.currentMemberId,
            action,
            amount
        );

        alert(result.message);
        closeModal('points-modal');
        loadMembers(appState.currentServerId);
    } catch (error) {
        alert('خطأ في تعديل النقاط: ' + error.message);
    }
}

// البحث في الأعضاء
document.getElementById('member-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const memberItems = document.querySelectorAll('.member-item');
    
    memberItems.forEach(item => {
        const username = item.querySelector('.member-details h4').textContent.toLowerCase();
        if (username.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// العودة للسيرفرات
document.getElementById('back-to-servers').addEventListener('click', () => {
    showSection('servers-section');
});

// التهيئة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    const savedApiUrl = localStorage.getItem('pella_api_url');
    if (savedApiUrl) {
        document.getElementById('api-url').value = savedApiUrl;
    }
});

// إغلاق المودال عند النقر خارج المحتوى
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
