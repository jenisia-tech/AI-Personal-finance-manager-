import { app } from './app.ts';

const PORT = parseInt(process.env.PORT || '5001', 10);

const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`[FinIntel Server] Backend server running on http://${HOST}:${PORT}`);
});
