const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.one90zt.mongodb.net/?retryWrites=true&w=majority`;

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

    const addToyCollection = client.db('toyCar').collection('addtoy');

    // add toy
    app.post('/addtoy', async (req, res) => {
      const addtoy = req.body;
      console.log(addtoy);
      const result = await addToyCollection.insertOne(addtoy);
      res.send(result);
    })

    // get all toy
    app.get('/alltoys', async (req, res) => {
      const cursor = addToyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result)
    })

    // specific toy by id
    app.get('/alltoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addToyCollection.findOne(query);
      res.send(result);
    })

    // get specifig user data
    app.get('/mytoys', async (req, res) => {
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail }
      }
      const result = await addToyCollection.find(query).sort({price: 1}).toArray();
      res.send(result)
    })

    // ----------
    app.get('/mytoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addToyCollection.findOne(query);
      res.send(result);
    })

    // create api for delete operation
    app.delete('/mytoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addToyCollection.deleteOne(query);
      res.send(result);
    })

    // create api for Update Operation
    app.put('/mytoys/:id', async (req, res) => {
      const id = req.params.id;
      const updateToy = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const toy = {
        $set: {
          pictureURL: updateToy.pictureURL,
          name: updateToy.name,
          sellerName: updateToy.sellerName,
          sellerEmail: updateToy.sellerEmail,
          availableQuantity: updateToy.availableQuantity,
          subCategory: updateToy.subCategory,
          price: updateToy.price,
          rating: updateToy.rating,
          detailDescription: updateToy.detailDescription
        }
      }

      const result = await addToyCollection.updateOne(filter, toy, options);
      res.send(result)

    })

    // Shop By Category
    app.get('/toy', async (req, res) => {
      const result = await addToyCollection.find({}).toArray();
      res.send(result);
    })

    app.post('/toy', async (req, res) => {
      const body = req.body;
      const result = await addToyCollection.insertOne(body)
      res.send(result)
    })

    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addToyCollection.findOne(query);
      res.send(result);
    })

    // Implement Search Option
    const indexKeys = {
      name: 1
    };
    const indexOptions = {
      name: "name"
    };

    const result = await addToyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toySearchName/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await addToyCollection.find({
        $or: [{
          name: {
            $regex: searchText,
            $options: "i"
          }
        }],
      }).toArray()

      res.send(result);
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


app.get('/', (req, res) => {
  res.send('toy hut server is running')
})

app.listen(port, () => {
  console.log(`Toy hut server is running on port: ${port}`);
})