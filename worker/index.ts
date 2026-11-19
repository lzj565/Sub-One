/// <reference types="@cloudflare/workers-types" />
import { handleApiRequest } from '../lib/backend/api/handlers';
import { handleSubRequest } from '../lib/backend/subscription/handler';
import { handleCronTrigger } from '../lib/backend/cron/index';
import type { Env } from '../lib/backend/types';

interface WorkerEnv extends Env {
    ASSETS: Fetcher;
}

async function fetchRequest(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
        return handleApiRequest(request, env);
    }

    const isStaticAsset =
        /^\/(assets|@vite|src)\/./.test(url.pathname) || /\.\w+$/.test(url.pathname);

    // UI Vue Router 前端单页路由白名单，拦截后交由静态文件（index.html）处理
    const frontendRoutes = ['/dashboard', '/subscriptions', '/profiles', '/nodes', '/login'];
    if (frontendRoutes.includes(url.pathname)) {
        // 对前端路由返回首页，支持 SPA 刷新
        return env.ASSETS.fetch(new Request(new URL('/', request.url)));
    }

    if (!isStaticAsset && url.pathname !== '/') {
        try {
            return await handleSubRequest({ request, env });
        } catch (err) {
            console.error('[Top Level Error]', err);
            return new Response(`Internal Server Error`, { status: 500 });
        }
    }

    return env.ASSETS.fetch(request);
}

export default {
    fetch: fetchRequest,
    async scheduled(_controller: ScheduledController, env: WorkerEnv) {
        const result = await handleCronTrigger(env);
        if (!result.ok) throw new Error(`Subscription refresh failed: ${result.status}`);
    }
} satisfies ExportedHandler<WorkerEnv>;
