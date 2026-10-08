"use client";
import type { ApiError } from "./types";

const USER_KEY = "duolingo-demo-user";
export const getUserId = () => typeof window === "undefined" ? 1 : Number(localStorage.getItem(USER_KEY) || 1);
export const setUserId = (id: number) => localStorage.setItem(USER_KEY, String(id));

export class RequestError extends Error {
  constructor(public status: number, public body: ApiError) { super(body.message); }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Demo-User-Id": String(getUserId()), ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: "network_error", message: "Something went wrong.", details: {} }));
    throw new RequestError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

