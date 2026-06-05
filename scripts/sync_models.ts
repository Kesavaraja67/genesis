// Set environment variable BEFORE anything else is imported
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_1MRIPoknF7Cf@ep-polished-grass-aoykegh0.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function sync() {
  const { prisma } = await import('../lib/db');

  const apps = await prisma.app.findMany();
  for (const app of apps) {
    const configModels: any = (app.config as any)?.models ?? [];
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
