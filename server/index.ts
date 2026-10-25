import { app } from './app.ts';

const PORT = parseInt(process.env.PORT || '5001', 10);

app.listen(PORT, () => {
  console.log(`[FinIntel Server] Backend server running on http://localhost:${PORT}`);
});
