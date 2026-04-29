'use strict';

const { Contract } = require('fabric-contract-api');

class AnteproyectoContract extends Contract {
    // Helpers para claves
    _latestVersionKey(tfgId) {
        return `${tfgId}:latestVersion`;
    }

    _versionKey(tfgId, version) {
        return `${tfgId}:v${version}`;
    }

    async _getLatestVersion(ctx, tfgId) {
        const versionKey = this._latestVersionKey(tfgId);
        const data = await ctx.stub.getState(versionKey);

        if (!data || data.length === 0) {
            return 0; // aún no hay versiones
        }
        const parsed = JSON.parse(data.toString());
        return Number(parsed.latestVersion || 0);
    }

    async _setLatestVersion(ctx, tfgId, version) {
        const versionKey = this._latestVersionKey(tfgId);
        await ctx.stub.putState(
            versionKey,
            Buffer.from(JSON.stringify({ latestVersion: Number(version) }))
        );
    }

    // 1) Entrega (o re-entrega) -> crea nueva versión
    async submitAnteproyecto(ctx, tfgId, cid, url) {
        const latest = await this._getLatestVersion(ctx, tfgId);
        const newVersion = latest + 1;

        const ts = ctx.stub.getTxTimestamp();
	const millis = ts.seconds.low * 1000 + Math.floor(ts.nanos / 1e6);
	const timestamp = new Date(millis).toISOString();


        const anteproyecto = {
            tfgId,
            version: newVersion,
            estado: 'ENTREGADO',
            cid,
            url,
            timestamp
        };

        const anteproyectoKey = this._versionKey(tfgId, newVersion);

        // Guarda la nueva versión
        await ctx.stub.putState(
            anteproyectoKey,
            Buffer.from(JSON.stringify(anteproyecto))
        );

        // Actualiza puntero a última versión
        await this._setLatestVersion(ctx, tfgId, newVersion);

        return JSON.stringify(anteproyecto);
    }

    // 2) Solicitar modificación sobre una versión concreta
    async requestModification(ctx, tfgId, version, comentario) {
        const anteproyectoKey = this._versionKey(tfgId, version);
        const data = await ctx.stub.getState(anteproyectoKey);

        if (!data || data.length === 0) {
            throw new Error(`No existe anteproyecto para ${tfgId} en versión ${version}`);
        }

        const anteproyecto = JSON.parse(data.toString());

        // Reglas de transición
        if (anteproyecto.estado !== 'ENTREGADO') {
            throw new Error(`No se puede pedir modificación: estado actual = ${anteproyecto.estado}`);
        }

        anteproyecto.estado = 'MODIFICACION';
        anteproyecto.comentario = comentario || '';
        const ts = ctx.stub.getTxTimestamp();
	const millis = ts.seconds.low * 1000 + Math.floor(ts.nanos / 1e6);
	anteproyecto.timestamp = new Date(millis).toISOString();


        await ctx.stub.putState(
            anteproyectoKey,
            Buffer.from(JSON.stringify(anteproyecto))
        );

        return JSON.stringify(anteproyecto);
    }

    // 3) Aceptar una versión concreta
    async acceptAnteproyecto(ctx, tfgId, version) {
        const anteproyectoKey = this._versionKey(tfgId, version);
        const data = await ctx.stub.getState(anteproyectoKey);

        if (!data || data.length === 0) {
            throw new Error(`No existe anteproyecto para ${tfgId} en versión ${version}`);
        }

        const anteproyecto = JSON.parse(data.toString());

        // Reglas de transición
        if (anteproyecto.estado !== 'ENTREGADO') {
            throw new Error(`No se puede aceptar: estado actual = ${anteproyecto.estado}`);
        }

        anteproyecto.estado = 'ACEPTADO';
        const ts = ctx.stub.getTxTimestamp();
	const millis = ts.seconds.low * 1000 + Math.floor(ts.nanos / 1e6);
	anteproyecto.timestamp = new Date(millis).toISOString();


        await ctx.stub.putState(
            anteproyectoKey,
            Buffer.from(JSON.stringify(anteproyecto))
        );

        return JSON.stringify(anteproyecto);
    }

    // 4) Consultar una versión concreta
    async queryAnteproyecto(ctx, tfgId, version) {
        const anteproyectoKey = this._versionKey(tfgId, version);
        const data = await ctx.stub.getState(anteproyectoKey);

        if (!data || data.length === 0) {
            throw new Error(`No existe anteproyecto para ${tfgId} en versión ${version}`);
        }

        return data.toString();
    }

    // 5) Consultar última versión (metadato)
    async queryLatestVersion(ctx, tfgId) {
        const latest = await this._getLatestVersion(ctx, tfgId);
        return JSON.stringify({ tfgId, latestVersion: latest });
    }

    // 6) Listar todas las versiones (1..latest)
    // Nota: esto recorre versiones conocidas, no hace "scan" del ledger.
    async listVersions(ctx, tfgId) {
        const latest = await this._getLatestVersion(ctx, tfgId);
        if (latest === 0) {
            return JSON.stringify([]);
        }

        const all = [];
        for (let v = 1; v <= latest; v++) {
            const key = this._versionKey(tfgId, v);
            const data = await ctx.stub.getState(key);
            if (data && data.length > 0) {
                all.push(JSON.parse(data.toString()));
            }
        }
        return JSON.stringify(all);
    }
}

module.exports = AnteproyectoContract;
