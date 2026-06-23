import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  ROOT,
  addProductImages,
  buildCheckReport,
  bulkUpdateVariants,
  formatCheckReport,
  getProductDetail,
  listBackups,
  listProducts,
  restoreBackup,
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

app.post('/api/tasks/:task', async (request, response) => {
  const commands = {
    check: ['npm', ['run', 'products:check']],
    build: ['npm', ['run', 'build']],
    deploy: ['npm', ['run', 'deploy:cf']],
  };
  const command = commands[request.params.task];
  if (!command) {
    response.status(404).json({ errors: ['Lệnh không hợp lệ.'] });
    return;
  }

  try {
    const result = await runCommand(command[0], command[1]);
    response.status(result.code === 0 ? 200 : 500).json(result);
  } catch (error) {
    response.status(500).json({ code: 1, output: error.message || 'Không chạy được lệnh.' });
  }
});

app.post('/api/bulk/variants', (request, response) => {
  const result = bulkUpdateVariants(request.body || {});
  if (!result.ok) {
    response.status(result.status || 400).json({ errors: result.errors || ['Không sửa hàng loạt được.'] });
    return;
  }
  response.json(result);
});

app.post('/api/products/:id/images', upload.array('images', 40), (request, response) => {
  const result = addProductImages({
    productId: request.params.id,
    files: request.files || [],
    imageType: request.body.imageType || 'gallery',
    optionName: request.body.optionName || '',
  });

  if (!result.ok) {
    cleanupFiles(request.files || []);
    response.status(result.status || 400).json({ errors: result.errors || ['Không thêm được ảnh.'] });
    return;
  }

  response.json(result);
});

app.get('/api/backups', (_request, response) => {
  response.json({ backups: listBackups() });
});

app.post('/api/backups/:stamp/restore', (request, response) => {
  const result = restoreBackup(request.params.stamp);
  if (!result.ok) {
    response.status(result.status || 400).json({ errors: result.errors || ['Không khôi phục được backup.'] });
    return;
  }
  response.json(result);
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

const runCommand = (command, args) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: process.env,
      shell: false,
    });
    let output = '';
    const append = (data) => {
      output += data.toString();
      if (output.length > 60000) output = output.slice(-60000);
    };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', (error) => resolve({ code: 1, output: error.message }));
    child.on('close', (code) => resolve({ code, output }));
  });

app.listen(PORT, () => {
  console.log(`MEMOLACES product admin đang chạy tại http://localhost:${PORT}`);
});
