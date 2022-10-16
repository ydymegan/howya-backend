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
