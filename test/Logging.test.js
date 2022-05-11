import { createRequestLogger, createErrorLogger } from "../src/Logging.js";

describe("createRequestLogger", () => {
  let messages;
  let logger;
  const req = {
    context: {
      log: {
        info: (message) => messages.push(message),
      },
    },
  };
  const res = {
    statusCode: 200,
    extra: "stuff",
  };

  beforeEach(() => {
    messages = [];
    logger = createRequestLogger();
  });

  it("logs known parts of the response", () => {
    logger(req, res, () => {});
    expect(messages).toEqual([expect.stringMatching(/statusCode.*200/)]);
  });

  it("does not log unknown parts of the response", () => {
    logger(req, res, () => {});
    expect(messages).not.toEqual([expect.stringMatching(/extra/)]);
  });

  it("calls next", (done) => {
    logger(req, res, done);
  });
});
