'use strict';

const { Contract } = require('fabric-contract-api');

class AnteproyectoContract extends Contract {
    _latestVersionKey(tfgId) {
        return `${tfgId}:latestVersion`;
    }

    _versionsListKey(tfgId) {
        return `${tfgId}:versions`;
    }

    _versionKey(tfgId, version) {
        return `${tfgId}:v${version}`;
    }

    async _getLatestVersion(ctx, tfgId) {
        const data = await ctx.stub.getState(this._latestVersionKey(tfgId));

        if (!data || data.length === 0) {
            return null;
        }

        const parsed = JSON.parse(data.toString());
        return parsed.latestVersion || null;
    }

    async _setLatestVersion(ctx, tfgId, version) {
        await ctx.stub.putState(
            this._latestVersionKey(tfgId),
            Buffer.from(JSON.stringify({ latestVersion: version }))
        );
    }

    async _getVersionsList(ctx, tfgId) {
        const data = await ctx.stub.getState(this._versionsListKey(tfgId));

        if (!data || data.length === 0) {
            return [];
        }

        const parsed = JSON.parse(data.toString());
        return parsed.versions || [];
    }

    async _addVersionToList(ctx, tfgId, version) {
        const versions = await this._getVersionsList(ctx, tfgId);

        if (!versions.includes(version)) {
            versions.push(version);
        }

        await ctx.stub.putState(
            this._versionsListKey(tfgId),
            Buffer.from(JSON.stringify({ versions }))
        );
    }

    async _calculateNextVersion(ctx, tfgId) {
        const latestVersion = await this._getLatestVersion(ctx, tfgId);

        if (!latestVersion) {
            return '0.1';
        }

        const latestKey = this._versionKey(tfgId, latestVersion);
        const latestData = await ctx.stub.getState(latestKey);

        if (!latestData || latestData.length === 0) {
            throw new Error(`No existe la última versión registrada: ${latestVersion}`);
        }

        const latestAnteproyecto = JSON.parse(latestData.toString());

        if (latestVersion.startsWith('0.')) {
            if (latestAnteproyecto.estado === 'ACEPTADO') {
                return '1.0';
            }

            const parts = latestVersion.split('.');
            const minor = Number(parts[1]);

            if (Number.isNaN(minor)) {
                throw new Error(`Formato de versión no válido: ${latestVersion}`);
            }

            return `0.${minor + 1}`;
        }

        if (latestVersion === '1.0') {
            return '2.0';
        }

        if (latestVersion === '2.0') {
            throw new Error('El ciclo del TFG ya está cerrado. No se pueden registrar más entregas.');
        }

        throw new Error(`Formato de versión no reconocido: ${latestVersion}`);
    }

    _getTimestamp(ctx) {
        const ts = ctx.stub.getTxTimestamp();
        const millis = ts.seconds.low * 1000 + Math.floor(ts.nanos / 1e6);
        return new Date(millis).toISOString();
    }

    async submitAnteproyecto(ctx, tfgId, cid, url) {
        const newVersion = await this._calculateNextVersion(ctx, tfgId);
        const timestamp = this._getTimestamp(ctx);

        const estado = newVersion === '2.0' ? 'CALIFICADO' : 'ENTREGADO';

        const anteproyecto = {
            tfgId,
            version: newVersion,
            estado,
            cid,
            url,
            timestamp
        };

        const anteproyectoKey = this._versionKey(tfgId, newVersion);

        await ctx.stub.putState(
            anteproyectoKey,
            Buffer.from(JSON.stringify(anteproyecto))
        );

        await this._setLatestVersion(ctx, tfgId, newVersion);
        await this._addVersionToList(ctx, tfgId, newVersion);

        return JSON.stringify(anteproyecto);
    }

    async requestModification(ctx, tfgId, version, comentario) {
        const anteproyectoKey = this._versionKey(tfgId, version);
        const data = await ctx.stub.getState(anteproyectoKey);

        if (!data || data.length === 0) {
            throw new Error(`No existe anteproyecto para ${tfgId} en versión ${version}`);
        }

        const anteproyecto = JSON.parse(data.toString());

        if (anteproyecto.estado !== 'ENTREGADO') {
            throw new Error(`No se puede pedir modificación: estado actual = ${anteproyecto.estado}`);
        }

        anteproyecto.estado = 'MODIFICACION';
        anteproyecto.comentario = comentario || '';
        anteproyecto.timestamp = this._getTimestamp(ctx);

        await ctx.stub.putState(
            anteproyectoKey,
            Buffer.from(JSON.stringify(anteproyecto))
        );

        return JSON.stringify(anteproyecto);
    }

    async acceptAnteproyecto(ctx, tfgId, version) {
        const anteproyectoKey = this._versionKey(tfgId, version);
        const data = await ctx.stub.getState(anteproyectoKey);

        if (!data || data.length === 0) {
            throw new Error(`No existe anteproyecto para ${tfgId} en versión ${version}`);
        }

        const anteproyecto = JSON.parse(data.toString());

        if (anteproyecto.estado !== 'ENTREGADO') {
            throw new Error(`No se puede aceptar: estado actual = ${anteproyecto.estado}`);
        }

        anteproyecto.estado = 'ACEPTADO';
        anteproyecto.timestamp = this._getTimestamp(ctx);

        await ctx.stub.putState(
            anteproyectoKey,
            Buffer.from(JSON.stringify(anteproyecto))
        );

        return JSON.stringify(anteproyecto);
    }

    async queryAnteproyecto(ctx, tfgId, version) {
        const anteproyectoKey = this._versionKey(tfgId, version);
        const data = await ctx.stub.getState(anteproyectoKey);

        if (!data || data.length === 0) {
            throw new Error(`No existe anteproyecto para ${tfgId} en versión ${version}`);
        }

        return data.toString();
    }

    async queryLatestVersion(ctx, tfgId) {
        const latest = await this._getLatestVersion(ctx, tfgId);
        return JSON.stringify({ tfgId, latestVersion: latest });
    }

    async listVersions(ctx, tfgId) {
        const versions = await this._getVersionsList(ctx, tfgId);

        if (!versions.length) {
            return JSON.stringify([]);
        }

        const all = [];

        for (const version of versions) {
            const key = this._versionKey(tfgId, version);
            const data = await ctx.stub.getState(key);

            if (data && data.length > 0) {
                all.push(JSON.parse(data.toString()));
            }
        }

        return JSON.stringify(all);
    }
}

module.exports = AnteproyectoContract;
