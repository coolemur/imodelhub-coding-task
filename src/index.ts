import express from 'express';
import * as configuration from './endpoints/configuration';
import * as dynamic from './endpoints/dynamic';
import { verifyAdmins, verifyClient } from './middleware';
import db from './db';

const app = express();
app.use(express.json());

// "/configure endpoint should be accessible only by the set of clients defined at deployment time."
// Getting the list of admins from jsonDB and verifying the user in middleware
// More complex authentication could be done here, but for now, we are just verifying the user by client-id

const admins: Array<string> = db.getData('/admins');


app.get('/configuration', (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, configuration.get);

app.post('/configuration', (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, configuration.post);

app.get('/:path', verifyClient, dynamic.get);
app.post('/:path', verifyClient, dynamic.post);

app.listen(4000, () => {
  console.log('Listening on port 3000');
});
