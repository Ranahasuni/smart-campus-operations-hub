const { MongoClient, ObjectId } = require('mongodb');

async function checkMissing() {
    const uri = "mongodb+srv://user:jU5WNBcw3dO3G3BL@cluster0.v6wxgah.mongodb.net/smart_campus_db";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('smart_campus_db');
        
        const bookings = await db.collection('bookings').find({}).toArray();
        const resourceIdsFromBookings = new Set();
        bookings.forEach(b => {
            if (b.resourceIds) b.resourceIds.forEach(id => resourceIdsFromBookings.add(id));
        });

        console.log(`Checking ${resourceIdsFromBookings.size} unique resource IDs found in bookings...`);

        const resources = await db.collection('resources').find({}).toArray();
        const existingResourceIds = new Set(resources.map(r => r._id.toString()));

        const missing = Array.from(resourceIdsFromBookings).filter(id => !existingResourceIds.has(id.toString()));
        
        if (missing.length > 0) {
            console.log("\n--- ORPHANED RESOURCE IDS (Exist in Bookings but not in Resources) ---");
            missing.forEach(id => console.log(id));
            
            console.log("\nSample Bookings with these IDs:");
            const samples = bookings.filter(b => b.resourceIds && b.resourceIds.some(rid => missing.includes(rid)));
            samples.slice(0, 3).forEach(s => console.log(`Booking ID: ${s._id} | Purpose: ${s.purpose} | IDs: ${s.resourceIds}`));
        } else {
            console.log("No orphaned resource IDs found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkMissing();
