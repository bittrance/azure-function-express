# azure-function-express

<a href="https://azure.microsoft.com/en-us/services/functions/">
  <img align="right" alt="Function logo" src="docs/media/function.png" title="Function" width="150"/>
</a>

[![npm version](https://img.shields.io/npm/v/@bittrance/azure-function-express.svg)](https://www.npmjs.com/package/azure-function-express)
![Node](https://img.shields.io/badge/node-v8-blue.svg)
![Node](https://img.shields.io/badge/node-v16-blue.svg)
[![.github/workflows/verify.yaml](https://github.com/bittrance/azure-function-express/actions/workflows/verify.yaml/badge.svg)](https://github.com/bittrance/azure-function-express/actions/workflows/verify.yaml)
[![Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Connect your [Express](https://expressjs.com) application to an [Azure Function handler](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node), and make seamless usage of [all middlewares](http://expressjs.com/en/guide/using-middleware.html) you are already familiar with.

This is a fork of [azure-fuction-express](https://github.com/yvele/azure-function-express) which appears to be abandoned.


## Usage

In your `index.js`:

```js
const createHandler = require("azure-function-express").createHandler;
const express = require("express");

// Create express app as usual
const app = express();
app.get("/api/:foo/:bar", (req, res) => {
  res.json({
    foo  : req.params.foo,
    bar  : req.params.bar
  });
});

// Binds the express app to an Azure Function handler
module.exports = createHandler(app);
```

Make sure you are binding `req` and `res` in your `function.json`:

```json
{
  "bindings": [{
    "authLevel" : "anonymous",
    "type"      : "httpTrigger",
    "direction" : "in",
    "name"      : "req",
    "route"     : "foo/{bar}/{id}"
  }, {
    "type"      : "http",
    "direction" : "out",
    "name"      : "res"
  }]
}
```

To allow Express handles all HTTP routes itself you may set a glob star route in a single root `function.json`:

```json
{
  "bindings": [{
    "authLevel" : "anonymous",
    "type"      : "httpTrigger",
    "direction" : "in",
    "name"      : "req",
    "route"     : "{*segments}"
  }, {
    "type"      : "http",
    "direction" : "out",
    "name"      : "res"
  }]
}
```

Note that `segments` is not used and could be anything. See [Azure Function documentation](https://github.com/Azure/azure-webjobs-sdk-script/wiki/Http-Functions).

All examples [here](/examples/).


## Context

All native Azure Functions [context](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#context-object) properties, except `done`, are exposed through `req.context`.

As en example, you can [log](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#writing-trace-output-to-the-console) using:

```js
app.get("/api/hello-world", (req, res) => {
  req.context.log({ hello: "world" });
  ...
});
```

## Logging

This package also provides a simple logging middleware that makes use of `context.log`. Install it like so:

```js
const app = express();
app.get("/", (req, res) => { /* ... */ });
// Add logging middleware after routes
app.use(createErrorLogger());
app.use(createRequestLogger());
module.exports = createHandler(app);
```

This will cause Azure Functions to output your logs to Azure Monitor.

If you decide to introduce a middleware that recovers from an error condition, for example by converting a validation error into a HTTP status code 422 response, you may want to retain the exception in your request logging for analysis. You can do this by setting `res.cause` which will be included in the request log. For example:

```js
app.use((err, req, res, next) => {
  if (err.type == "validation") {
    res.sendStatus(422);
    res.cause = err;
    next(); // Recover
  }
  next(err);
});
```

## Runtime compatibility

Supported Node version are Node 8 through to 16.

Azure Functions runtime v1 (with Node 8), v2 and v3 are supported. v4 is currently untested.


## License

- [Apache 2.0](LICENSE) © Bittrance
- [Apache 2.0](LICENSE) © Yves Merlicco
