import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import sendWelcomeEmail from './background/email/mail.service';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import router from './Routers/user.router';
import routerp from './Routers/parcel.router'

const PORT = process.env.PORT || 4000;
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/users', router);
app.use('/parcel', routerp)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    
});

app.get('/', (req, res) => {
    res.send('Hello!');   
});

