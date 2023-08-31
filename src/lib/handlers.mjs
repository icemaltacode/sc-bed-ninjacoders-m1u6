import { getTagline } from './tagline.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MAIN PAGES ------------------------------------------------------------------------------------
export function home(req, res) {
    res.render('home');
}

export function about(req, res) {
    res.render('about', { tagline: getTagline() });
}
// END MAIN PAGES --------------------------------------------------------------------------------

// SETUP PHOTO CONTEST ---------------------------------------------------------------------------
export function setupPhotoContest(req, res) {
    const now = new Date();
    res.render('contest/setup-photo', { year: now.getFullYear(), month: now.getMonth() });
}
// END SETUP PHOTO CONTEST -----------------------------------------------------------------------

// API -------------------------------------------------------------------------------------------
export const api = {
    newsletterSignup: (req, res) => {
        console.log('CSRF token:', req.body._csrf);
        console.log('Name:', req.body.name);
        console.log('Email:', req.body.email);
        res.send({ result: 'success' });
    },
    setupPhotoContest: (req, res, fields, files) => {
        const uploadedFile = files.photo[0];
        const tmp_path = uploadedFile.path;
        const target_dir = `${__dirname}/../../public/contest-uploads/${req.params.year}/${req.params.month}`;

        if (!fs.existsSync(target_dir)){
            fs.mkdirSync(target_dir, { recursive: true });
        }

        fs.rename(tmp_path, `${target_dir}/${uploadedFile.originalFilename}`, function(err) {
            if (err) {
                res.send( { result: 'error', error: err.message });
                return;
            }
            fs.unlink(tmp_path, function(err) {
                if (err) {
                    res.send( { result: 'error', error: err.message });
                    return;
                }
                res.send( { result: 'success' });
            });
        });
    },
    setupPhotoContestError: (req, res, message) => {
        res.send( { result: 'error', error: message });
    }
};
// END API ---------------------------------------------------------------------------------------

// FETCH NEWSLETTER ------------------------------------------------------------------------------
export function newsletter(req, res) {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
}
// END FETCH NEWSLETTER --------------------------------------------------------------------------

// ERROR HANDLING --------------------------------------------------------------------------------
export function notFound(req, res) {
    res.render('404');
}

export function serverError(err, req, res) {
    res.render('500');
}
// END ERROR HANDLING ----------------------------------------------------------------------------

export default {
    home,
    about,
    notFound,
    serverError,
    newsletter,
    api,
    setupPhotoContest
};
