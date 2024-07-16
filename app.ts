import {header} from "express-validator";

if (process.env.NODE_ENV === 'dev') {
    require('custom-env').env('dev')
} else if (process.env.NODE_ENV === 'test') {
    require('custom-env').env('test')
} else {
    require('custom-env').env('prod')
}



console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

import {NextFunction, Request, Response} from "express";
import {mainApi} from "./api/main";
import {AppEngine, ErrorHandler} from "pawsh-utils";

const express = require('express');
const app = express();
const cors = require('cors')

app.use(
    express.json(),
    express.urlencoded({ extended: true }),
    cors({ origin: true }),
    header('Metadata-Flavor', 'Google')
)

app.use('/', mainApi)

app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
    const errorHandler = new ErrorHandler(req, res, err,
        res.locals.operationId || 'new-pawsh-groomer',
        res.locals.apiName || 'new-pawsh-groomer'
    )
    await errorHandler.defaultHandle()
})

// Import scheduler
import './scheduler/chat';

// Start the server
const PORT = process.env.PORT || 8099;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl + C to quit.');
});

app.get('/', (req: Request, res: Response) => {
    res.status(200).send(`Hello from New Pawsh Groomer Backend! Port: ${PORT}`)
});

app.get('/_ah/warmup',
    async (req: Request, res: Response, next: NextFunction) => {
        // Handle your warmup logic. Initiate db connection, etc.
        await AppEngine.defaultWarmUp(req, res, next)
    })

module.exports = app;