'use strict';

const path = require('path');
const fs = require('fs');

const { Gateway, Wallets } = require('fabric-network');

const CHANNEL_NAME = process.env.CHANNEL_NAME || 'mychannel';
const CHAINCODE_NAME = process.env.CC_NAME || 'anteproyecto';

// Rutas en la test-network
const CCP_PATH = process.env.CCP_PATH || path.resolve(
  process.env.HOME,
  'fabric-samples',
  'test-network',
  'organizations',
  'peerOrganizations',
  'org1.example.com',
  'connection-org1.json'
);

const MSP_DIR = process.env.MSP_DIR || path.resolve(
  process.env.HOME,
  'fabric-samples',
  'test-network',
  'organizations',
  'peerOrganizations',
  'org1.example.com',
  'users',
  'Admin@org1.example.com',
  'msp'
);

const WALLET_DIR = process.env.WALLET_DIR || path.resolve(__dirname, 'wallet');
const IDENTITY_LABEL = process.env.IDENTITY_LABEL || 'org1-admin';

function firstFileInDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  if (!files.length) throw new Error(`No files found in ${dirPath}`);
  return path.join(dirPath, files[0]);
}

async function ensureAdminIdentity(wallet) {
  const existing = await wallet.get(IDENTITY_LABEL);
  if (existing) return;

  // Admin cert + key del MSP local (test-network)
  const certPath = path.join(MSP_DIR, 'signcerts');
  const keyPath = path.join(MSP_DIR, 'keystore');

  const certFile = firstFileInDir(certPath);
  const keyFile = firstFileInDir(keyPath);

  const certificate = fs.readFileSync(certFile, 'utf8');
  const privateKey = fs.readFileSync(keyFile, 'utf8');

  const identity = {
    credentials: { certificate, privateKey },
    mspId: 'Org1MSP',
    type: 'X.509',
  };

  await wallet.put(IDENTITY_LABEL, identity);
}

async function getContract() {
  const ccp = JSON.parse(fs.readFileSync(CCP_PATH, 'utf8'));

  const wallet = await Wallets.newFileSystemWallet(WALLET_DIR);
  await ensureAdminIdentity(wallet);

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: IDENTITY_LABEL,
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork(CHANNEL_NAME);
  const contract = network.getContract(CHAINCODE_NAME);

  return { contract, gateway };
}

async function evaluateTransaction(fnName, args = []) {
  const { contract, gateway } = await getContract();
  try {
    const result = await contract.evaluateTransaction(fnName, ...args);
    const txt = result?.toString() || '';
    return txt ? JSON.parse(txt) : txt;
  } finally {
    gateway.disconnect();
  }
}

async function submitTransaction(fnName, args = []) {
  const { contract, gateway } = await getContract();
  try {
    const result = await contract.submitTransaction(fnName, ...args);
    const txt = result?.toString() || '';
    // tu chaincode a veces devuelve JSON stringificado
    try {
      return txt ? JSON.parse(txt) : txt;
    } catch {
      return txt;
    }
  } finally {
    gateway.disconnect();
  }
}

module.exports = {
  evaluateTransaction,
  submitTransaction,
};
