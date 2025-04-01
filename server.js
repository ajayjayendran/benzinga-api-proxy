require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to validate secret token
app.use((req, res, next) => {
  const clientToken = req.headers["authorization"]; // Token from request headers
  if (!clientToken || clientToken !== `Bearer ${process.env.SECRET_TOKEN}`) {
    return res.status(403).json({ error: "Forbidden: Invalid token" });
  }
  next();
});

app.get("/earnings", async (req, res) => {
  const { date_from, date_to, pagesize = 1000, page = 0 } = req.query;

  if (!date_from || !date_to) {
    return res
      .status(400)
      .json({ error: "Missing required query parameters: date_from, date_to" });
  }

  try {
    const response = await axios.get(
      process.env.BENZINGA_API + "/v2.1/calendar/earnings",
      {
        params: {
          pagesize,
          page,
          "parameters[date_from]": date_from,
          "parameters[date_to]": date_to,
          token: process.env.BENZINGA_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/logos", async (req, res) => {
  const { search_keys } = req.query;

  if (!search_keys) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: search_keys" });
  }

  try {
    const response = await axios.get(
      process.env.BENZINGA_API + "/api/v2/logos/search",
      {
        params: {
          search_keys,
          fields: "mark_vector_light,mark_vector_dark",
          token: process.env.BENZINGA_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching logos:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
