type RequestAbortError = {
    code: number;
    message: string;
    name: string;
  };

const activeRequests: { [s: string]: AbortController } = {};

async function fetchData(url: RequestInfo | URL, init?: RequestInit | undefined, cancellationToken = ''): Promise<unknown> {
    const controller = new AbortController();
    if (cancellationToken) {
        activeRequests[cancellationToken]?.abort();

        activeRequests[cancellationToken] = controller;
    }
    
    let response: Response;

    response = await fetch(url, {
    ...init,
    ...(cancellationToken ? {signal: controller.signal} : {})
    });

    if (!response.ok) {
        const error = await response.text();
        
        return Promise.reject(JSON.parse(error));
    }

    cancellationToken && delete activeRequests[cancellationToken];
    return response.json();
}

function getErrorMessage(error: any): string {
    let errorMessage = "An error occurred. Try again later.";
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message as string;
    }
  
    return errorMessage;
  }

function isRequestAbortError(error: unknown): error is RequestAbortError {
    const verifyProps = (err: unknown): err is RequestAbortError => {
      return (
        typeof err === "object" &&
        err != null &&
        "code" in err &&
        "message" in err &&
        "name" in err
      );
    };
    const verifyValues = (err: RequestAbortError) => {
      return (
        err.code === 20 &&
        err.message === "The user aborted a request." &&
        err.name === "AbortError"
      );
    };
  
    return verifyProps(error) && verifyValues(error);
  }

export default fetchData;

export { getErrorMessage, isRequestAbortError }