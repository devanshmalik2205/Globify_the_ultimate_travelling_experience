import "dotenv/config"; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import Location from './models/locations.model.js';
import Home from './models/homes.model.js';
import Flight from './models/flights.model.js';
import Testimonial from './models/testimonials.model.js';
import Airport from './models/airports.model.js';

import DelhiAttraction from './models/delhi_attractions.model.js';
import DelhiRestaurant from './models/delhi_restaurants.model.js';
import DelhiFood from './models/delhi_food.model.js';
import DelhiShopping from './models/delhi_shopping.model.js';
import DelhiCulture from './models/delhi_culture.model.js';
import DelhiGallery from './models/delhi_gallery.model.js';

import HolidayInnRoom from './models/holiday_inn_rooms.model.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;



app.get('/api/locations', async (req, res) => {
    try {
        const locations = await Location.find({});
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/homes', async (req, res) => {
    try {
        const homes = await Home.find({});
        res.json(homes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({});
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/airports', async (req, res) => {
    try {
        const airports = await Airport.find({});
        res.json(airports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/flights', async (req, res) => {
    try {
        let query = {}; 
        const { from, to } = req.query;
        if (from) {
            query.departureAirportCode = from;
        }
        if (to) {
            query.arrivalAirportCode = to;
        }
        const flights = await Flight.find(query);
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/api/delhi/attractions', async (req, res) => {
    try {
        const data = await DelhiAttraction.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/delhi/restaurants', async (req, res) => {
    try {
        const data = await DelhiRestaurant.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/delhi/food', async (req, res) => {
    try {
        const data = await DelhiFood.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/delhi/shopping', async (req, res) => {
    try {
        const data = await DelhiShopping.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/delhi/culture', async (req, res) => {
    try {
        const data = await DelhiCulture.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/delhi/gallery', async (req, res) => {
    try {
        const data = await DelhiGallery.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/api/rooms/holiday-inn', async (req, res) => {
    try {
        const data = await HolidayInnRoom.find({});
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



mongoose.connect(MONGOURL).then(()=>{ 
    console.log("Database is connected successfully.")
    app.listen(PORT, ()=>{
        console.log(`Server is running on http://localhost:${PORT}`);
    })
}).catch((error)=>console.log(error));