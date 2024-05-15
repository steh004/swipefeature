const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
db.connect();


const generateRecommendationQuery = (userId) => {

    // Generate a random set of interests for the user
    const interests = ['sports', 'music', 'movies', 'travel', 'food', 'art', 'technology'];
    const userInterests = interests.slice(0, Math.floor(Math.random() * interests.length) + 1).join("','");

    // Generate a random location within a certain radius of the user's location
    const userLocation = 'user_location'; // Replace 'user_location' with the actual user's location
    const radius = Math.random() * 10; // Radius in kilometers
    const minLat = userLocation.latitude - radius / 110.574;
    const maxLat = userLocation.latitude + radius / 110.574;
    const minLon = userLocation.longitude - radius / (111.32 * Math.cos(userLocation.latitude * Math.PI / 180));
    const maxLon = userLocation.longitude + radius / (111.32 * Math.cos(userLocation.latitude * Math.PI / 180));

    // Weightages for different attributes
    const weightages = {
        'gender': 1,
        'location': 2,
        'university': 1,
        'interests': 3
    };

    // Generate the SQL query
    const query = `
        SELECT *
        FROM users
        WHERE id != ${userId}
        AND gender != (SELECT gender FROM users WHERE id = ${userId})
        AND location.latitude BETWEEN ${minLat} AND ${maxLat}
        AND location.longitude BETWEEN ${minLon} AND ${maxLon}
        AND university = (SELECT university FROM users WHERE id = ${userId})
        AND interests IN ('${userInterests}')
        ORDER BY
            ${Object.entries(weightages)
                .map(([attr, weight]) => `(${weight} * ${attr} = (SELECT ${attr} FROM users WHERE id = ${userId}))`)
                .join(' + ')}
        DESC
        LIMIT 10;
    `;

    return query
}



app.get("/users", (req, res) => {
    let dbquery = generateRecommendationQuery(req.userId);
    db.query(dbquery, (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.send(result);
            console.log(result);
            console.log('Connected!');
        }
    });
});

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost/${PORT}/`);
});