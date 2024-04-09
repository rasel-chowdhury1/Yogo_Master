const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json())

//mongodb connection

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@yogo-master.dseedbw.mongodb.net/?retryWrites=true&w=majority&appName=yogo-master`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create a database and collections
    const database = client.db('yogo-master');
    const userCollection = database.collection("Users");
    const classesCollection = database.collection("Classes");
    const cartCollection = database.collection("Cart");
    const paymentsCollection = database.collection("Payments");
    const enrolledCollection = database.collection("Enrolled");
    const appliedCollection = database.collection("Applied");

    //classes routes here
    app.post('/new-class', (req,res) => {
        console.log('response -> ', req.body)
        const newClass = req.body;
        console.log('new class -> ', newClass)
        // res.status(200).send('post route hitted')
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);



app.get('', (req,res) => {
    res.send('Yoga master server is running!!!');
})

app.listen(port, (req,res) => {
    console.log(`Yoga master server is running on port ${port}`)
})