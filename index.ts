import express, { type Express, type Request, type Response } from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();
const port: number = process.env.PORT;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in your .env file!");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("skillzone");

    const coursesCollection = db.collection("courses");

    interface courseInfo {
      title: string;
      instructorName: string;
      category: string;
      price: number;
      duration: number;
      thumbnailUrl: string;
      description: string;
    }

    app.post(
      "/api/courses",
      async (req: Request<{}, {}, courseInfo>, res: Response) => {
        try {
          const data: courseInfo = req.body;
          const result = await coursesCollection.insertOne(data);
          res.send(result);
        } catch (error) {
          console.error("POST /api/courses Error:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      },
    );

    app.get("/api/courses", async(req:Request, res:Response) => {
        const courses = await coursesCollection.find().toArray();
        res.send(courses);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
