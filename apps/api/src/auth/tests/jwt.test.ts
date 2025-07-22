import { test, expect } from 'bun:test';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';

const payload = { id: 1 };
const accessTokenSecret = 'test-access-secret';
const refreshTokenSecret = 'test-refresh-secret';

process.env.ACCESS_TOKEN_SECRET = accessTokenSecret;
process.env.REFRESH_TOKEN_SECRET = refreshTokenSecret;

test('signAccessToken should return a token', async () => {
  const token = await signAccessToken(payload);
  expect(token).toBeString();
});

test('signRefreshToken should return a token', async () => {
  const token = await signRefreshToken(payload);
  expect(token).toBeString();
});

test('verifyToken should return the payload for a valid access token', async () => {
  const token = await signAccessToken(payload);
  const decoded = await verifyToken(token, accessTokenSecret);
  expect(decoded).not.toBeNull();
  expect(decoded.id).toBe(payload.id);
});

test('verifyToken should return the payload for a valid refresh token', async () => {
  const token = await signRefreshToken(payload);
  const decoded = await verifyToken(token, refreshTokenSecret);
  expect(decoded).not.toBeNull();
  expect(decoded.id).toBe(payload.id);
});

test('verifyToken should return null for an invalid token', async () => {
  const decoded = await verifyToken('invalidtoken', accessTokenSecret);
  expect(decoded).toBeNull();
});
