import {
  createAzureFunctionHandler,
  createHandler,
  createRequestLogger,
} from "../src";

const NOOP = () => {};

describe("main", () => {
  it("createAzureFunctionHandler should work", () => {
    expect(createAzureFunctionHandler(NOOP)).toBeInstanceOf(Function);
  });

  it("createHandler should work", () => {
    expect(createHandler(NOOP)).toBeInstanceOf(Function);
  });

  it("provides logging support", () => {
    expect(createRequestLogger()).toBeInstanceOf(Function);
  });
});
