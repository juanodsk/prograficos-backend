// Error con código HTTP para que los services comuniquen la causa al controller
// sin acoplarse a Express. El controller lo mapea a la respuesta JSON estándar.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
