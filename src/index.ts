import express from 'express';
import * as configuration from './endpoints/configuration';

const app = express();
app.use(express.json());

app.get('/configuration', configuration.get);
app.post('/configuration', configuration.post);

app.listen(4000, () => {
  console.log('Listening on port 3000');
});