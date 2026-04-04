import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2";

// Import the CRUD operations from your newly updated Homes model
import { addHome, updateHome, deleteHome } from "./models/homes.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8000;

/* ✅ MySQL Connection */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dev@19@malik",
  database: "travel_db",
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Failed:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});


/* ===================== ROUTES ===================== */

/* ✅ Locations - GET */
app.get("/api/locations", (req, res) => {
  db.query("SELECT * FROM Location", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ Locations - POST (Add New Location) */
app.post("/api/locations", (req, res) => {
  const { location_name, image, link } = req.body;
  const sql = "INSERT INTO Location (location_name, image, link) VALUES (?, ?, ?)";
  db.query(sql, [location_name, image, link], (err, results) => {
    if (err) return res.status(500).json(err);
    res.status(201).json(results);
  });
});

/* ✅ Locations - PUT (Edit Location) */
app.put("/api/locations/:id", (req, res) => {
  const { location_name, image, link } = req.body;
  const sql = "UPDATE Location SET location_name = ?, image = ?, link = ? WHERE location_id = ?";
  db.query(sql, [location_name, image, link, req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(results);
  });
});

/* ✅ Locations - DELETE (Remove Location) */
app.delete("/api/locations/:id", (req, res) => {
  const sql = "DELETE FROM Location WHERE location_id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(results);
  });
});


/* ✅ Homes - GET ALL */
app.get("/api/homes", (req, res) => {
  const sql = `
    SELECT h.*, l.location_name
    FROM Home h
    JOIN Location l ON h.location_id = l.location_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ Homes - GET SINGLE HOTEL (Fixes the stuck loading!) */
app.get("/api/homes/:id", (req, res) => {
  const sql = `
    SELECT h.*, l.location_name
    FROM Home h
    LEFT JOIN Location l ON h.location_id = l.location_id
    WHERE h.home_id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    // Return just the single matching object
    res.json(results[0] || null); 
  });
});

/* ✅ Get Rooms for a specific Hotel (Fixes the stuck loading!) */
app.get("/api/homes/:id/rooms", (req, res) => {
  // We use a subquery to find the location_id of the specific hotel,
  // matching your existing HotelRoom database structure perfectly!
  const sql = `
    SELECT hr.room_id, hr.name, hr.price, hr.priceSubtext, rf.feature_name
    FROM HotelRoom hr
    LEFT JOIN RoomFeature rf ON hr.room_id = rf.room_id
    WHERE hr.location_id = (SELECT location_id FROM Home WHERE home_id = ?)
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    
    /* Group features properly so it formats perfectly on the frontend */
    const roomsMap = {};
    results.forEach(row => {
      if (!roomsMap[row.room_id]) {
        roomsMap[row.room_id] = {
          room_id: row.room_id,
          name: row.name,
          price: row.price,
          priceSubtext: row.priceSubtext,
          features: []
        };
      }
      if (row.feature_name) {
        roomsMap[row.room_id].features.push(row.feature_name);
      }
    });

    res.json(Object.values(roomsMap));
  });
});

/* ✅ Homes - POST (Add New Home using imported model) */
app.post("/api/homes", async (req, res) => {
  try {
    const result = await addHome(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

/* ✅ Homes - PUT (Edit Home using imported model) */
app.put("/api/homes/:id", async (req, res) => {
  try {
    const result = await updateHome(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

/* ✅ Homes - DELETE (Remove Home using imported model) */
app.delete("/api/homes/:id", async (req, res) => {
  try {
    const result = await deleteHome(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});


/* ✅ Testimonials */
app.get("/api/testimonials", (req, res) => {
  db.query("SELECT * FROM Testimonial", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ Airports */
app.get("/api/airports", (req, res) => {
  db.query("SELECT * FROM Airport", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ Flights */
app.get("/api/flights", (req, res) => {
  const { from, to } = req.query;

  let sql = `
    SELECT f.*, 
    l1.location_name AS from_city,
    l2.location_name AS to_city,
    a1.code AS departure_code,
    a2.code AS arrival_code
    FROM Flight f
    JOIN Location l1 ON f.from_location_id = l1.location_id
    JOIN Location l2 ON f.to_location_id = l2.location_id
    JOIN Airport a1 ON f.departure_airport_id = a1.airport_id
    JOIN Airport a2 ON f.arrival_airport_id = a2.airport_id
    WHERE 1=1
  `;

  const params = [];

  if (from) {
    sql += " AND l1.location_name = ?";
    params.push(from);
  }

  if (to) {
    sql += " AND l2.location_name = ?";
    params.push(to);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


/* ================================================= */
/* ✅ DYNAMIC CITY ROUTES */
/* ================================================= */

/* ✅ Get City Info */
app.get("/api/cities/:id", (req, res) => {
  db.query("SELECT * FROM Location WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] || {});
  });
});

/* ✅ City Attractions */
app.get("/api/cities/:id/attractions", (req, res) => {
  db.query("SELECT * FROM Attraction WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ City Restaurants */
app.get("/api/cities/:id/restaurants", (req, res) => {
  db.query("SELECT * FROM Restaurant WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ City Food */
app.get("/api/cities/:id/food", (req, res) => {
  db.query("SELECT * FROM FoodPlace WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ City Shopping */
app.get("/api/cities/:id/shopping", (req, res) => {
  db.query("SELECT * FROM ShoppingPlace WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ City Culture */
app.get("/api/cities/:id/culture", (req, res) => {
  db.query("SELECT * FROM Culture WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ✅ City Gallery */
app.get("/api/cities/:id/gallery", (req, res) => {
  db.query("SELECT * FROM GalleryImage WHERE location_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


/* ===================== SERVER START ===================== */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});