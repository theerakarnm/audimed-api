import { test, expect } from 'bun:test';
import { hashPassword, comparePassword } from '../utils/bcrypt';

test('hashPassword should return a hash', async () => {
  const password = 'password123';
  const hash = await hashPassword(password);
  expect(hash).toBeString();
  expect(hash).not.toBe(password);
});

test('comparePassword should return true for correct password', async () => {
  const password = 'password123';
  const hash = await hashPassword(password);
  const result = await comparePassword(password, hash);
  expect(result).toBe(true);
});

test('comparePassword should return false for incorrect password', async () => {
  const password = 'password123';
  const incorrectPassword = 'wrongpassword';
  const hash = await hashPassword(password);
  const result = await comparePassword(incorrectPassword, hash);
  expect(result).toBe(false);
});
