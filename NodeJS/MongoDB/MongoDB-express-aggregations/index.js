const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");

require("dotenv").config();

const app = express();
const PORT = +process.env.PORT || 5004;
const uri = process.env.URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.use(express.json());

app.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  const con = await client.connect();
  const db = con.db("NodeJS-demo");

  const user = await db.collection("users").findOne({ _id: ObjectId(id) });

  await con.close();

  res.send(user).end();
});

app.post("/collections", async (req, res) => {
  const { tableName } = req.body;

  if (!tableName) {
    return res.status(400).send({ message: "No table name provided." }).end();
  }

  try {
    const con = await client.connect();
    const db = con.db("NodeJS-demo");

    // await db.createCollection(tableName);
    await db.dropCollection(tableName);

    await con.close();
    res.status(201).end();
  } catch (error) {
    res.send({ message: error }).end();
  }
});

app.get("/products-analysis/:name", async (req, res) => {
  const name = req.params.name.trim().toLocaleLowerCase();

  const pipeline = [
    {
      $match: {
        // /^$ iPhone $/i
        // $regex = iPhone
        // $options = i

        name: {
          $regex: name,
          $options: "i",
        },
      },
    },
    {
      $group: {
        _id: "$isAvailable",
        totalPrice: { $sum: "$price" },
      },
    },
    {
      $sort: {
        totalPrice: -1,
      },
    },
  ];

  try {
    const docs = [];
    const con = await client.connect();
    const db = con.db("NodeJS-demo");
    const collection = db.collection("products");

    // aktualiausia dalis studentams. su distinct nereikia WHERE. ; // gauk unikalias reiksmes
    const prices = await collection.distinct(
      "price"
      //{ price: 14,}
    );

    // pasikartojantys atvejai paliekami
    // const foundPrices = await collection.find({ price: 14 }).toArray();
    // console.log({ foundPrices });

    const availableProductsCount = await collection.count({
      isAvailable: false,
    });

    const aggregationCursor = collection.aggregate(pipeline);

    for await (const doc of aggregationCursor) {
      docs.push(doc);
    }

    await con.close();

    res.send({ docs, prices, availableProductsCount }).end();
  } catch (error) {
    res.status(500).send({ error }).end();
    return console.error(err);
  }
});

app.listen(PORT, async () => {
  console.log(`server is running on ${PORT}`);
});
