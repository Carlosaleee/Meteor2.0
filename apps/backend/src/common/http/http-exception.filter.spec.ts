import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";

describe("HttpExceptionFilter", () => {
  it("writes envelope errors", () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    const filter = new HttpExceptionFilter();
    filter.catch(new HttpException({ code: "X", message: "nope" }, HttpStatus.BAD_REQUEST), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: { code: "X", message: "nope", details: undefined },
    });
  });
});
