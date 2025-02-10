import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import sendWelcomeEmail from './background/email/mail.service';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import router from './Routers/user.router';

import cron from 'node-cron'
const PORT = process.env.PORT || 4000;
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/users', router);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    
});

app.get('/', (req, res) => {
    res.send('Hello!');   
});




// cron.schedule('*/10 * * * * *', async() => {
//     console.log('running a task every 10 Second');
//     await sendWelcomeEmail()
//   });