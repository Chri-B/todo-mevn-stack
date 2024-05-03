var Express = require("express");
const { MongoClient } = require("mongodb");
var cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer(); // for parsing multipart/form-data

var app = Express();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const CONNECTION_STRING = "mongodb://localhost:27017/";
const DATABASENAME = "todoappdb";
var database;

app.listen(5039, () => {
  connect_db().catch(console.error);
});

app.get("/api/todoapp/GetNotes", async (request, response) => {
  const res = await database.collection("todoappcollection").find({}).toArray();
  response.send(res);
});
app.post("/api/todoapp/AddNote", upload.array(), async (req, res) => {
  const numOfDocs = await database.collection("todoappcollection").count({}, (error, numOfDocs) => {
    return numOfDocs;
  });
  if (req.body.newNotes) {
    database.collection("todoappcollection").insertOne({
      id: (numOfDocs + 1).toString(),
      description: req.body.newNotes,
    });
    res.json({ message: "Added Successful", status: 200 });
    return;
  }
  res.json({ message: "Error adding note", status: 400 });
});

app.delete("/api/todoapp/DeleteNote", (req, res) => {
  console.log(req.query.id);
  database.collection("todoappcollection").deleteOne({
    id: req.query.id,
  });
  res.json("Deleted Successful");
});

async function connect_db() {
  const client = new MongoClient(CONNECTION_STRING);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    database = client.db(DATABASENAME);
    console.log("Mongo DB Connection Successful");
  } catch (e) {
    console.error(e);
  }
}
