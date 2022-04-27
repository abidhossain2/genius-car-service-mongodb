const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1]; 
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if(err){
            return res.status(403).send({message:'forbidden access'})
        }
        req.decoded = decoded;
        console.log('decoded', decoded);
        next()
    })
}

const res = require('express/lib/response');
const uri = `mongodb+srv://geniuscar:XxWUaaHW5CEJ1FX7@cluster0.mdywe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('genius').collection('service');
        const orderCollection = client.db('genius').collection('order');
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result)
        })

        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder)
            res.send(result)
        })

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })

        })

        app.get('/orders', verifyJWT, async (req, res) => {
            // const decodedEmail = req.decoded.email;
            const email = req.query.email;
            const query = { email };
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        //    if(email === decodedEmail){
        //    }else{
        //        res.status(403).send({message: 'Forbidden access'})
        //    }
        })

        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const deleteService = await serviceCollection.deleteOne(query)
            res.send(deleteService);
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Running genius server')
})

app.listen(port, () => {
    console.log('listening to port', port);
})
