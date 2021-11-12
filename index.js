const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5000
//middele ware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6uzmb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
  try {
    await client.connect();
    const database = client.db("bike-store");
    const bikeCollection = database.collection("bikes");
    const purchaseCollection = database.collection("orderlist");
    const reviewCollection = database.collection("reviewlist");
    const userCollection = database.collection("userlist");

    // get services api
    app.get('/bikes', async (req, res) => {
      const cursor = bikeCollection.find({});
      const services = await cursor.toArray()
      res.send(services)
    })

    //// add servcies api

    app.post('/addproducts', async (req, res) => {
      const product = req.body
      const result = await bikeCollection.insertOne(product)
      res.json(result)
      console.log(result)
    })


    /// OrderApi///
    app.post('/purchase', async (req, res) => {

      purchaseCollection.insertOne(req.body).then(data => {
        res.json(data)

      })

    })



    ////Products delete api///
    app.delete('/deleteproducts/:id',async(req,res)=>{
      const id = req.params.id;

      const query = { _id: ObjectId(id) }
      const result = await bikeCollection.deleteOne(query)
      res.json(result)
    })

    ////////////


    ////my orders

    app.get('/purchaseorders', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const cursor = purchaseCollection.find(query);
      const purchase = await cursor.toArray()
      res.send(purchase)

    })



    //// all orders//
    app.get('/allorders', async (req, res) => {
      const cursor = purchaseCollection.find({});
      const services = await cursor.toArray()
      res.send(services)
    })

    ///// delete all orders////
    app.delete('/deleteorders/:id', async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) }
      const result = await purchaseCollection.deleteOne(query)
      res.json(result)

    })


    //////update customer order status/////


    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const updateinfo = req.body.status
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };



      const result = await purchaseCollection.updateOne(filter, { $set: { status: "shipped" } });
      res.send(result);

      console.log(result);


    })






    //delete my orders
    app.delete('/deleteorder/:id', async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) }
      const result = await purchaseCollection.deleteOne(query)
      res.json(result)

    })

    ////post review
    app.post('/review', async (req, res) => {
      reviewCollection.insertOne(req.body).then(data => {
        res.json(data)

      })

    })


    ///get all review//
    app.get('/allreview', async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray()
      res.send(review)

    })

    /////post uses to database
    app.post('/users', async(req, res) => {
        const user =req.body
        const result=await userCollection.insertOne(user)
        console.log(result)
        res.json(result)
    

      })



  

    ///// make admin 
    app.put('/users/admin', async (req, res) => {
      const user = req.body
      console.log("put", user)
      const filter = { email: user.email };
      const updatedoc = { $set: { role: "admin" } }
      const result = await userCollection.updateOne(filter, updatedoc)
      res.json(result)
    })
    /////// admin verified///
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let isadmin = false
      if (user?.role === "admin") {
        isadmin = true
      }
      res.json({ admin: isadmin })
    })









  } finally {
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})