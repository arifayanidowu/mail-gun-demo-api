require("dotenv").config();
const express = require("express");
const app = express();
const domain = process.env.DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;
const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: domain });
const MailComposer = require("nodemailer/lib/mail-composer");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 6000;

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

const style = {
  container: {
    width: "80%",
    height: "400px",
    margin: `5px auto`
  },
  header: {
    padding: "10px",
    background: "#cecece",
    textAlign: "center",
    fontSize: "1rem",
    color: "yellow"
  },
  message: {
    padding: "10px 40px",
    background: "#f5f5f5",
    height: "60%"
  }
};

app.post("/mail", (req, res) => {
  const data = {
    from: `<noreply@example.com>`,
    to: req.body.email,
    subject: "Welcome to our StizzleVille",
    html: `
            <div style="${style.container}">
                <div style="${style.header}">New Notification</div>
                <div style="${style.message}">
                    Thank you for subscribing with us.
                </div>
            </div>
        `
  };

  const mail = new MailComposer(data);

  mail.compile().build((err, message) => {
    const dataToSend = {
      to: req.body.email,
      message: message.toString("ascii")
    };
    //   mailgun.messages().send(data, (error, body) => {
    //     if (error) {
    //       res.status(500).send({ success: false, msg: error.message });
    //     }
    //     res.status(200).send({ success: true, msg: body });
    //   });
    mailgun.messages().sendMime(dataToSend, (sendError, body) => {
      if (sendError) {
        res.status(500).send({ success: false, msg: sendError });
      }
      res.status(200).send({ success: true, msg: body });
    });
  });
});

app.listen(PORT, () => console.log(`[Server]: Connected on port ${PORT}`));
