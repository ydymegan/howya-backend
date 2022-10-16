const express = require("express");
const app = express();
const path = require("path");
const _ = require("lodash");

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

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
      profilePic: profilePic ?? ''
    }
  })

  return user;

};

async function getUser(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  return user 
};

async function createEntry(userId, content, lat, long) {
  user = await prisma.entry.create({
    data: {
      userId,
      content,
      lat,
      long
    }
  })
}

async function getEntryById(entryId) {
  const entry = await prisma.entry.findUnique({
    where: {
      id: entryId
    }
  })
}

async function getAllEntries() {
  const entries = await prisma.entry.findMany();
}

app.get("/")
