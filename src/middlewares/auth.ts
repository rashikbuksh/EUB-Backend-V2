import type { Context } from 'hono';
import type { JWTPayload } from 'hono/utils/jwt/types';
import env from '@/env';
import { compareSync, hash } from 'bcrypt-ts';
import { sign, verify } from 'hono/jwt';

export async function HashPass(password: string) {
  const hashPassword = await hash(password, env.SALT);

  return hashPassword;
}

export async function ComparePass(password: string, hashPassword: string) {
  return compareSync(password, hashPassword);
}

export async function CreateToken(payload: JWTPayload) {
  return sign(payload, env.PRIVATE_KEY);
}

export async function VerifyToken(token: string, c: Context) {
  const { url, method } = c.env.outgoing.req;

  console.log(`URL: ${url}, Method: ${method}`); // Add this line for debugging

  if (url === '/v1/signin' && method === 'POST') {
    console.log('Bypass URL condition met'); // Add this line for debugging
    return true;
  }

  const decodedPayload = await verify(token, env.PRIVATE_KEY);

  return !!decodedPayload;
}
