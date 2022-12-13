import { Injectable } from '@nestjs/common';
import { Product, ProductFiltersInput } from './types';
import { FilterQuery } from 'mongodb';

export interface IProductRepository {
  getProduct(productUuid: string): Promise<Product | null>;

  getAllProducts(
    page: number,
    perPage: number,
    filters: ProductFiltersInput,
  ): Promise<Product[]>;
}

@Injectable()
export class ProductRepository implements IProductRepository {
  getProduct(productUuid: string): Promise<Product> {
    throw new Error('Method not implemented.');
  }
  async getAllProducts(
    page: number,
    perPage: number,
    filters: ProductFiltersInput,
  ): Promise<Product[]> {
    const filterQuery = this.filtersToQuery(filters);
    const options = {
      projection: { _id: 0 },
      sort: { createdAt: -1 },
      skip: (page - 1) * perPage,
      limit: perPage,
    };

    const paginatedProducts = await this.productsCollection
      .find<Product>(filterQuery, options)
      .toArray();

    const totalItems: number = await this.productsCollection.countDocuments(
      filterQuery,
    );
    const lastPage: number = Math.ceil(totalItems / perPage) || page;

    if (page > lastPage) {
      throw new ErrorPageDoesNotExist(page, lastPage);
    }

    return paginatedProducts;
  }

  filtersToQuery = (filters: ProductFiltersInput): FilterQuery<Product> => ({
    ...(filters.uuids ? { uuid: { $in: filters.uuids } } : {}),
    ...(filters.categories ? { category: { $in: filters.categories } } : {}),
    ...(filters.name ? { name: filters.name } : {}),
    ...(filters.custodian ? { custodian: filters.custodian } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.onboardable ? { onboardable: filters.onboardable } : {}),
    // Deprecated
    ...(filters.uuid ? { uuid: filters.uuid } : {}),
    ...(filters.category ? { category: filters.category } : {}),
  });
}
