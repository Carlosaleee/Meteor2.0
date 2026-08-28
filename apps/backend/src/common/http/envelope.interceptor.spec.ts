import { EnvelopeInterceptor } from "./envelope.interceptor";
import { of, lastValueFrom } from "rxjs";

describe("EnvelopeInterceptor", () => {
  it("wraps non-envelope data with success:true", async () => {
    const interceptor = new EnvelopeInterceptor();
    const callHandler = { handle: () => of({ foo: "bar" }) } as any;
    const result = await lastValueFrom(interceptor.intercept({} as any, callHandler));
    expect(result).toEqual({ success: true, data: { foo: "bar" }, error: null });
  });

  it("passes through already enveloped success:false", async () => {
    const interceptor = new EnvelopeInterceptor();
    const envelope = { success: false, data: null, error: { code: "X", message: "fail" } };
    const callHandler = { handle: () => of(envelope) } as any;
    const result = await lastValueFrom(interceptor.intercept({} as any, callHandler));
    expect(result).toBe(envelope);
  });
});
