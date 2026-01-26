import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('MProject Manager API')
    .setDescription('API for managing projects, tasks, agendas, and more')
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  console.log('OpenAPI spec written to openapi.json');
  await app.close();
}

generateOpenApi();
