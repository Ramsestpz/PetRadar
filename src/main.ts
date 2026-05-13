import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as appInsights from 'applicationinsights';

async function bootstrap() {
  // Initialize Application Insights
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .start();
  }

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || '3000';
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
