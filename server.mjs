import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import { saveResult } from "./db.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 7777;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectMongo() {
    try {
        await client.connect();
        console.log("✅ MongoDB 연결 완료");
    } catch (err) {
        console.error("❌ MongoDB 연결 실패:", err);
    }
}
connectMongo();

let questions = [];

(async () => {
    try {
        const questionsPath = path.join(__dirname, "questions.json");
        const questionsData = await fs.readFile(questionsPath, "utf-8");
        questions = JSON.parse(questionsData);
        console.log("질문 데이터 로드 완료");
    } catch (err) {
        console.error("질문 데이터를 불러오는 중 오류 발생:", err);
    }
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get('/questions', (req, res) => {
    res.json(questions);
});

app.post("/addResults", async (req, res) => {
    try {
        const { Perception, Tendency, Dependence, Age, Gender } = req.body;
        const resultEntry = { Perception, Tendency, Dependence, Age, Gender };
        await saveResult(resultEntry);
        res.status(200).json({ message: "결과 저장 완료" });
    } catch (err) {
        console.error("결과 저장 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
});

app.get("/averageResults", async (req, res) => {
    try {
        const db = client.db("Survey_data");
        const collection = db.collection("User_response_data");

        const results = await collection.find({}).toArray();

        if (results.length === 0) {
            return res.status(404).json({ error: "데이터 없음" });
        }

        let sumPerception = 0;
        let sumTendency = 0;
        let sumDependence = 0;

        results.forEach(result => {
            sumPerception += parseFloat(result.Perception);
            sumTendency += parseFloat(result.Tendency);
            sumDependence += parseFloat(result.Dependence);
        });

        const averagePerception = (sumPerception / results.length).toFixed(1);
        const averageTendency = (sumTendency / results.length).toFixed(1);
        const averageDependence = (sumDependence / results.length).toFixed(1);

        res.json({
            Perception: averagePerception,
            Tendency: averageTendency,
            Dependence: averageDependence
        });
    } catch (err) {
        console.error("평균 계산 오류:", err);
        res.status(500).json({ error: "서버 오류" });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
