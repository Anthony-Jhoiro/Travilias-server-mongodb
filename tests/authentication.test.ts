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


import * as request from 'supertest';
import * as mongoose from 'mongoose';
import app from '../app';
import {User} from '../server/models/User';
import {makeUser} from './utils/makeUser';

beforeEach(function (done) {
        const url = `mongodb://127.0.0.1/partiravectest`;

        function clearDB() {
            for (let i in mongoose.connection.collections) {
                mongoose.connection.collections[i].deleteMany({});
            }
            return done();
        }


        if (mongoose.connection.readyState === 0) {
            mongoose.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: true,
                useCreateIndex: true
            })
                .then(() => clearDB());
        }
        else return clearDB();
    }
);

afterEach(function(done) {

    return done();
});

afterAll(done => {
    mongoose.disconnect();
    return done();
});


describe("Test the api path", () => {
    test("It should response to the GET method", () => {
        return request(app)
            .get("/api")
            .then(response => {
                expect(response.statusCode).toBe(200);
                // done();
            });
    })
});

describe("Test register", () => {
    it("It should create an account, if all the parameters are valid", async done => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({username: "rdmName", password: "rdmPassword", email: "rdmEmail@mail.com"})
            .expect(200)
            .then(response => {
                expect(response.body.success).toBe("Votre compte a bien été créé !");
            });
        const user = await User.findOne({username: "rdmName",  email: "rdmEmail@mail.com"});
        expect(user.username).toBeTruthy();
        expect(user.email).toBeTruthy();
        done();
    });

    it("It should sendBack a 400 error when a parameter is missed", async done => {
        await request(app)
            .post('/api/auth/register')
            .send({username: "rdmName", email: "rdmEmail@mail.com"})
            .expect(400);
        await request(app)
            .post('/api/auth/register')
            .send({password: "rdmPassword", email: "rdmEmail@mail.com"})
            .expect(400);
        await request(app)
            .post('/api/auth/register')
            .send({username: "rdmName", password: "rdmPassword"})
            .expect(400);
        done();
    });

    describe("It should return a 400 status if the username or the email is already taken", () => {
        const user = new User({username: "JohnnyBanana", email: "johnny.banana@mail.com"});


        it("Test username unique", async done => {
            const user = new User({username: "JohnnyBanana", email: "johnny.banana@mail.com"});
            const a = await user.save();
            request(app)
                .post('/api/auth/register')
                .send({username: a.username, email: "rdmEmail@mail.com", password: "password"})
                .expect(400)
                .then(() => done())
        });

        it("Test email unique", async done => {
            const user = new User({username: "JohnnyBanana", email: "johnny.banana@mail.com"});
            const a = await user.save();
            return request(app)
                .post('/api/auth/register')
                .send({username: "rdmName", email: a.email, password: "password"})
                .expect(400)
                .then(() => done())
        });
    });
});

describe("Test the login route", () => {
    it("User can connect with username", async done => {
        const user = await makeUser(app);
        return request(app)
            .post('/api/auth/login')
            .send({login: user.username, password: user.password})
            .expect(200)
            .then(() => done());
    });

    it("User can connect with email", async done => {
        const user = await makeUser(app);
        return request(app)
            .post('/api/auth/login')
            .send({login: user.email, password: user.password})
            .expect(200)
            .then(() => done());
    });

    describe("User recieve bad request if parameters are missing",  () => {
        it("Missing login", async done => {
            const user = await makeUser(app);
            return request(app)
                .post('/api/auth/login')
                .send({login: user.username})
                .expect(400)
                .then(() => done());
        });

        it("Missing password", async done => {
            const user = await makeUser(app);
            return request(app)
                .post('/api/auth/login')
                .send({password: user.password})
                .expect(400)
                .then(() => done());
        });
    });

    it("Incorrect password", async done => {
        const user = await makeUser(app);
        return request(app)
            .post('/api/auth/login')
            .send({login: user.username, password: "hello"})
            .expect(401)
            .then(() => done());
    });

    it("Incorrect login", async done => {
        const user = await makeUser(app);
        return request(app)
            .post('/api/auth/login')
            .send({login: "wrong login", password: user.password})
            .expect(400)
            .then(() => done());
    });
});

