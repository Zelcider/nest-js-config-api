/**
 * To throw if no product is found by uuid.
 */
export class ErrorProductNotFoundByUuid extends Error {
  constructor(productUuid: string) {
    super(`No product found with "${productUuid}" UUID`);
  }
}
