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

  return user;
}

async function createEntry(userId, content, lat, long) {
  entry = await prisma.entry.create({
    data: {
      userId,
      content,
      lat,
      long,
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

app.post("/create", (req, res) => {
  const { email, name, password, profilePic } = req.body;
  createUser(email, name, password, profilePic);
  console.log("User" + { name } + "added");
});

app.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  const user = getUser(id);
  res.send(user);
  // convert prisma to json
});

app.post("/createEntry", (req, res) => {
  const { userId, content, lat, long } = req.body;
  const entry = createEntry(userId, content, lat, long);
  console.log("Entry" + { entry } + "added");
});

app.post("/getEntriesArea", (req, res) => {
  const { lat, long, top_dist, side_dist } = req.body;
  const entries = getEntriesByDist(lat, long, top_dist, side_dist);
  res.send(entries);
  // convert prisma to json
});

app.get("/getAllEntries", (req, res) => {
  const entries = getAllEntries();
  res.send(entries);
});

app.get("/getEntry/:id", (req, res) => {
  const id = req.params.id;
  const entry = getEntryById(id);
  res.send(entry);
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
