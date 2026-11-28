import { vi } from "vitest";

interface MutateOptions {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

/**
 * A mutate() mock that runs the success callback the caller passed.
 *
 * Forms close from that callback rather than right after firing, so a mock that
 * ignores it never closes and the test sees a form that stayed open.
 */
export const mutateMock = () =>
    vi.fn((_payload: unknown, options?: MutateOptions) => options?.onSuccess?.());

/** The same, for a mutation that is expected to fail */
export const failingMutateMock = (error: unknown = new Error('rejected')) =>
    vi.fn((_payload: unknown, options?: MutateOptions) => options?.onError?.(error));
