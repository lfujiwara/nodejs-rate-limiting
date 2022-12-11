import { makeApp } from './app';

const app = makeApp();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
