const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes, Op } = require('sequelize');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MySQL Connection with Sequelize
const sequelize = new Sequelize(
    {
      username: "mgl",
        password: "1FKsOyTn9gZdvh4G",
        database: "test",
        host: "31.220.96.248",
        port: 3306,
        dialect: "mysql",
        "pool": {
         "max": 40,
         "min": 0,
         "acquire": 60000,
         "idle": 10000
       }
      }
    );

// Define the UserLocations Model
const UserLocation = sequelize.define('UserLocation', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    tableName: 'UserLocations',
    timestamps: false,
});
//19.22930295012742, 72.85753872912233
// (async () => {
//     try {
//         await UserLocation.bulkCreate([
//             { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
//             { latitude: 18.5204, longitude: 73.8567 }, // Pune
//             { latitude: 20.5937, longitude: 78.9629 },
//             { latitude: 19.206164626167514, longitude: 72.87389663303071 }, // Nagpur
//             { latitude: 19.203858390414897, longitude: 72.86332348381012 },
//             { latitude: 19.22930295012742, longitude: 72.85753872912233 },
//         ]);
//         console.log("Records inserted successfully");
//     } catch (error) {
//         console.error("Error inserting records:", error);
//     }
// })();


// Haversine API
app.post('/api/get-matches', async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.body;

        // Validate input
        if (!latitude || !longitude || !radius) {
            return res.status(400).json({ error: 'Missing required parameters: latitude, longitude, radius' });
        }

        // Haversine formula as a literal
        const haversineFormula = `
            6371 * ACOS(
                COS(RADIANS(:latitude)) * COS(RADIANS(latitude)) *
                COS(RADIANS(longitude) - RADIANS(:longitude)) +
                SIN(RADIANS(:latitude)) * SIN(RADIANS(latitude))
            )
        `;

        // Query database for matching users
        const matches = await UserLocation.findAll({
            attributes: [
                'user_id',
                [sequelize.literal(`ROUND(${haversineFormula}, 2)`), 'distance'], // Round distance to 2 decimal places
            ],
            where: sequelize.literal(`${haversineFormula} <= :radius`),
            replacements: { latitude, longitude, radius }, // Pass parameters securely
            order: sequelize.literal('distance ASC'),
        });

        // Send response
        res.json({
            success: true,
            data: matches,
        });
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Sync Sequelize and start the server
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
