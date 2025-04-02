require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const routes = require('./router');
const analytics = require('./analytics');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors())
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(require('sanitize').middleware);
app.use('/auth', require('./auth.routes'));
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.use('/potions', routes);
app.use('/analytics', analytics);
const PORT = process.env.PORT || 3000;
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Auth & Potions',
      version: '1.0.0',
      description: 'Doc de l’API pour l’authentification et gestion des potions 🧪',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'demo_node+mongo_token'
        }
      },
      schemas: {
        Potion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '660bcf5fca6e9f06b8a2eecd'
            },
            name: {
              type: 'string',
              example: 'Potion de soin ultime'
            },
            price: {
              type: 'number',
              example: 99.99
            },
            score: {
              type: 'number',
              example: 5
            },
            ingredients: {
              type: 'array',
              items: { type: 'string' },
              example: ['larmes de phénix', 'poussière de fée']
            },
            ratings: {
              type: 'object',
              properties: {
                strength: { type: 'number', example: 4 },
                flavor: { type: 'number', example: 3 }
              }
            },
            tryDate: {
              type: 'string',
              format: 'date',
              example: '2025-04-02'
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              example: ['soin', 'rare']
            },
            vendor_id: {
              type: 'string',
              example: '660bceefa25c4f1234abcd12'
            }
          }
        }
      }
    }
     
  },
  apis: ['./*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

