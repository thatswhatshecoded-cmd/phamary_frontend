const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://kirayacare.com/api"
    : "http://localhost:8000/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}/${path.replace(/^\//, "")}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
