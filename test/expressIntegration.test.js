import express from "express";
import { res } from "pino-std-serializers";
import {
  createErrorLogger,
  createRequestLogger,
  createAzureFunctionHandler,
} from "../src";

describe("express integration", () => {

  it("should work with x-powered-by", done => {

    // 1. Create express app
    const app = express();

    app.get("/api/:foo/:bar", (req, res) => {
      res.set("Cache-Control", "max-age=600");
      res.json({ foo: req.params.foo, bar: req.params.bar });
    });

    // 2. Create handle
    const handle = createAzureFunctionHandler(app);

    // 3. Mock Azure Function context
    var context = {
      bindings  : { req: { method: "GET", originalUrl: "https://lol.com/api/foo/bar" } },
      done : (error) => {
        expect(error).toBeUndefined();
        expect(context.res.status).toBe(200);
        expect(context.res.body).toBe('{"foo":"foo","bar":"bar"}');
        expect(context.res.headers).toEqual({
          "X-Powered-By"    : "Express",
          "Cache-Control"   : "max-age=600",
          "Content-Type"    : "application/json; charset=utf-8",
          "Content-Length"  : "25",
          ETag              : 'W/"19-0CKEGOfZ5AYCM4LPaa4gzWL6olU"'
        });

        done();
      }
    };

    // 4. Call the handle with the mockup
    handle(context, context.req);
  });

  it("should work without x-powered-by", done => {

    // 1. Create express app
    const app = express();
    app.disable("x-powered-by");

    app.get("/api/:foo/:bar", (req, res) => {
      res.json({ foo: req.params.foo, bar: req.params.bar });
    });

    // 2. Create handle
    const handle = createAzureFunctionHandler(app);

    // 3. Mock Azure Function context
    var context = {
      bindings  : { req: { method: "GET", originalUrl: "https://lol.com/api/foo/bar" } },
      log       : () => { throw new Error("Log should not be called"); },
      done : (error) => {
        expect(error).toBeUndefined();
        expect(context.res.status).toBe(200);
        expect(context.res.body).toBe('{"foo":"foo","bar":"bar"}');
        expect(context.res.headers).toEqual({
          "Content-Type"    : "application/json; charset=utf-8",
          "Content-Length"  : "25",
          ETag              : 'W/"19-0CKEGOfZ5AYCM4LPaa4gzWL6olU"'
        });

        done();
      }
    };

    // 4. Call the handle with the mockup
    handle(context, context.req);
  });

  describe("looking at logging", () => {
    const messages = [];
    const errors = [];
    const context = {
      bindings: {
        req: { method: "GET", originalUrl: "https://lol.com/" },
      },
      log: {
        error: (message) => errors.push(message),
        info: (message) => messages.push(message),
      },
    };

    beforeEach(() => {
      messages.length = 0;
      errors.length = 0;
    });

    it("logs errors as described in README", (done) => {
      context.done = (_err) => {
        expect(messages).toEqual([]);
        expect(errors).toEqual([expect.stringMatching(/boom!/)]);
        done();
      };

      const app = express();
      app.get("/", (_req, _res, next) => {
        next(new Error("boom!"));
      });
      app.use(createErrorLogger());
      app.use(createRequestLogger());
      const handle = createAzureFunctionHandler(app);
      handle(context, context.req);
    });

    it("logs requests as described in README", (done) => {
      context.done = (_err) => {
        // context.done() is called as part of send, i.e. before logging.
        // This may in fact be a defect: the runtime may well be evicted
        // immediately on calling done().
        setTimeout(() => {
          expect(messages).toEqual([expect.stringMatching(/statusCode.*200/)]);
          expect(errors).toEqual([]);
          done();
        }, 100);
      };

      const app = express();
      app.get("/", (_req, res, next) => {
        res.send("hello");
        next();
      });
      app.use(createErrorLogger());
      app.use(createRequestLogger());
      const handle = createAzureFunctionHandler(app);
      handle(context, context.req);
    });
  });
});
