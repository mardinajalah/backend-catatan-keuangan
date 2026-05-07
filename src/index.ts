import app from './app';

const PORT = parseInt(process.env.PORT as string) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} at 0.0.0.0`);
});
