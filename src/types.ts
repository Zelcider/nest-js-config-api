import { Field, InputType, InterfaceType, ObjectType } from '@nestjs/graphql';
import { CustomUuidScalar } from './Uuid.scalar';

@InputType()
export class ProductFiltersInput {
  @Field(() => CustomUuidScalar, {
    nullable: true,
    description: 'Uuid of the product.',
    deprecationReason: 'Use uuids instead of uuid.',
  })
  uuid?: string;

  @Field(() => [CustomUuidScalar], {
    nullable: true,
    description: 'Uuids of the products.',
  })
  uuids?: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Name of the product.',
  })
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: "Name of product's custodian.",
  })
  custodian?: 's2e' | 'sgss' | 'sogecap' | null;

  @Field(() => String, { nullable: true, description: 'Type of the product.' })
  type?: 'pee' | 'pei' | 'percol' | 'perob' | 'incentive' | 'participation';

  @Field(() => String, {
    nullable: true,
    description: 'Category of the product.',
    deprecationReason: 'Use categories instead',
    // Remove deprecated ticket https://epsor.atlassian.net/browse/XPL-736
  })
  category?: 'pee' | 'percol' | 'perob' | 'bonus';

  @Field(() => [String], {
    nullable: true,
    description: 'Category of products.',
  })
  categories?: ('pee' | 'percol' | 'perob' | 'bonus')[];

  @Field(() => Boolean, {
    nullable: true,
    description: 'If the product need an onboarding or not.',
  })
  onboardable?: boolean;
}

export type ProductCustodian = 's2e' | 'sgss' | 'sogecap' | null;
export type ProductType =
  | 'pee'
  | 'pei'
  | 'percol'
  | 'perob'
  | 'incentive'
  | 'participation';
export type ProductCategory = 'pee' | 'percol' | 'perob' | 'bonus';

// Used to dynamically cast abstract classes to correct product type
const productClassTypes: Record<ProductType, string> = {
  pee: 'Pee',
  pei: 'Pee',
  percol: 'Percol',
  perob: 'Perob',
  incentive: 'Incentive',
  participation: 'Participation',
};

@InterfaceType({
  resolveType: ({ type }) => productClassTypes[type],
  description: 'Base class for transactions.',
  isAbstract: true,
})
export class Product {
  @Field(() => String, { description: 'Type of product' })
  type: ProductType;

  @Field(() => String, { description: 'Category of product' })
  category: ProductCategory;

  @Field(() => CustomUuidScalar, { description: 'UUID of the product.' })
  uuid: string;

  @Field(() => String, { description: 'Name of the product.' })
  name: string;

  @Field(() => String, {
    nullable: true,
    description: 'Name of the custodian.',
  })
  custodian: ProductCustodian;

  @Field(() => [Regulation])
  regulations?: Regulation[];

  @Field(() => Regulation)
  currentRegulation?: Regulation;

  @Field(() => Boolean, {
    description: 'If the product needs an onboarding or not',
  })
  onboardable: boolean;

  @Field(() => Number, {
    description: 'Required seniority (in months) of a product',
    nullable: true,
  })
  requiredSeniority?: number;
}

export const isProductCategoryPerob = (category: ProductCategory): boolean => {
  return category === 'perob';
};

@ObjectType({ description: 'Regulation' })
export class Regulation {
  @Field(() => CustomUuidScalar, { description: "Regulation's uuid" })
  uuid: string;

  @Field(() => Date, { description: 'Date of consideration' })
  from: Date;

  @Field(() => Date, {
    description: 'Limit date of regulation validity (excluded)',
  })
  to: Date;

  @Field(() => Number, { description: 'PASS limit' })
  taxFreeLimit: number;

  @Field(() => Number, { description: 'Perceptible gross amount limit' })
  grossLimit: number;

  @Field(() => Number, { description: 'One sided contribution limit' })
  oneSidedContributionLimit: number;

  @Field(() => [String], {
    description: 'List of product categories uuid concerned by this regulation',
  })
  productCategories: string[];

  @Field(() => [Product], {
    description: 'List of products concerned by this regulation',
  })
  products?: Product[];

  @Field(() => Number, { description: 'Percentage owed to CSG tax.' })
  csgPercentage: number;

  @Field(() => Number, { description: 'Percentage owed to CRDS tax.' })
  crdsPercentage: number;
}

@ObjectType({ implements: Product })
export class Pee extends Product {
  @Field({ description: 'Product category' })
  category: 'pee';

  @Field(() => String, { description: 'Product type' })
  type: 'pee' | 'pei';
}

@ObjectType({ implements: Product })
export class Percol extends Product {
  @Field({ description: 'Product category' })
  category: 'percol';

  @Field({ description: 'Product type' })
  type: 'percol';
}

@ObjectType({ implements: Product })
export class Perob extends Product {
  @Field({ description: 'Product category' })
  category: 'perob';

  @Field({ description: 'Product type' })
  type: 'perob';
}

@ObjectType({ implements: Product })
export class Incentive extends Product {
  @Field({ description: 'Product category' })
  category: 'bonus';

  @Field({ description: 'Product type' })
  type: 'incentive';
}

@ObjectType({ implements: Product })
export class Participation extends Product {
  @Field({ description: 'Product category' })
  category: 'bonus';

  @Field({ description: 'Product type' })
  type: 'participation';
}

export type Products = Pee | Percol | Perob | Incentive | Participation;

@InputType()
export class ProductInput {
  @Field(() => CustomUuidScalar, { description: 'Uuid of the new product' })
  uuid: string;

  @Field(() => String, { description: 'Name of the new product' })
  name: string;

  @Field(() => String, { description: "Name of product's custodian" })
  custodian: ProductCustodian;

  @Field(() => String, { description: 'Product category' })
  category: ProductCategory;

  @Field(() => String, { description: 'Product type' })
  type: ProductType;

  @Field(() => Number, {
    description: 'Required seniority (in months) to use this product',
    nullable: true,
  })
  requiredSeniority?: number;
}
export abstract class Page<T> {
  items: T[];
  currentPage: number;
  lastPage: number;
  totalItems: number;
  hasMore: boolean;
  hasNextPage: boolean;
}

@ObjectType({ implements: Page })
export abstract class ProductResponse extends Page<Product> {
  @Field(() => [Product], { description: 'list of products.' })
  items: Product[];
}
