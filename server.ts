import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with large limit for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini client on the server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for parsing timetable from file
  app.post("/api/timetable/parse", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "ファイルデータが提供されていません。" });
      }

      const prompt = `
あなたは学校の優秀な時間割解析アシスタントです。
提供された時間割の画像データ（base64）を正確に読み取り、日本語の曜日（「月」, 「火」, 「水」, 「木」, 「金」）と、それぞれの1限（period: 1）から6限（period: 6）までの時間割を抽出してください。

曜日: 「月」, 「火」, 「水」, 「木」, 「金」
各時限: period (1〜6)
科目名: subject (例: "数学II", "コミュニケーション英語", "古典")
担当教員名: teacher (例: "高橋先生", "佐藤先生")
教室名: room (例: "2-1教室", "LL教室"、記載がなければ省略または空文字)

【注意点】
- 曜日ごとの時間割配列をキー（"月", "火", "水", "木", "金"）として返してください。
- 授業が入っていない時限は出力に含まないでください。
- 授業が存在する時限だけを正確にマッピングしてください。
- フォーマットは提供されたJSONスキーマに厳密に従ってください。
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: fileData, // base64 payload without standard data URL prefix (e.g. data:image/png;base64,)
              mimeType: mimeType || "image/png"
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              "月": {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.INTEGER, description: "1〜6の時限" },
                    subject: { type: Type.STRING, description: "科目名" },
                    teacher: { type: Type.STRING, description: "担当教員名" },
                    room: { type: Type.STRING, description: "教室名" }
                  },
                  required: ["period", "subject", "teacher"]
                }
              },
              "火": {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.INTEGER, description: "1〜6の時限" },
                    subject: { type: Type.STRING, description: "科目名" },
                    teacher: { type: Type.STRING, description: "担当教員名" },
                    room: { type: Type.STRING, description: "教室名" }
                  },
                  required: ["period", "subject", "teacher"]
                }
              },
              "水": {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.INTEGER, description: "1〜6の時限" },
                    subject: { type: Type.STRING, description: "科目名" },
                    teacher: { type: Type.STRING, description: "担当教員名" },
                    room: { type: Type.STRING, description: "教室名" }
                  },
                  required: ["period", "subject", "teacher"]
                }
              },
              "木": {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.INTEGER, description: "1〜6の時限" },
                    subject: { type: Type.STRING, description: "科目名" },
                    teacher: { type: Type.STRING, description: "担当教員名" },
                    room: { type: Type.STRING, description: "教室名" }
                  },
                  required: ["period", "subject", "teacher"]
                }
              },
              "金": {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.INTEGER, description: "1〜6の時限" },
                    subject: { type: Type.STRING, description: "科目名" },
                    teacher: { type: Type.STRING, description: "担当教員名" },
                    room: { type: Type.STRING, description: "教室名" }
                  },
                  required: ["period", "subject", "teacher"]
                }
              }
            }
          }
        }
      });

      const text = response.text || "{}";
      const parsedTimetable = JSON.parse(text);
      res.json({ timetable: parsedTimetable });
    } catch (error: any) {
      console.error("Gemini Parsing Error:", error);
      res.status(500).json({ error: error.message || "時間割の解析に失敗しました。" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
