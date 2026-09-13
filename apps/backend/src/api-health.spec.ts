import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

describe('API Health Checks', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('GET /v1/meteorology', () => {
    it('should return meteorology data', () => {
      return request(app.getHttpServer())
        .get('/v1/meteorology?locationId=ilha-comprida')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    }, 10000);
  });

  describe('GET /v1/oceanography', () => {
    it('should return oceanography data', () => {
      return request(app.getHttpServer())
        .get('/v1/oceanography')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    }, 10000);
  });

  describe('GET /v1/traffic', () => {
    it('should return traffic data', () => {
      return request(app.getHttpServer())
        .get('/v1/traffic')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('GET /v1/comercio', () => {
    it('should return commerce data', () => {
      return request(app.getHttpServer())
        .get('/v1/comercio')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });
  });

  describe('POST /v1/iron/chat', () => {
    it('should respond to chat message', () => {
      return request(app.getHttpServer())
        .post('/v1/iron/chat')
        .send({ message: 'oi' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('reply');
        });
    });
  });
});
