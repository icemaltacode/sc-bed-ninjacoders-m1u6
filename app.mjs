import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import esMain from 'es-main';
import bodyParser from 'body-parser';
import multiparty from 'multiparty';
import handlers from './src/lib/handlers.mjs';
import { weatherMiddleware } from './src/lib/middleware/weather.mjs';

// Setup path handlers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configure Handlebars view engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', 'src/views');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(weatherMiddleware);

// Routes
app.get('/', handlers.home);
app.get('/about', handlers.about);

// Ajax Newsletter Signup
app.get('/newsletter', handlers.newsletter);
app.post('/api/newsletter-signup', handlers.api.newsletterSignup);

// Browser-Based Newsletter Signup
app.get('/newsletter-signup', handlers.newsletterSignup);
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess);
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou);

// Setup Photo Contest
app.get('/contest/setup-photo', handlers.setupPhotoContest);
app.post('/api/setup-photo-contest/:year/:month', (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        if (err) return handlers.api.setupPhotoContestError(req, res, err.message);
        handlers.api.setupPhotoContest(req, res, fields, files);
    });
});

// Error handling
app.use(handlers.notFound);
app.use(handlers.serverError); 

if (esMain(import.meta)) {
    app.listen(port, () =>
        console.log(
            `Express started on http://localhost:${port}; ` +
        'press Ctrl-C to terminate.'
        )
    );
}

export default app;