import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import locationRoutes from './routes/locations.routes.ts';
import deliveryRoutes from './routes/deliveries.routes.ts';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/locations', locationRoutes);
app.use('/api/deliveries', deliveryRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  const message = err instanceof Error ? err.stack : String(err);
  console.error(message);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('- POST /api/locations/search');
    console.log('- POST /api/locations/details');
    console.log('- POST /api/deliveries/estimate');
  });
}

export default app;
