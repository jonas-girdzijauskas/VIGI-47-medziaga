import {config } from 'dotenv'
import mysql from 'mysql2/promise'
import express from 'express'

config()
const app = express();

app.use(express.json());

const PORT = 5_004;

const MYSQL_CONFIG =
  "mysql://doadmin:AVNS_NUuqrkPXkO-dQBID1J8@codeacademy-trial-cluster-do-user-13048067-0.b.db.ondigitalocean.com:25060/defaultdb";

app.post("/users", async (req, res) => {
  const { firstName } = req.body;

  const fn = mysql.escape(firstName).replaceAll("'", '')

  if (typeof firstName !== "string" || !firstName) {
    return res
      .status(400)
      .send(`Incorrect firstName provided: ${firstName}`)
      .end();
  }

  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);

    const usersByFirstName = await con.execute(
      `SELECT * FROM users WHERE firstName='${fn}'`
      // `SELECT * FROM users WHERE firstName='${mysql.escape(firstName)}'`
    )
    // POST localhost:5004/users body firstName: foo' OR '1=1

    // KAS SIUNCIAMA I DUOMENU BAZE:
    // SELECT * FROM users WHERE firstName='foo' OR '1=1'
    console.log(`SELECT * FROM users WHERE firstName='${fn}'`);

    await con.end();

    res.send(usersByFirstName[0]).end();
  } catch (err) {
    res.status(500).send(err).end(); // ir 400, ir 500 tinkamas
    return console.error(err);
  }
});

app.get("/user/:id", async (req, res) => {
  const id = +req.params.id.trim();
  console.log({ id });
  if (id < 0 || Number.isNaN(id) || typeof id !== "number") {
    return res
      .status(400)
      .send({
        error: `Please provide a proper id in the URL: current id ${id} incorrect.`,
      })
      .end();
  }

  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);

    const result = await con.execute(`SELECT * FROM users WHERE id=${id}`);

    await con.end();

    console.log(result);

    res.send(result[0]).end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
});

app.post("/table", async (req, res) => {
  const name = req.body?.name.trim();

  if (!name) {
    return res.status(400).send(`Incorrect table name provided: ${name}`).end();
  }

  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);

    const result = await con.execute(
      `CREATE table ${name}(id int NOT NULL AUTO_INCREMENT, firstName varchar(35), PRIMARY KEY (id))`
    );

    await con.end();

    console.log(result);
    res.status(201).send("Table successfully created").end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
});

app.delete("/table", async (req, res) => {
  const name = req.body?.name?.trim();

  if (!name) {
    return res.status(400).send(`Incorrect table name provided: ${name}`).end();
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);

    await con.execute(`DROP table ${name}`);

    await con.end();

    res.status(202).send("Table successfully dropped").end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
});

app.post("/user", async (req, res) => {
  const firstName = req.body?.firstName?.trim();

  // console.log(mysql.escape(firstName));

  // console.log({
  //   pateikta: firstName,
  //   escaped: mysql.escape(firstName),
  // });

  // console.log('Welcome to my page! Let\'s work together!')

  if (!firstName) {
    // imanoma prideti ilgio patikra, paprastam pavyzdy nebutina
    return res
      .status(400)
      .send(`Incorrect firstName provided: ${firstName}.`)
      .end();
  }

  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);

    await con.execute(`INSERT INTO users (firstName) VALUES ("${firstName}")`);
    
    await con.end();

    res.status(201).send("User successfully created").end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
