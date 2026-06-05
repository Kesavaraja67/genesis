import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function sync() {
  const { prisma } = await import('../lib/db');

  const apps = await prisma.app.findMany();
  for (const app of apps) {
    const config = app.config as Record<string, unknown> | null;
    const configModels = (config?.models as Array<{ name: string; [key: string]: unknown }>) ?? [];
    if (configModels.length > 0) {
      console.log(`Syncing models for app ${app.id}...`);
      for (const m of configModels) {
        await prisma.appModel.upsert({
          where: { appId_name: { appId: app.id, name: m.name } },
          create: { appId: app.id, name: m.name, schema: m as never },
          update: { schema: m as never }
        });
      }
    } else {
      console.log(`No models found for app ${app.id}`);
    }
  }
}

sync().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
