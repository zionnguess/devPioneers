require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ---------------- MIDDLEWARE ----------------
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet()); // sécurité headers HTTP
app.use(morgan('dev')); // logs

// ---------------- MAIL CONFIG (OPTIMISÉ) ----------------
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Vérification au démarrage
transporter.verify((err) => {
    if (err) console.error("Erreur SMTP :", err);
    else console.log("✅ SMTP prêt !");
});

// ---------------- tous les sites realiser par devpioneers ----------------
const projets = [
    { title: "Site Accrobranche", description: "Parc d'aventure.", url: "https://www.acrobranch.sn/" },
    { title: "K&L-elegance", description: "Elegance pour tous.", url: "https://k-l-elegance.myshopify.com/" },
    { title: "Nike", description: "Sport brending.", url: "https://www.nike.com/fr/" },
    { title: "PSG", description: "Paris Saint Germain.", url: "https://www.psg.fr/en" },
    { title: "DevPioneers", description: "Notre agence.", url: "http://localhost:3001/" },
];

// ---------------- ROUTES ----------------

// Accueil
app.get('/', (req, res) => res.render('index'));

// test
app.get('/test', (req, res) => res.render('test'));


// Portfolio
app.get('/portfolio', (req, res) => {
    res.render('portfolio', { projets });
});

// Contact GET
app.get('/contact', (req, res) => {
    res.render('contact', { message: null });
});

// Contact POST
app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation simple
        if (!name || !email || !subject || !message) {
            return res.render('contact', { message: 'Tous les champs sont obligatoires !' });
        }

        // Validation email (basique)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('contact', { message: 'Email invalide !' });
        }

        // Anti-spam (champ caché)
        if (req.body.website) {
            return res.status(400).console.log("Spam détecté");
        }

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: process.env.EMAIL_USER,
            subject: `[Contact] ${subject}`,
            html: `
                <h3>Nouveau message</h3>
                <p><strong>Nom :</strong> ${name}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Message :</strong><br>${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.render('contact', { message: '✅ Message envoyé avec succès !' });

    } catch (error) {
        console.error("Erreur mail :", error);
        res.render('contact', { message: '❌ Une erreur est survenue.' });
    }
});

// ---------------- 404 ----------------
app.use((req, res) => {
    res.status(404).send("Page non trouvée");
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});