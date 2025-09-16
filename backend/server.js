const express = require("express");
const cors =  require('cors');
const dotenv = require("dotenv");
const {createClient} = require("redis");
const {fetchNews} = require("./newsFetcher");
const app =  express();
app.use(cors());
dotenv.config();
app.use(express.json());

//redis connection 
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Redis Connected");
  } catch (err) {
    console.error("Redis Connection Failed:", err);
  }
})();


//routes
app.get('/',(req,res)=>{
    res.send('Hello route is working');
})

app.post("/chat/:sessionId",async(req,res)=>{
    try {
        const{sessionId} = req.params;
        const {role,text} = req.body;

        if(!role || !text){
            return res.status(400).json({error:"Both role and text are required"});
        }
        await redisClient.rPush(
            `session:${sessionId}`,
            JSON.stringify({role,text})
        );
        res.json({status:"Message Stored", sessionId});
    } catch (error) {
        res.status(500).json({error:"Something went wrong"});
        
    }
});

app.get("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await redisClient.lRange(`session:${sessionId}`, 0, -1);
    const parsedMessages = messages.map((msg) => JSON.parse(msg));

    res.json({ sessionId, messages: parsedMessages });
  } catch (err) {
    console.error("Error in /history:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.delete("/reset/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    await redisClient.del(`session:${sessionId}`);
    res.json({ status: "🗑️ Session cleared", sessionId });
  } catch (err) {
    console.error("Error in /reset:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Route fetch news articles
app.get("/news",async(req,res)=>{
  const articles = await fetchNews();
  res.json({count:articles.length, articles});
})

const PORT = 3000

app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})