import { AsyncLocalStorage } from "async_hooks";
import { FastifyReply, FastifyRequest } from "fastify";
import { sign, verify } from "jsonwebtoken";

export const asyncLocalStorage = new AsyncLocalStorage();

interface ContextRequest<P, Q, B> extends FastifyRequest {
  query: Q;
  params: P;
  body: B;
}

interface Context<Q = unknown, P = unknown, B = unknown> {
  request: ContextRequest<Q, P, B>;
  reply: FastifyReply;
}

type HashMap = Record<string, string | string[] | undefined>;

export const getRequest = <P = HashMap, Q = HashMap, B = HashMap>() =>
  (asyncLocalStorage.getStore() as Context<P, Q, B>).request;

export const getReply = () => (asyncLocalStorage.getStore() as Context).reply;

export const SECRET = "TOPSECRET";

interface User {
  wishlistId?: string;
  basketId?: string;
}

export const getUser = (): User | undefined => {
  const request = getRequest();
  if (request.user) {
    return request.user;
  }
  const reply = getReply();
  reply.header("cache-control", "private, must-revalidate");
  if (request.cookies.token) {
    try {
      return (request.user = verify(request.cookies.token, SECRET)) as User;
    } catch (e) {
      reply
        .status(401)
        .setCookie("token", "", { expires: new Date(0) })
        .send("Access denied");
      throw e;
    }
  }
};

export const setUser = (update: Partial<User>) => {
  const user = getUser();
  const request = getRequest();
  request.user = { ...user, ...update };
  getReply().setCookie("token", sign(JSON.stringify(request.user), SECRET), {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  });
};
