import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const name = 'subone';
const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env;

async function api(path, body) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body),
        signal: AbortSignal.timeout(30_000)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(`Cloudflare ${path} failed (HTTP ${response.status}, codes ${data.errors?.map(error => error.code).join(', ') || 'unknown'})`);
    }
    return data;
}

async function resolveResource(path, nameKey, idKey, explicitId) {
    if (explicitId) return explicitId;

    async function find() {
        for (let page = 1; ; page++) {
            const { result, result_info } = await api(`${path}?page=${page}&per_page=50`);
            const match = result.find(resource => resource[nameKey] === name);
            if (match) return match[idKey];
            if (page >= (result_info?.total_pages ?? Infinity) || result.length < 50) return;
        }
    }

    const existing = await find();
    if (existing) return existing;
    try {
        const { result } = await api(path, { [nameKey]: name });
        return result[idKey];
    } catch (error) {
        // Another deployment may have created the resource after our lookup.
        const created = await find();
        if (created) return created;
        throw error;
    }
}

function wrangler(...args) {
    execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', ...args], {
        stdio: 'inherit'
    });
}

async function deploy() {
    if (!/^[a-f0-9]{32}$/i.test(account ?? '') || !token) {
        throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN before deploying.');
    }
    await readFile('dist/index.html');
    const kvId = await resolveResource('storage/kv/namespaces', 'title', 'id', process.env.SUB_ONE_KV_ID);
    const d1Id = await resolveResource('d1/database', 'name', 'uuid', process.env.SUB_ONE_D1_ID);
    if (!/^[a-f0-9]{32}$/i.test(kvId ?? '') || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(d1Id ?? '')) {
        throw new Error('Invalid Cloudflare KV or D1 ID.');
    }

    const base = await readFile('wrangler.toml', 'utf8');
    const directory = await mkdtemp('.wrangler-deploy-');
    const config = join(directory, 'wrangler.toml');
    try {
        await writeFile(config, base
            .replace('main = "worker/index.ts"', `main = ${JSON.stringify(resolve('worker/index.ts'))}`)
            .replace('directory = "./dist"', `directory = ${JSON.stringify(resolve('dist'))}`)
            .replace('binding = "SUB_ONE_KV"', `binding = "SUB_ONE_KV"\nid = "${kvId}"`)
            .replace('database_name = "subone"', `database_name = "subone"\ndatabase_id = "${d1Id}"`));
        wrangler('d1', 'execute', 'SUB_ONE_D1', '--remote', '--yes', '--file', resolve('db/init.sql'), '--config', config);
        wrangler('deploy', '--config', config);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}

deploy().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
