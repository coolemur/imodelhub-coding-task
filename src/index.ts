import express from 'express';
import * as configuration from './endpoints/configuration';
import * as dynamic from './endpoints/dynamic';

const app = express();
app.use(express.json());

app.get('/configuration', configuration.get);
app.post('/configuration', configuration.post);

app.get('/:path', dynamic.get);
app.post('/:path', dynamic.post);

app.listen(4000, () => {
  console.log('Listening on port 3000');
});