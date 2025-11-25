require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();

// Configuration Express
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// --- ROUTES --- //

// Accueil
app.get('/', (req, res) => res.render('index'));

// Portfolio
const projets = [
    { title: "Site Accrobranche", description: "Site web pour parc d'aventure.", url: "https://accrobranche.onrender.com/" }
];
app.get('/portfolio', (req, res) => res.render('portfolio', { projets }));

// Contact
app.get('/contact', (req, res) => res.render('contact', { message: null }));

app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.render('contact', { message: 'Tous les champs sont obligatoires !' });
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: subject,
        text: message,
        html: `<p><strong>Nom :</strong> ${name}</p>
               <p><strong>Email :</strong> ${email}</p>
               <p><strong>Message :</strong> ${message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render('contact', { message: 'Message envoyé avec succès !' });
    } catch (error) {
        console.error(error);
        res.render('contact', { message: 'Erreur lors de l’envoi. Veuillez réessayer.' });
    }
});

// --- SERVER --- //
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
