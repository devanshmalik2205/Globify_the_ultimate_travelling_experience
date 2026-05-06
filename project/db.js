import mysql from "mysql2";
import "dotenv/config";

/* ✅ MySQL Connection */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "dev@19@malik",
  database: "travel_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Failed:", err);
  } else {
    console.log("MySQL Connected ✅ (db.js)");
  }
});

// Export the connection so server.js and all models can use it!
export default db;