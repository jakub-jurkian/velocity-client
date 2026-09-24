import { store } from "../store";

// RFC 7807 ProblemDetail, as the API returns it on every error.
interface ProblemDetail {
  title?: string;
  detail?: string;
  // Per-field messages on a 400 from `@Valid`.
  invalidFields?: Record<string, string[]>;
  [key: string]: unknown;
}

// A non-2xx response. `detail` is the server's own message when it sent one.
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;
  readonly problem: ProblemDetail | null;

  constructor(status: number, problem: ProblemDetail | null) {
    const detail = problem?.detail || problem?.title || undefined;
    super(detail ?? `Request failed (${status}).`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.problem = problem;
  }

  // First message per field from `invalidFields`. The top-level `detail` on a
  // validation failure is only the generic summary, so reading it alone
  // throws away everything useful.
  get fieldErrors(): Record<string, string> {
    const fields = this.problem?.invalidFields ?? {};
    return Object.fromEntries(
      Object.entries(fields)
        .filter(([, messages]) => Array.isArray(messages) && messages.length)
        .map(([field, messages]) => [field, messages[0]]),
    );
  }
}

// The message to show for a failed call: the server's own when it sent one,
// otherwise the caller's fallback (network down, empty error body, ...).
export const errorMessage = (error: unknown, fallback: string) =>
  (error instanceof ApiError && error.detail) || fallback;

type Query = Record<string, string | number | undefined>;

// Empty values are skipped, so an "All" filter can map to "" without sending
// `status=` to the server.
const apiUrl = (path: string, query: Query = {}) => {
  const url = new URL(`${import.meta.env.VITE_API_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
};

// A proxy or a crashed server can answer with an HTML page rather than a
// ProblemDetail, so the body is only parsed when it claims to be JSON.
const readJson = async (response: Response) => {
  if (!(response.headers.get("content-type") ?? "").includes("json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  // Defaults to the signed-in session. Pass one explicitly when the store
  // does not hold it yet (right after login), or null for an anonymous call.
  token?: string | null;
}

// One place for the base URL, the bearer token, JSON in and out, and turning a
// failed response into an ApiError. Network failures still reject as the
// browser's own TypeError, which errorMessage() maps to the fallback.
export const apiFetch = async <T = void>(
  path: string,
  { method = "GET", body, query, signal, token = store.getState().auth.token }: RequestOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(apiUrl(path, query), {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) throw new ApiError(response.status, await readJson(response));
  return (await readJson(response)) as T;
};
