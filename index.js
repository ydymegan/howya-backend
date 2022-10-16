const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL +
        "&application_name=$ docs_simplecrud_node-prisma",
    },
  },
});

const main = async () => {
  const user = await createUser(
    "test@gmail.com",
    "test-1",
    "test-1",
    "www.google.com"
  );

  console.log("created user: ", user);

  const entry = await createEntry(
    user.id,
    "this is a test entry 1",
    "1",
    "1",
    "Running"
  );

  console.log("created entry 1: ", entry.id);

  const entry2 = await createEntry(
    user.id,
    "this is a test entry 2",
    "2",
    "2",
    "Golf"
  );

  console.log("created entry 2: ", entry2.id);
};

async function createUser(email, name, password, profilePic) {
  user = await prisma.user.create({
    data: {
      email,
      name,
      password,
      profilePic: profilePic ?? "",
    },
  });

  return user;
}

async function getUser(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  console.log(user);

  return user;
}

async function createEntry(userId, content, lat, long, activity) {
  entry = await prisma.entry.create({
    data: {
      userId,
      content,
      lat,
      long,
      activity,
    },
  });

  return entry;
}

async function getEntryById(entryId) {
  const entry = await prisma.entry.findUnique({
    where: {
      id: entryId,
    },
  });

  return entry;
}

async function getEntriesByDist(lat, long, top_dist, side_dist) {
  const lat1 = lat;
  const long1 = long;
  const lat2 = top_dist / 111111 + lat;
  const long2 = side_dist / (111111 * cos(radians(lat))) + long;

  const entries = await prisma.entry.findMany({
    where: {
      every: {
        lat: {
          gte: lat1,
          lse: lat2,
        },
        long: {
          gte: long1,
          lse: long2,
        },
      },
    },
  });

  return entries;
}

async function getAllEntries() {
  const entries = await prisma.entry.findMany();

  return entries;
}

async function getAllEntriesByUserId(userId) {
  const entries = await prisma.entry.findMany({
    where: {
      userId: userId,
    },
  });

  return entries;
}

app.post("/create", (req, res) => {
  const { email, name, password, profilePic } = req.body;
  createUser(email, name, password, profilePic);
  console.log("User" + { name } + "added");
});

app.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  return getUser(id).then((user) => {
    res.send(user);
  });
});

app.post("/createEntry", (req, res) => {
  const { userId, content, lat, long, activity } = req.body;
  const entry = createEntry(userId, content, lat, long, activity);
  console.log("Entry" + { entry } + "added");
});

app.post("/getEntriesArea", (req, res) => {
  const { lat, long, top_dist, side_dist } = req.body;
  return getEntriesByDist(lat, long, top_dist, side_dist).then((entries) => {
    res.send(entries);
  });
});

app.get("/getAllEntries", (req, res) => {
  return getAllEntries().then((entries) => {
    res.send(entries);
  });
});

app.get("/getEntry/:id", (req, res) => {
  const id = req.params.id;
  return getEntryById(id).then((entry) => {
    res.send(entry);
  });
});

app.get("/getAllEntriesById/:id", (req, res) => {
  const id = req.params.id;
  return getAllEntriesByUserId(id).then((entries) => {
    res.send(entries);
  });
});

main().catch((e) => {
  throw e;
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 
app.listen(port, function() {
  console.log("Server started succesfully");
});  
