import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';

describe('graph API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the normalized graph, including the synthetic assurance service', async () => {
    const response = await request(app.getHttpServer()).get('/api/graph').expect(200);

    const assurance = response.body.nodes.find((node: { name: string }) => node.name === 'assurance-service');
    expect(assurance).toMatchObject({ kind: 'unknown', synthetic: true });

    const consign = response.body.edges.find((edge: { from: string }) => edge.from === 'consign-service');
    expect(consign.to).toEqual(['consign-price-service']);
    expect(response.body.nodes).toHaveLength(47);
  });

  it('lists the built-in filters', async () => {
    const response = await request(app.getHttpServer()).get('/api/filters').expect(200);

    expect(response.body.filters.map((filter: { id: string }) => filter.id)).toEqual([
      'public-start',
      'sink-end',
      'vulnerable',
    ]);
  });

  it('finds the cancel-service path into postgres when ending at a sink', async () => {
    const response = await request(app.getHttpServer()).get('/api/routes').query({ filters: 'sink-end' }).expect(200);

    expect(response.body.routes).toContainEqual([
      'cancel-service',
      'user-service',
      'auth-service',
      'prod-postgresdb',
    ]);
    expect(response.body.meta.appliedFilters).toEqual(['sink-end']);
    expect(response.body.meta.truncated).toBe(false);
    expect(response.body.nodes.some((node: { name: string }) => node.name === 'prod-postgresdb')).toBe(true);
  });

  it('returns no routes when every built-in filter is combined', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/routes')
      .query({ filters: 'public-start,sink-end,vulnerable' })
      .expect(200);

    expect(response.body.meta.routeCount).toBe(0);
    expect(response.body.routes).toEqual([]);
    expect(response.body.nodes).toEqual([]);
  });

  it('rejects an unknown filter', async () => {
    const response = await request(app.getHttpServer()).get('/api/routes').query({ filters: 'nope' }).expect(400);

    expect(response.body.message).toContain('nope');
  });

  it('rejects a non-positive maxRoutes', async () => {
    await request(app.getHttpServer()).get('/api/routes').query({ maxRoutes: '0' }).expect(400);
  });
});
