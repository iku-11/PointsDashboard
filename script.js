// بدل sampleData، استخدم API حقيقي
class PellaAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async getServers() {
        const response = await fetch(`${this.baseURL}/api/servers`, {
            headers: {
                'x-api-secret': 'pella_secret_2024'
            }
        });
        return await response.json();
    }

    async getMembers(guildId) {
        const response = await fetch(`${this.baseURL}/api/servers/${guildId}/members`, {
            headers: {
                'x-api-secret': 'pella_secret_2024'
            }
        });
        return await response.json();
    }
}

// استخدم API حقيقي بدل البيانات الوهمية
async function loadRealServers() {
    const api = new PellaAPI('https://your-bot-url.com');
    const servers = await api.getServers();
    
    // اعرض السيرفرات الحقيقية
    servers.forEach(server => {
        // ... نفس الكود لكن ببيانات حقيقية
    });
}
