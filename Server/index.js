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
    app.post('/new-class', async(req,res) => {
        const newClass = req.body;
        // newClass.availableSeats = parseInt(newClass.availableSeats);
        const result = await classesCollection.insertOne(newClass);
        res.send(result)
    })

    app.get('/classes', async(req, res) => {
      const query = {status: 'approved'};
      const result = await classesCollection.find().toArray()
      console.log(result)
      res.send(result)
    })

    //get classes by instructor email address
    app.get('/classes/:email', async(req,res) => {
      const email = req.params.email;
      const query = {instructorEmail: email};
      const result = await classesCollection.find(query).toArray();
      res.send(result)
    })

    //manage classes
    app.get('/classes-manage', async(req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    // update classes
    app.put('/change-status/:id', async(req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('', (req,res) => {
    res.send('Yoga master server is running!!!');
})

app.listen(port, (req,res) => {
    console.log(`Yoga master server is running on port ${port}`)
})