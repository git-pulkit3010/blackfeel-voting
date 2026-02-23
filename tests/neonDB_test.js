import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_dh5XmWPqf7cQ@ep-snowy-frog-a4uwbwsg-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
});

await client.connect();
console.log("Connected!");
await client.end();