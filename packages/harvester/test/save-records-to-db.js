import {
    MongoClient
} from 'mongodb'

const url = 'mongod://localhost:27017'
const dbName = 'corvee'

export async function saveToDb(data) {
    const client = new MongoClient(url)

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const db = client.db(dbName);

        // Get the removes collection
        const col = db.collection('links');

        await col.deleteMany({})

        await col.insertMany(data)

    } catch (err) {
        console.log(err.stack);
    }

    // Close connection
    client.close();
}