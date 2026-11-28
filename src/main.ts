import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>("API_PREFIX") || "api/v1";
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN") || "http://localhost:5173",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>("PORT") || 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle("MercatoIQ API")
    .setDescription(
      "API REST d’intelligence sportive et financière du football européen (Architecture Médaillon Bronze -> Silver -> Gold). Protégée par JWT Bearer Auth, RBAC (user / admin) et validation DTO stricte.",
    )
    .setVersion("1.0")
    .addServer(`http://localhost:${port}`, "Local Development")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description:
        "Saisir le jeton JWT retourné par POST /api/v1/auth/login ou POST /api/v1/auth/register",
    })
    .addTag("Health", "État de santé de l’API (Public)")
    .addTag("Auth", "Authentification JWT & RBAC (user / admin)")
    .addTag("Players", "CRUD & recherche de joueurs (Silver)")
    .addTag("Transfers", "CRUD & historique des transferts (Silver)")
    .addTag("Analytics (Gold)", "Agrégations analytiques & Modèle ML U23")
    .addTag(
      "Clubs & Competitions",
      "Référentiel des clubs et compétitions (Bronze)",
    )
    .addTag(
      "Admin & Pipeline",
      "Orchestration du pipeline Python & métriques opérationnelles",
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: "list",
    },
  });

  await app.listen(port);
  logger.log(`MercatoIQ API active sur http://localhost:${port}/${apiPrefix}`);
  logger.log(
    `Documentation Swagger disponible sur http://localhost:${port}/api/docs`,
  );
}

bootstrap();
