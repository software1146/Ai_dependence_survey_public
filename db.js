import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function saveResult(result) {
  try {
    await client.connect();
    const db = client.db("Survey_data"); 
    const collection = db.collection("User_response_data"); 

    await collection.insertOne(result);
    console.log("✅ 저장 성공");
  } catch (err) {
    console.error("❌ 저장 실패:", err);
  } finally {
    await client.close();
  }
}
