/*
 *
 *
 * Copyright 2020 ANTHONY QUÉRÉ
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
// @ts-ignore
import * as express from "express";
import * as bodyParser from "body-parser";
import {FRONT_URL} from './server/tools/environment';
import {loadRoutes} from './server/routes';
import * as cors from 'cors';

const app = express();


app.use(bodyParser.json());

const corsOptions: cors.CorsOptions = {
    origin: FRONT_URL,
    optionsSuccessStatus: 200,
    exposedHeaders: '_token'
};

app.use(cors(corsOptions));

app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({error: "Une erreur est survenue sur le serveur", stack: err.stack});
});

// Add routes
loadRoutes(app);

export default app;
