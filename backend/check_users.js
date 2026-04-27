const { MongoClient } = require('mongodb');

async function checkUsers() {
    const uri = "mongodb+srv://user:jU5WNBcw3dO3G3BL@cluster0.v6wxgah.mongodb.net/smart_campus_db";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('smart_campus_db');
        const users = await db.collection('users').find({}, { projection: { campusId: 1, status: 1 } }).toArray();
        
        console.log("--- ALL USERS STATUS ---");
        users.forEach(u => {
            console.log(`[${u.campusId}] Status: "${u.status}"`);
        });

        const lockedCount = users.filter(u => u.status === 'LOCKED').length;
        console.log("\nFound " + lockedCount + " users with status 'LOCKED' (exact match).");
        
        const caseInsensitiveCount = users.filter(u => u.status && u.status.toString().toUpperCase() === 'LOCKED').length;
        console.log("Found " + caseInsensitiveCount + " users with status 'LOCKED' (case-insensitive).");

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkUsers();
