const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const url = 'mongodb://localhost:27017';
const dbName = 'NutriSuppOutlet';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Add product
app.post('/add-product', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected correctly to server");

        const db = client.db(dbName);
        const col = db.collection('product');

        const p = await col.insertOne(req.body);

        res.status(200).json({ insertedId: p.insertedId });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        await client.close();
    }
});

// Get products
app.get('/products', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection('product');

        const products = await col.find({ stock: { $gt: 0 } }).toArray(); // Filter products with stock > 0
        res.status(200).json(products);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        await client.close();
    }
});

// Edit product
app.put('/edit-product/:id', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection('product');

        const result = await col.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );

        res.status(200).json({ modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        await client.close();
    }
});

// Add to cart
app.put('/add-to-cart/:id', async (req, res) => {
    const productId = req.params.id;
    const { quantity } = req.body;

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection('product');

        const product = await col.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock.' });
        }

        const updatedStock = product.stock - quantity;

        const result = await col.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { stock: updatedStock } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ success: true, message: 'Item added to cart.' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update stock.' });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'An error occurred.' });
    } finally {
        await client.close();
    }
});

// Checkout
app.post('/checkout', async (req, res) => {
    const { productId, quantity } = req.body;

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection('product');

        const product = await col.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ error: 'Cannot checkout more than available stock' });
        }

        // Update stock quantity
        const newStock = product.stock - quantity;
        await col.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { stock: newStock } }
        );

        res.status(200).json({ message: `Checked out ${quantity} ${product.productName}(s)` });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        await client.close();
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
