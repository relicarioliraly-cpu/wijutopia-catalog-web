const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'wijutopia_db';

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db;

const ensureIndexes = async () => {
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    const restockRequests = db.collection('restock_requests');
    await restockRequests.createIndex(
        { product_id: 1, customer_email: 1, season_key: 1 },
        { unique: true, partialFilterExpression: { customer_email: { $exists: true } } }
    );

    const interestStats = db.collection('product_interest_stats');
    await interestStats.createIndex({ product_id: 1, season_key: 1 }, { unique: true });

    const clickAnalytics = db.collection('click_analytics');
    await clickAnalytics.createIndex({ element_identifier: 1 }, { unique: true });
};

const connect = async () => {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        await ensureIndexes();
    }
    return db;
};

const collection = (name) => {
    if (!db) {
        throw new Error('MongoDB no está conectado. Llama a connect() antes de usar collection().');
    }
    return db.collection(name);
};

const objectId = (value) => {
    if (!value) return null;
    return typeof value === 'string' && ObjectId.isValid(value) ? new ObjectId(value) : value;
};

module.exports = {
    connect,
    collection,
    objectId
};
