// بيانات تجريبية للاختبار
const sampleData = {
    servers: [
        { id: '1', name: 'سيرفر التطوير', memberCount: 3, totalPoints: 430 },
        { id: '2', name: 'سيرفر الدعم', memberCount: 2, totalPoints: 170 }
    ],
    members: {
        '1': [
            { id: '1', username: 'أحمد', points: 150, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' },
            { id: '2', username: 'محمد', points: 80, avatar: 'https://cdn.discordapp.com/embed/avatars/1.png' },
            { id: '3', username: 'فاطمة', points: 200, avatar: 'https://cdn.discordapp.com/embed/avatars/2.png' }
        ]
    }
};

// إدارة الصفحات
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// تسجيل الدخول
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('login-code').value;
    
    if (code === 'xdr4xdr4') {
        showPage('dashboard-page');
        loadServers();
    } else {
        alert('كود الدخول غير صحيح!');
    }
});

// تحميل السيرفرات
function loadServers() {
    const grid = document.getElementById('servers-grid');
    grid.innerHTML = '';

    sampleData.servers.forEach(server => {
        const serverCard = document.createElement('div');
        serverCard.className = 'server-card';
        serverCard.innerHTML = `
            <h3>${server.name}</h3>
            <p>${server.memberCount} أعضاء - ${server.totalPoints} نقطة</p>
        `;
        
        serverCard.addEventListener('click', () => {
            document.getElementById('current-server-name').textContent = server.name;
            loadMembers(server.id);
            showSection('members-section');
        });
        
        grid.appendChild(serverCard);
    });
}

// تحميل الأعضاء
function loadMembers(serverId) {
    const membersList = document.getElementById('members-list');
    const members = sampleData.members[serverId] || [];
    
    membersList.innerHTML = '';

    members.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div>
                <strong>${member.username}</strong>
                <br>
                <span>${member.points} نقطة</span>
            </div>
            <button onclick="editPoints('${member.id}', '${member.username}', ${member.points})">
                تعديل
            </button>
        `;
        membersList.appendChild(memberItem);
    });
}

function editPoints(memberId, username, points) {
    alert(`تعديل نقاط ${username} - النقاط الحالية: ${points}`);
}

// العودة للسيرفرات
document.getElementById('back-to-servers').addEventListener('click', () => {
    showSection('servers-section');
});

// تسجيل الخروج
document.getElementById('logout-btn').addEventListener('click', () => {
    showPage('login-page');
});

// التهيئة
document.addEventListener('DOMContentLoaded', () => {
    showPage('login-page');
});
