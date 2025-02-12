import nodemailer from 'nodemailer'
import Emailconfig from '../config/email.config'


function createTransporter(config:any){
    return nodemailer.createTransport(config)
    }


    const sendMail = async(messageOptions:any)=>{
        let transporter =createTransporter(Emailconfig)
        await transporter.verify()
        transporter.sendMail(messageOptions, (err, info) => {
            console.log(info)

        })
    }

    // const transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: "ivonnenabangala@gmail.com", // Replace with your email
    //         pass: "wyyo hajx lnqq zeac",   
    //     },
    // });
    
    export default sendMail