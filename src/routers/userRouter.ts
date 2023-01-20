import { User } from '../model/userModel';
import auth from '../middleware/auth';
import * as jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import express, { Express, Request, Response } from 'express';
const userRouter: Express = express();
import dotenv from 'dotenv';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLEINT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
//Send Email
async function sendEmail({ to, subject, html }) {
    let result;
    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            secureConnection: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            tls: {
                ciphers: 'SSLv3'
            },
            requireTLS: true,//this parameter solved problem for me
            auth: {
                user: "noreply@tenix.io",
                pass: "csnozjvfwexkqhvl",
            },

        });

        await transporter.verify((err: any, success: any) => {
            err ? console.error("Error In Config: ", err) : console.log('Config is correct');
        });

        const mailOptions = {
            from: 'devportal.tenix.io <noreply@tenix.io>',
            to,
            subject,
            html,
        };

        result = await transporter.sendMail(mailOptions);

    } catch (err) {
        console.log("Error using the pass method: ", err);
        console.log("Using the OAuth2 method");
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                type: 'OAuth2',
                user: 'noreply@tenix.io',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLEINT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        await transport.verify((err: any, success: any) => {
            err ? console.error("Error In Config: ", err) : console.log('Config is correct');
        });

        const mailOptions = {
            from: 'devportal.tenix.io <noreply@tenix.io>',
            to,
            subject,
            html,
        };

        result = await transport.sendMail(mailOptions);

    }
    return result;
}

//User SignUp
userRouter.post("/user/signup", async (req: Request, res: Response) => {
    // checks if password and confirm password matches
    if (req.body.password != req.body.confirmPassword) {
        console.log(new Date().toLocaleString() + ` User ${req.body.email} sending response: Password does not match`);
        return res.status(400).json({ message: "Password does not match" });
    }
    // checks if user already exits
    const user = await User.findOne({ email: req.body.email });

    console.log(new Date().toLocaleString() + ` User ${req.body.email} details received`);

    if (user) {
        console.log(new Date().toLocaleString() + ` User ${req.body.email} sending response: Email already signed-up`);
        return res.status(400).json({ message: "Email already signed-up" });
    } else {
        // create user with isVerified false
        const user = new User({
            isAdmin: req.body.isAdmin,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
        });


        //   const token = jwt.sign({ _id: user._id.toString() }, "botmonitorsecret");
        //   user.tokens = user.tokens.concat({ token });

        console.log(new Date().toLocaleString() + ` User ${req.body.email}: token assigned`);
        try {
            await user.save();
            console.log(new Date().toLocaleString() + ` User ${req.body.email}: added to database`);
        } catch (err: any) {
            console.log(new Date().toLocaleString() + ` User ${req.body.email}: sending response: ${err.message}`);
            return res.status(400).json({ message: err.message });
        }

        console.log(new Date().toLocaleString() + ` User ${req.body.email}: sending verification email`);
        // send verification mail
        await sendEmail({
            to: user.email,
            subject: "Bot Monitoring System: VERIFY YOUR EMAIL",
            html: `
              <html>
                <body>
                  <p>Hi ${user.firstName},</p>
                  <p>Welcome to Bot Monitoring System!</p>
                  <p>
                    To verify your account click
                    <a href="${process.env.BASE_URL}/verify-account?token=${user.tokens[user.tokens.length - 1].token
                }">HERE</a>

                  </p>
                </body>

              </html>   
            `,
        }).then(async () => {
            console.log(new Date().toLocaleString() + ` User ${req.body.email} sending response: Please verify your email account`);
            return res.status(201).json({ message: "Please verify your email account", user });
        }).catch((err) => {
            console.log(new Date().toLocaleString() + ` User ${req.body.email} Error: ${err}`);
            console.log(new Date().toLocaleString() + ` User ${req.body.email} sending response: Error occurred while sending verification email`);
            return res.status(500).send({
                message: "Error occurred while sending verification email",
                errorMessage: err.message,
            });
        });
    }
});

//User Verify
userRouter.post("/user/verify-account", auth, async (req: Request, res: Response) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        req.user.isVerified = true;
        await req.user.save();
        res.json({ message: "Account verified!" });
    } catch (err: any) {
        return res.status(500).json({
            message: "Error occure while verifing account",
            errorMessage: err.message,
        });
    }
});

//User Login
userRouter.post("/user/login", async (req: Request, res: Response) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.json({ message: "Successfully Login", user, token });
    } catch (err: any) {
        res
            .status(400)
            .json({ message: "Login Failed", errorMessage: err.message });
    }
});

//User Logout
userRouter.post("/user/logout", auth, async (req: Request, res: Response) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.json({ message: "Successfully Logout" });
    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Logout Failed", errorMessage: err.message });
    }
});

//ReadUser
userRouter.get('/users', auth, async (req: Request, res: Response) => {
    try {
        const readUser = await User.find({ isAdmin: false });

        res.send(readUser);

    } catch (err: any) {
        res
            .status(500)
            .json({ message: "Error in finding all the user data!", errorMessage: err.message });
    }
});

//Delete User
userRouter.delete("/users/:id", auth, async (req, res) => {
    const userId = req.params.id;
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).send({ message: "Invalid userId" });
    // }
    await User.findByIdAndDelete(userId, (error: any, result: any) => {
        if (error) {
            res.json({ message: "Deletion Failed", errorMessage: error.message });
        }
        return res.status(200).send({ message: "Deleted Successfully" });

    });
});

//update-user
userRouter.patch("/userUpdate/:id", auth, async (req: Request, res: Response) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        "firstName",
        "lastName",
        "email",
        "password",
        "isEnabled",
        "isAdmin"
    ];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
        return res.status(400).send({ message: "Invalid updates!" });
    }
    try {

        // encrypt (hash) update password
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 8);
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
    } catch (e) {
        return res.status(400).send(e);
    }
});
// userRouter.delete("/user/:id", auth, async (req:Request, res:Response) => {
//     try {
//       await User.findOneAndDelete({
//         _id: req.params.id,
//       });
//       res.json({ message: "Successfully Deleted" });
//     } catch (e:any) {
//       res.status(500).send({
//         message: "Error occur while deleting the user",
//         errorMessage: e.message,
//       });
//     }
// });

// userRouter.delete("/users/:email", auth, async (req, res) => {

//   await User.findOneAndDelete({ email: req.body.email }, (error:any, result:any) => {
//     if (error) {
//       res.json({ message: "Deletion Failed", errorMessage: error.message });
//     }
//     return res.send("Deleted Successfully");
//   });
// });



export { userRouter }