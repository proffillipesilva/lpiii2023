import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from "./data-source";
import userRepository from "./models/user-repository";
import jwt from 'jsonwebtoken';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
const serviceAccount = require('../service-account.json')
import admin from 'firebase-admin';
import { User } from "./models/user";
import uuid, { v4 } from 'uuid'


const client = new OAuth2Client();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));



const firebaseApp = initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dwebiii-60254-default-rtdb.firebaseio.com"
});

const messaging = getMessaging(firebaseApp);

app.post('/notification/send/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const notification = req.body;
    const foundUser = await userRepository.findOneBy({ id });
    const registrationToken = foundUser?.fcmToken || [];

    const options = {
        priority: "high"
    }

    const payload = {
        notification: {
            title: notification.title,
            body: notification.body,
            content_available: "true",
            image: "https://i.ytimg.com/vi/iosNuIdQoy8/maxresdefault.jpg"
        }
    }

    try {
        await messaging.sendToDevice(registrationToken, payload, options)

        res.send('message succesfully sent !')

    } catch (err) {
        res.send(err).status(500)
    };
})


app.post('/login', async (req, res) => {
    const ticket = await client.verifyIdToken({
        idToken: req.body.token,
        audience: "377869314621-7mu6efqci9ki98qmega0m2nqdt0ji15h.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userId = payload?.sub;
    console.log(payload);
    console.log(userId);
    const email = payload?.email;
    if(!email) {
        res.status(401).send();
        return;
    }
    
    let foundUser = await userRepository.findOneBy({ email });
    if (!foundUser) {
        const user = new User();
        user.fcmToken = req.body.fcmToken;
        user.email = email || '';
        user.name = payload?.name || '';
        user.googleId = userId || '';
        user.imageUrl = payload?.picture || '';
        user.id = v4();
        foundUser = await userRepository.save(user);
        
    }
    // 300s => 5 minutos . voce pode colocar mais tempo se quiser
    const jwtToken = jwt.sign({ email: foundUser?.email, id: foundUser?.id }, "SUA_SENHA", { expiresIn: 300 })
    res.json({ token: jwtToken });

})

app.post('/signUp', async (req, res) => {
    console.log("SIGN UP")
    console.log(req.body);
    res.json('ok');
})



app.listen(38000, () => {
    console.log("Enzo again")
    AppDataSource.initialize()
        .then(() => {
            console.log("Banco ok")
        })
});

