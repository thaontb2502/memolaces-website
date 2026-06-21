import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  buildCheckReport,
  formatCheckReport,
  getProductDetail,
  listProducts,
  saveProduct,
} from './product-data.js';

const PORT = Number(process.env.PORT || 4000);
const app = express();
const uploadDir = path.join(ROOT, '.tmp/product-admin-uploads');
const publicDir = path.join(new URL('.', import.meta.url).pathname, 'public');

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 60,
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(publicDir));
app.use('/images', express.static(path.join(ROOT, 'public/images')));

app.get('/api/products', (_request, response) => {
  response.json(listProducts());
});

app.get('/api/products/:id', (request, response) => {
  const product = getProductDetail(request.params.id);
  if (!product) {
    response.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    return;
  }
  response.json(product);
});

app.post('/api/products', upload.any(), (request, response) => {
  handleSave(request, response);
});

app.put('/api/products/:id', upload.any(), (request, response) => {
  handleSave(request, response, request.params.id);
});

app.get('/api/check', (_request, response) => {
  const report = buildCheckReport();
  response.json({ report, text: formatCheckReport(report) });
});

const handleSave = (request, response, productId = '') => {
  let payload;
  try {
    payload = JSON.parse(request.body.payload || '{}');
  } catch {
    cleanupFiles(request.files || []);
    response.status(400).json({ errors: ['Payload không hợp lệ.'] });
    return;
  }

  const result = saveProduct({ productId, payload, files: request.files || [] });
  if (!result.ok) {
    response.status(result.status || 400).json({ errors: result.errors || ['Không lưu được sản phẩm.'] });
    return;
  }

  response.json(result);
};

const cleanupFiles = (files) => {
  for (const file of files) fs.rmSync(file.path, { force: true });
};

app.listen(PORT, () => {
  console.log(`MEMOLACES product admin đang chạy tại http://localhost:${PORT}`);
});

