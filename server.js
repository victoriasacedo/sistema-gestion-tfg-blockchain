'use strict';

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { submitTransaction, evaluateTransaction } = require('./fabric');

const app = express();

let _ipfsClient = null;

async function getIpfsClient() {
  if (_ipfsClient) return _ipfsClient;

  const mod = await import('ipfs-http-client');
  const create = mod.create || mod.default?.create;
  if (!create) throw new Error('No se pudo cargar ipfs-http-client (create)');

  _ipfsClient = create({ url: process.env.IPFS_API || 'http://127.0.0.1:5001' });
  return _ipfsClient;
}


app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/anteproyecto/submit-file', upload.single('file'), async (req, res) => {
  try {
    const tfgId = req.body.tfgId;
    if (!tfgId) return res.status(400).json({ error: 'Missing tfgId' });
    if (!req.file) return res.status(400).json({ error: 'Missing file' });

    const ipfs = await getIpfsClient();

    // 1) Subir a IPFS
    const added = await ipfs.add({
      content: req.file.buffer,
    });

    const cid = added.cid.toString();
    const url = `https://ipfs.io/ipfs/${cid}`; // para demo; luego puedes usar gateway local

    // 2) Registrar en Fabric
    const out = await submitTransaction('submitAnteproyecto', [tfgId, cid, url]);

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.post('/anteproyecto/submit', async (req, res) => {
  try {
    const { tfgId, cid, url } = req.body;
    if (!tfgId || !cid || !url) {
      return res.status(400).json({ error: 'Missing tfgId/cid/url' });
    }
    const out = await submitTransaction('submitAnteproyecto', [tfgId, cid, url]);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.post('/anteproyecto/modification', async (req, res) => {
  try {
    const { tfgId, version, comentario } = req.body;
    if (!tfgId || version === undefined) {
      return res.status(400).json({ error: 'Missing tfgId/version' });
    }
    const out = await submitTransaction('requestModification', [
      tfgId,
      String(version),
      comentario || '',
    ]);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.post('/anteproyecto/accept', async (req, res) => {
  try {
    const { tfgId, version } = req.body;
    if (!tfgId || version === undefined) {
      return res.status(400).json({ error: 'Missing tfgId/version' });
    }
    const out = await submitTransaction('acceptAnteproyecto', [tfgId, String(version)]);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/anteproyecto/:tfgId/latest', async (req, res) => {
  try {
    const out = await evaluateTransaction('queryLatestVersion', [req.params.tfgId]);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/anteproyecto/:tfgId/versions', async (req, res) => {
  try {
    const out = await evaluateTransaction('listVersions', [req.params.tfgId]);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/anteproyecto/:tfgId/:version', async (req, res) => {
  try {
    const out = await evaluateTransaction('queryAnteproyecto', [
      req.params.tfgId,
      String(req.params.version),
    ]);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
