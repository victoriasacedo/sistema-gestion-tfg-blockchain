# 📘 Sistema de gestión del ciclo de vida del TFG

## 🧾 Descripción

Este proyecto implementa un sistema para la **gestión del ciclo de vida del Trabajo Fin de Grado (TFG)**, utilizando:

- **IPFS** → almacenamiento de documentos (PDFs)  
- **Hyperledger Fabric** → registro inmutable de eventos y estados  

El objetivo es garantizar:

- Trazabilidad completa  
- Integridad de los documentos  
- Auditabilidad del proceso académico  

> ⚠️ El sistema NO almacena documentos en la blockchain, sino pruebas verificables sobre ellos.

---

## 🧠 Idea principal

Separación de responsabilidades:

| Componente | Función |
|-----------|--------|
| IPFS | Guarda los PDFs |
| Fabric | Guarda metadatos y decisiones |

Cada documento subido genera:

- **CID (Content Identifier)** → identificador criptográfico único  
- **URL IPFS** → acceso al documento  

---

## 🔄 Modelo del sistema

### Identificadores

- `tfgId` → identifica el TFG  
- `version` → versión del documento (v1, v2…)  
- `cid` → identificador real (hash IPFS)  
- `url` → enlace de acceso  

---

### Estados del anteproyecto

- `ENTREGADO` → el alumno sube el documento  
- `MODIFICACION` → se solicitan cambios  
- `ACEPTADO` → validado por el tutor  

---

### Flujo

ENTREGADO  
│  
├──> MODIFICACION ───> ENTREGADO (nueva versión)  
│  
└──> ACEPTADO (estado final)

---

## 🏗️ Arquitectura

Usuario (curl / futuro frontend)  
↓  
Backend Node.js (Express)  
↓  
IPFS (PDFs) + Hyperledger Fabric (metadatos)

---

## 📦 Qué se almacena en Hyperledger Fabric

La blockchain **no almacena el PDF**, sino:

{
  "tfgId": "TFG-001",
  "version": 5,
  "estado": "ENTREGADO",
  "cid": "Qm...",
  "url": "https://ipfs.io/ipfs/Qm...",
  "timestamp": "2026-04-29T18:13:24.416Z"
}

### 🔑 Importante

- El **CID** identifica el documento  
- La **URL** permite acceder a él  

---

## 🔧 Funcionalidades del sistema

El sistema permite gestionar el ciclo de vida del anteproyecto mediante una API REST, que a su vez invoca funciones del chaincode desplegado en Hyperledger Fabric.

A continuación se describen las operaciones disponibles y su correspondencia interna:

---

### 📤 Envío de anteproyecto

Permite al alumno subir un documento PDF.

- Se almacena en IPFS  
- Se genera un CID  
- Se registra como una nueva versión en blockchain  
- Estado inicial: `ENTREGADO`  

**Endpoint:**

POST /anteproyecto/submit-file  

**Función en chaincode:**

submitAnteproyecto(tfgId, cid, url)

---

### ✏️ Solicitar modificación

Permite al tutor solicitar cambios sobre una versión concreta.

- Cambia el estado a `MODIFICACION`  
- Se añade un comentario  
- Se registra de forma inmutable  

**Endpoint:**

POST /anteproyecto/modification  

**Función en chaincode:**

requestModification(tfgId, version, comentario)

---

### ✅ Aceptar anteproyecto

Permite validar una versión concreta.

- Cambia el estado a `ACEPTADO`  
- Se registra en blockchain  

**Endpoint:**

POST /anteproyecto/accept  

**Función en chaincode:**

acceptAnteproyecto(tfgId, version)

---

### 🔍 Consultar última versión

Permite obtener la versión más reciente de un TFG.

**Endpoint:**

GET /anteproyecto/{tfgId}/latest  

**Función en chaincode:**

queryLatestVersion(tfgId)

---

### 📚 Listar versiones

Permite obtener el histórico completo de versiones.

**Endpoint:**

GET /anteproyecto/{tfgId}/versions  

**Función en chaincode:**

listVersions(tfgId)

---

### 📄 Consultar versión concreta

Permite recuperar una versión específica.

**Endpoint:**

GET /anteproyecto/{tfgId}/{version}  

**Función en chaincode:**

queryAnteproyecto(tfgId, version)
---

## 🧪 Ejemplo de uso

Subir archivo:

curl -X POST http://localhost:3000/anteproyecto/submit-file \
-F "tfgId=TFG-001" \
-F "file=@/ruta/al/pdf.pdf"

---

## 📁 Estructura del proyecto

tfg-backend/  
│  
├── server.js  
├── fabric.js  
├── package.json  
│  
├── chaincode/  
│   └── anteproyecto-js/  
│       ├── index.js  
│       └── lib/  
│           └── anteproyecto.js  
│  
└── scripts/  
    ├── start-fabric.sh  
    ├── env-org1.sh  
    ├── start-backend.sh  
    └── start-all.sh  

---

## ⚙️ Tecnologías

- Node.js + Express  
- Hyperledger Fabric (test-network)  
- IPFS  
- Bash (scripts)

---

## 🚀 Ejecución del sistema

### 1. Levantar Fabric

cd ~/fabric-samples/test-network  
./network.sh up createChannel -ca  

---

### 2. Configurar entorno

source ~/tfg-backend/scripts/env-org1.sh  

---

### 3. Iniciar IPFS

ipfs daemon  

---

### 4. Iniciar backend

cd ~/tfg-backend  
node server.js  

---

## ⚡ Automatización del entorno

Para simplificar el uso del sistema, se han desarrollado scripts:

tfg-backend/scripts/

Incluyen:

- start-fabric.sh  
- env-org1.sh  
- start-backend.sh  
- start-all.sh  

Arranque completo:

cd ~/tfg-backend  
./scripts/start-all.sh  

---


## 🔐 Qué aporta el sistema

- Integridad del documento (CID)  
- Acceso mediante URL  
- Histórico inmutable  
- Timestamps verificables  

---

## ⚠️ Limitaciones

- Sin interfaz gráfica  
- Sin autenticación  
- Red no persistente  

---

## 🔮 Trabajo futuro

- Frontend web  
- Sistema de autenticación  
- Evaluación automática con IA  
- Persistencia completa  

---

## 👩‍💻 Autor

Victoria Sacedo  
TFG – ETSIT
