const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleWire
require("dotenv").config();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.qhvkztn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client
      .db("bistro-restaurant")
      .collection("bistroMenu");
    const usersCollection = client
      .db("bistro-restaurant")
      .collection("bistroUsers");
    const reviewCollection = client
      .db("bistro-restaurant")
      .collection("bistro-Review");
    const cartCollection = client
      .db("bistro-restaurant")
      .collection("bistroCarts");

app.post ('/users', async(req, res)=> {
  const user = req.body;
  const query = {email: user.email}
  const existingUser = usersCollection.findOne(query)
  if(existingUser){
    return res.send({message: 'user already exists'})
  }
  const result = await usersCollection.insertOne(user)
  res.send(result)
})

app.get('/users', async(req, res)=> {
  const result = await usersCollection.find().toArray()
  res.send(result)
})

// updated user role
app.patch('/users/admin/:id', async(req, res)=> {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const updateDoc = {
    $set: {
      role: 'admin'
    },
  }
  const result = await usersCollection.updateOne(query, updateDoc)
  res.send(result)
})

// menu apis
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });
    // review API
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    // cart collection apis

    app.get('/carts', async(req, res)=> {
      const email = req.query.email;
      if(!email){
        return []
      }
      else{
        const query = {email: email}
        const result = await cartCollection.find(query).toArray()
        res.send(result)
      }

    })
    app.post("/carts", async (req, res) => {
      const doc = req.body;
      const result = await cartCollection.insertOne(doc);
      res.send(result);
    });

    app.delete('/carts/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("bistro restaurant is idle");
});

app.listen(port, () => {
  console.log(`bistro restaurant is running on ${port}`);
});
