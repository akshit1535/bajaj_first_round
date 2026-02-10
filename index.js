const express = require("express");
const axios = require("axios");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const EMAIL = "akshit0104.be23@chitkara.edu.in";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fibonacci(n) {
  if (!Number.isInteger(n) || n < 1) return null;
  const arr = [0];
  if (n === 1) return arr;
  arr.push(1);
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function filterPrimes(arr) {
  if (!Array.isArray(arr)) return null;
  return arr.filter(isPrime);
}

function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function computeLCM(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.reduce((acc, val) => lcm(acc, val));
}

function computeHCF(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.reduce((acc, val) => gcd(acc, val));
}

async function askGemini(question) {
  try {
    if (typeof question !== "string" || question.trim().length === 0) {
      return null;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const prompt = `Answer the following question in exactly ONE word.
No punctuation. No explanation.
Question: ${question}`;

    const result = await model.generateContent(prompt);

    const text = result.response
      .text()
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z0-9]/g, "");

    return text;

  } catch (error) {
    console.error("Gemini Error:", error.message || error);
    return null;
  }
}




app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
      });
    }

    const allowedKeys = ["fibonacci", "prime", "lcm", "hcf", "AI"];
    const keys = Object.keys(body).filter((k) => allowedKeys.includes(k));

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
      });
    }

    const key = keys[0];
    const value = body[key];

    switch (key) {
      case "fibonacci": {
        const result = fibonacci(value);
        if (result === null)
          return res
            .status(400)
            .json({ is_success: false, official_email: EMAIL });

        return res.status(200).json({
          is_success: true,
          official_email: EMAIL,
          data: result,
        });
      }

      case "prime": {
        const result = filterPrimes(value);
        if (result === null)
          return res
            .status(400)
            .json({ is_success: false, official_email: EMAIL });

        return res.status(200).json({
          is_success: true,
          official_email: EMAIL,
          data: result,
        });
      }

      case "lcm": {
        const result = computeLCM(value);
        if (result === null)
          return res
            .status(400)
            .json({ is_success: false, official_email: EMAIL });

        return res.status(200).json({
          is_success: true,
          official_email: EMAIL,
          data: result,
        });
      }

      case "hcf": {
        const result = computeHCF(value);
        if (result === null)
          return res
            .status(400)
            .json({ is_success: false, official_email: EMAIL });

        return res.status(200).json({
          is_success: true,
          official_email: EMAIL,
          data: result,
        });
      }

      case "AI": {
        const result = await askGemini(value);
        if (result === null)
          return res
            .status(400)
            .json({ is_success: false, official_email: EMAIL });

        return res.status(200).json({
          is_success: true,
          official_email: EMAIL,
          data: result,
        });
      }

      default:
        return res.status(400).json({
          is_success: false,
          official_email: EMAIL,
        });
    }
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      is_success: false,
      official_email: EMAIL,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});