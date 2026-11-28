import { Test } from "@nestjs/testing";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AnalyticsController } from "./analytics/analytics.controller";
import { AnalyticsService } from "./analytics/analytics.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { ClubsController } from "./clubs/clubs.controller";
import { ClubsService } from "./clubs/clubs.service";
import { PlayersController } from "./players/players.controller";
import { PlayersService } from "./players/players.service";
import { TransfersController } from "./transfers/transfers.controller";
import { TransfersService } from "./transfers/transfers.service";

describe("Swagger OpenAPI Document", () => {
  it("documents all controllers, DTO schemas, bearer auth, and routes cleanly", async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        AppController,
        AuthController,
        PlayersController,
        TransfersController,
        AnalyticsController,
        ClubsController,
      ],
      providers: [
        AppService,
        { provide: AuthService, useValue: {} },
        { provide: PlayersService, useValue: {} },
        { provide: TransfersService, useValue: {} },
        { provide: AnalyticsService, useValue: {} },
        { provide: ClubsService, useValue: {} },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");

    const config = new DocumentBuilder()
      .setTitle("MercatoIQ API")
      .setVersion("1.0")
      .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      })
      .addTag("Health")
      .addTag("Auth")
      .addTag("Players")
      .addTag("Transfers")
      .addTag("Analytics (Gold)")
      .addTag("Clubs & Competitions")
      .build();

    const doc = SwaggerModule.createDocument(app, config);

    expect(doc.components?.securitySchemes?.bearer).toBeDefined();
    expect(doc.paths["/api/v1/health"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/auth/login"]?.post).toBeDefined();
    expect(doc.paths["/api/v1/auth/register"]?.post).toBeDefined();
    expect(doc.paths["/api/v1/players"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/players/{id}"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/transfers"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/transfers/{id}"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/analytics/kpis"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/analytics/club-roi"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/analytics/scouting-u23"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/analytics/ucl-vs-domestic"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/analytics/super-subs"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/competitions"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/clubs"]?.get).toBeDefined();
    expect(doc.paths["/api/v1/clubs/{id}"]?.get).toBeDefined();

    expect(doc.components?.schemas?.LoginDto).toBeDefined();
    expect(doc.components?.schemas?.RegisterDto).toBeDefined();
    expect(doc.components?.schemas?.AuthResponseDto).toBeDefined();
    expect(doc.components?.schemas?.HealthResponseDto).toBeDefined();
    expect(doc.components?.schemas?.ErrorResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginationMetaDto).toBeDefined();
    expect(doc.components?.schemas?.CreatePlayerDto).toBeDefined();
    expect(doc.components?.schemas?.CreateTransferDto).toBeDefined();
    expect(doc.components?.schemas?.SilverPlayer).toBeDefined();
    expect(doc.components?.schemas?.SilverTransfer).toBeDefined();
    expect(doc.components?.schemas?.GoldClubTransferRoi).toBeDefined();
    expect(doc.components?.schemas?.GoldUclVsDomestic).toBeDefined();
    expect(doc.components?.schemas?.GoldUndervaluedScouting).toBeDefined();
    expect(doc.components?.schemas?.GoldSuperSubs).toBeDefined();
    expect(doc.components?.schemas?.KpisResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginatedPlayersResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginatedTransfersResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginatedClubRoiResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginatedUclVsDomesticResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginatedScoutingU23ResponseDto).toBeDefined();
    expect(doc.components?.schemas?.PaginatedSuperSubsResponseDto).toBeDefined();

    const expectedOperations: Array<[string, "get" | "post" | "patch" | "delete", string]> = [
      ["/api/v1/health", "get", "200"],
      ["/api/v1/auth/register", "post", "201"],
      ["/api/v1/auth/login", "post", "200"],
      ["/api/v1/players", "get", "200"],
      ["/api/v1/players", "post", "201"],
      ["/api/v1/players/{id}", "get", "200"],
      ["/api/v1/players/{id}", "patch", "200"],
      ["/api/v1/players/{id}", "delete", "200"],
      ["/api/v1/transfers", "get", "200"],
      ["/api/v1/transfers", "post", "201"],
      ["/api/v1/transfers/{id}", "get", "200"],
      ["/api/v1/transfers/{id}", "patch", "200"],
      ["/api/v1/transfers/{id}", "delete", "200"],
      ["/api/v1/analytics/kpis", "get", "200"],
      ["/api/v1/analytics/club-roi", "get", "200"],
      ["/api/v1/analytics/scouting-u23", "get", "200"],
      ["/api/v1/analytics/ucl-vs-domestic", "get", "200"],
      ["/api/v1/analytics/super-subs", "get", "200"],
    ];

    for (const [path, method, successStatus] of expectedOperations) {
      const op = doc.paths[path]?.[method];
      expect(op).toBeDefined();
      expect(op?.summary).toBeTruthy();
      const response = op?.responses?.[successStatus];
      expect(response).toBeDefined();
      expect(response && "content" in response).toBe(true);
      if (response && "content" in response) {
        expect(response.content?.["application/json"]?.schema).toBeDefined();
      }
    }

    await app.close();
  });
});
