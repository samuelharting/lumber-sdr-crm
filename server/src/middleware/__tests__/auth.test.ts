import { describe, it, expect } from 'vitest';
import { authenticateApiKey } from '../auth.js';

describe('authenticateApiKey middleware', () => {
  const createReq = (path: string, headers: Record<string, string> = {}) => ({
    path,
    headers,
    get: (header: string) => headers[header.toLowerCase()] || undefined
  } as any);
  
  const createRes = () => ({
    status: (code: number) => ({ json: (obj: any) => ({ code, ...obj }) }),
    json: (obj: any) => obj
  } as any);
  
  const next = () => 'next';

  beforeEach(() => {
    process.env.API_KEY = 'test-key-123';
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  it('should allow /api/health without key', () => {
    const req = createReq('/api/health');
    const result = authenticateApiKey(req, createRes(), next);
    expect(result).toBe('next');
  });

  it('should allow allowed origins without key', () => {
    const req = createReq('/api/leads', { 'origin': 'http://127.0.0.1:5173' });
    const result = authenticateApiKey(req, createRes(), next);
    expect(result).toBe('next');
  });

  it('should allow localhost:5173 without key', () => {
    const req = createReq('/api/leads', { 'origin': 'http://localhost:5173' });
    const result = authenticateApiKey(req, createRes(), next);
    expect(result).toBe('next');
  });

  it('should reject invalid API key', () => {
    const req = createReq('/api/leads', { 'x-api-key': 'wrong-key' });
    const res = createRes();
    const result = authenticateApiKey(req, res, next);
    
    expect(result.code).toBe(401);
    expect(result.error).toBe('Invalid or missing API key');
  });

  it('should reject missing API key', () => {
    const req = createReq('/api/leads');
    const res = createRes();
    const result = authenticateApiKey(req, res, next);
    
    expect(result.code).toBe(401);
    expect(result.error).toBe('Invalid or missing API key');
  });

  it('should allow valid API key', () => {
    const req = createReq('/api/leads', { 'x-api-key': 'test-key-123' });
    const result = authenticateApiKey(req, createRes(), next);
    expect(result).toBe('next');
  });

  it('should return error when API_KEY not configured', () => {
    delete process.env.API_KEY;
    const req = createReq('/api/leads', { 'x-api-key': 'test-key-123' });
    const res = createRes();
    const result = authenticateApiKey(req, res, next);
    
    expect(result.code).toBe(500);
    expect(result.error).toBe('API key not configured');
  });
});