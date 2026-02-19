import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json()); // Para parsear o corpo das requisições JSON

  // Rota de exemplo para a impressora fiscal
  app.post("/api/print-fiscal-receipt", (req, res) => {
    const saleData = req.body;
    console.log("Recebido dados de venda para impressão fiscal:", saleData);

    // TODO: Aqui você integraria com o SDK da sua impressora fiscal
    // Isso geralmente envolve chamar um driver ou uma API de hardware
    // Exemplo: fiscalPrinterSDK.printReceipt(saleData);

    res.json({ success: true, message: "Dados recebidos para impressão fiscal." });
  });

  // Vite middleware para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Em produção, servir arquivos estáticos
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
