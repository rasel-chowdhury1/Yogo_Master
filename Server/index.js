const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion ,  ObjectId } = require('mongodb');
// Stripe 
// This is your test secret API key.
const stripe = require("stripe")(process.env.PAYMENT_SECRET);
var jwt = require('jsonwebtoken');

//middleware
app.use(cors());
app.use(express.json())

    // Routes
    // SET TOKEN .
    const verifyJWT = (req, res, next) => {
      const authorization = req.headers.authorization;
      if (!authorization) {
          return res.status(401).send({ error: true, message: 'Unauthorize access' })
      }
      const token = authorization?.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
          if (err) {
              return res.status(403).send({ error: true, message: 'forbidden user or token has expired' })
          }
          req.decoded = decoded;
          next()
      })
    }

//mongodb connection

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
    const userCollection = database.collection("users");
    const classesCollection = database.collection("Classes");
    const cartCollection = database.collection("Cart");
    const paymentsCollection = database.collection("Payments");
    const enrolledCollection = database.collection("Enrolled");
    const appliedCollection = database.collection("Applied");


    //routes for users
    app.post('/new-user', async(req,res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result)
    })

    app.post('/api/set-token', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '24h' })
      res.send({ token })
  })

  //middleware for admin and instructor
  const verifyAdmin = async (req, res, next) =>{
    const email = req.decoded.email;
    const query = {email: email};
    const user = await userCollection.findOne(query);
    if(user.role === 'admin'){
      next()
    }
    else{
      return res.status(401).send({message: "Unauthorized access"})
    }
  }

  const verifyInstructor = async (req, res, next) =>{
    const email = req.decoded.email;
    const query = {email: email};
    const user = await userCollection.findOne(query);
    if(user.role === 'instructor'){
      next()
    }
    else{
      return res.status(401).send({message: "Unauthorized access"})
    }
  }


    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.get('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.get('/user/:email', verifyJWT, async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await userCollection.findOne(query);
      res.send(result)
    })

    app.delete('/delete-user/:id', verifyJWT, verifyAdmin, async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

    // UPDATE USER
      app.put('/update-user/:id', verifyJWT, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.option,
                address: updatedUser.address,
                phone: updatedUser.phone,
                about: updatedUser.about,
                photoUrl: updatedUser.photoUrl,
                skills: updatedUser.skills ? updatedUser.skills : null,
            }
        }
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })


    //classes routes here
    app.post('/new-class', verifyJWT, verifyInstructor, async(req,res) => {
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
    app.get('/classes/:email', verifyJWT, verifyInstructor, async(req,res) => {
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

    // update classes status and reason
    app.patch('/change-status/:id', verifyJWT, verifyAdmin, async(req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true};
      const updateDoc = {
        $set: {
          status: status,
          reason: reason,
        }
      }

      const result = await classesCollection.updateOne(filter, updateDoc, options);
      console.log('update result -> ',result)
      res.send(result)
    })

    //get approved classes
    app.get('/approved-classes', async(req, res) => {
      const query = {status: 'approved'};
      const result = await classesCollection.find(query).toArray()
      console.log('approved classes -> ', result);
      res.send(result);
    } )

    // get single class details
    app.get('/single/:id', async(req, res) => {
       const id = req.params.id;
       const query = {_id: new ObjectId(id)};
       const result = await classesCollection.find(query).toArray();
       console.log('single details -> ', result);
       res.send(result)
    })

    // update class details(all data)
    app.put('/update-class/:id', verifyJWT, verifyInstructor, async (req, res) => {
      const id = req.params.id;
      const updateClass = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true};
      const updateDoc = {
        $set: {
          name: updateClass.name,
          description: updateClass.description,
          price: updateClass.price,
          availableSeats: parseInt(updateClass.availableSeats),
          videoLink: updateClass.videoLink,
          status: updateClass.status,
        }
      }

      const result = await classesCollection.updateOne(filter,updateDoc, options);
      res.send(result)
    })

    // Cart Routes
    app.post('/add-to-cart', verifyJWT, async(req, res) =>{
      const newCartItem = req.body;
      const result = await cartCollection.insertOne(newCartItem);
      console.log('cart result -> ',result)
      res.send(result)
    })

    // get cart item by classId
    app.get('/cart-item/:id', verifyJWT, async(req, res) => {
      const id = req.params.id;
      const email = req.body.email;
      const query = {
        classId: id,
        email: email
      }

      const projection = {classId: 1};
      const result = await cartCollection.findOne(query, {projection: projection});
      res.send(result);
    })

    // cart info by user email
    app.get('/cart/:email', verifyJWT, async(req, res) => {
      const email = req.params.email;
      const query = {email : email};
      console.log('query -> ',query)
      const projection = {classId: 1};
      const carts = await cartCollection.find(query, {projection: projection}).toArray();
      console.log('carts data -> ',carts)
      const classIds = carts.map(cart => new ObjectId(cart.classId));
      console.log('classIds -> ',classIds)
      const query2 = {_id: {$in: classIds}};
      console.log('query 2 -> ',query2)
      const result = await classesCollection.find(query2).toArray();
      console.log('result -> ',result)
      res.send(result);
    })

    // delete cart item
    app.delete('/delete-cart-item/:id', verifyJWT, async(req, res) => {
      const id = req.params.id;
      const query = {classId: id};
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })

     // PAYMENT ROUTES
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
      });
      res.send({
          clientSecret: paymentIntent.client_secret
      });
  })

  // POST PAYMENT INFO 
    app.post('/payment-info', verifyJWT, async (req, res) => {
      const paymentInfo = req.body;
      const classesId = paymentInfo.classesId;
      const userEmail = paymentInfo.userEmail;
      const singleClassId = req.query.classId;
      let query;
      // const query = { classId: { $in: classesId } };
      if (singleClassId) {
          query = { classId: singleClassId, userMail: userEmail };
      } else {
          query = { classId: { $in: classesId } };
      }

      const classesQuery = { _id: { $in: classesId.map(id => new ObjectId(id)) } }
      const classes = await classesCollection.find(classesQuery).toArray();
      const newEnrolledData = {
          userEmail: userEmail,
          classesId: classesId.map(id => new ObjectId(id)),
          transactionId: paymentInfo.transactionId,
      }
      const updatedDoc = {
          $set: {
              totalEnrolled: classes.reduce((total, current) => total + current.totalEnrolled, 0) + 1 || 0,
              availableSeats: classes.reduce((total, current) => total + current.availableSeats, 0) - 1 || 0,
          }
      }
      // const updatedInstructor = await userCollection.find()
      const updatedResult = await classesCollection.updateMany(classesQuery, updatedDoc, { upsert: true });
      const enrolledResult = await enrolledCollection.insertOne(newEnrolledData);
      const deletedResult = await cartCollection.deleteMany(query);
      const paymentResult = await paymentsCollection.insertOne(paymentInfo);
      res.send({ paymentResult, deletedResult, enrolledResult, updatedResult });
  })

    //get payment history
      app.get('/payment-history/:email', async (req, res) => {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await paymentsCollection.find(query).sort({ date: -1 }).toArray();
        res.send(result);
    })

    //payment history length
      app.get('/payment-history-length/:email', async (req, res) => {
        const email = req.params.email;
        const query = { userEmail: email };
        const total = await paymentsCollection.countDocuments(query);
        res.send({ total });
    })
   

    //Enrollment Routes
    app.get("/popular_classes", async(req, res) => {
      const result = await classesCollection.find().sort({totalEnrolled: -1}).limit(6).toArray();
      res.send(result);
    })

    app.get('/popular-instructors', async (req, res) => {
      const pipeline = [
          {
              $group: {
                  _id: "$instructorEmail",
                  totalEnrolled: { $sum: "$totalEnrolled" },
              }
          },
          {
              $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "email",
                  as: "instructor"
              }
          },
          {
            $match: {
              "instructor.role": "instructor", 
            }
          },
          {
              $project: {
                  _id: 0,
                  instructor: {
                      $arrayElemAt: ["$instructor", 0]
                  },
                  totalEnrolled: 1
              }
          },
          {
              $sort: {
                  totalEnrolled: -1
              }
          },
          {
              $limit: 6
          }
      ]
      const result = await classesCollection.aggregate(pipeline).toArray();
      res.send(result);

  })



    //admin stats
    app.get('/admin-stats', verifyJWT, verifyAdmin, async (req, res) => {
      // Get approved classes and pending classes and instructors 
      const approvedClasses = (await classesCollection.find({ status: 'approved' }).toArray()).length;
      const pendingClasses = (await classesCollection.find({ status: 'pending' }).toArray()).length;
      const instructors = (await userCollection.find({ role: 'instructor' }).toArray()).length;
      const totalClasses = (await classesCollection.find().toArray()).length;
      const totalEnrolled = (await enrolledCollection.find().toArray()).length;
      // const totalRevenue = await paymentCollection.find().toArray();
      // const totalRevenueAmount = totalRevenue.reduce((total, current) => total + parseInt(current.price), 0);
      const result = {
          approvedClasses,
          pendingClasses,
          instructors,
          totalClasses,
          totalEnrolled,
          // totalRevenueAmount
      }
      res.send(result);

   })

   // !GET ALL INSTrUCTOR  
   app.get('/instructors', async (req, res) => {
    const result = await userCollection.find({ role: 'instructor' }).toArray();
    res.send(result);
    })

    app.get('/enrolled-classes/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const pipeline = [
          {
              $match: query
          },
          {
              $lookup: {
                  from: "classes",
                  localField: "classesId",
                  foreignField: "_id",
                  as: "classes"
              }
          },
          {
              $unwind: "$classes"
          },
          {
              $lookup: {
                  from: "users",
                  localField: "classes.instructorEmail",
                  foreignField: "email",
                  as: "instructor"
              }
          },
          {
              $project: {
                  _id: 0,
                  classes: 1,
                  instructor: {
                      $arrayElemAt: ["$instructor", 0]
                  }
              }
          }

      ]
      const result = await enrolledCollection.aggregate(pipeline).toArray();
      // const result = await enrolledCollection.find(query).toArray();
      res.send(result);
  })

    // Appliend route 
        app.post('/as-instructor', async (req, res) => {
          const data = req.body;
          const result = await appliedCollection.insertOne(data);
          res.send(result);
      })

      app.get('/applied-instructors/:email',   async (req, res) => {
          const email = req.params.email;
          const result = await appliedCollection.findOne({email});
          res.send(result);
      });


  
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