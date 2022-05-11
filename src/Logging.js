import serializers from "pino-std-serializers";

export function stripSymbolEntries(obj) {
  Object.getOwnPropertySymbols(obj).forEach((key) => {
    delete obj[key];
  });
  return obj;
}

export function createErrorLogger() {
  return (err, req, _res, next) => {
    const reqEntry = stripSymbolEntries(serializers.req(req));
    const errEntry = stripSymbolEntries(serializers.err(err));
    req.context.log.error(JSON.stringify({ req: reqEntry, err: errEntry }));
    next(err);
  };
}

export function createRequestLogger() {
  return (req, res, next) => {
    const reqEntry = stripSymbolEntries(serializers.req(req));
    const resEntry = stripSymbolEntries(serializers.res(res));
    req.context.log.info(JSON.stringify({ req: reqEntry, res: resEntry }));
    next();
  };
}
