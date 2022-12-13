import { Args, Query, Resolver } from '@nestjs/graphql';
import { ErrorProductNotFoundByUuid } from './errors';
import { IProductRepository } from './product.repository';
import { Product, ProductFiltersInput, ProductResponse } from './types';

@Resolver('Product')
export class ProductController {
  constructor(private readonly productRepository: IProductRepository) {}

  @Query(() => Product, { description: 'Get a specific product' })
  async product(
    @Args('uuid')
    uuid: string,
  ): Promise<Product> {
    const product = await this.productRepository.getProduct(uuid);

    if (!product) {
      throw new ErrorProductNotFoundByUuid(uuid);
    }

    return product;
  }

  @Query(() => ProductResponse, { description: 'Paginated list of products' })
  async products(
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('perPage', { defaultValue: 20 }) perPage: number,
    @Args('filters', { defaultValue: {} }) filters: ProductFiltersInput,
  ): Promise<ProductResponse> {
    const filterQuery = filtersToQuery(filters);
    const options = {
      projection: { _id: 0 },
      sort: { createdAt: -1 },
      skip: (page - 1) * perPage,
      limit: perPage,
    };

    const paginatedProducts = await this.productsCollection
      .find<Product>(filterQuery, options)
      .toArray();

    const totalItems: number = await this.productsCollection.countDocuments(filterQuery);
    const lastPage: number = Math.ceil(totalItems / perPage) || page;

    if (page > lastPage) {
      throw new ErrorPageDoesNotExist(page, lastPage);
    }

    return {
      items: paginatedProducts,
      totalItems,
      hasMore: totalItems > perPage,
      currentPage: page,
      hasNextPage: lastPage > page,
      lastPage,
    };
  }
}
