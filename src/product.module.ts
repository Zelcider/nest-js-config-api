import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { AppController } from './product.controller';
import { ProductRepository } from './product.repository';
import { CustomUuidScalar } from './Uuid.scalar';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      resolvers: { UUID: CustomUuidScalar },
    }),
  ],
  controllers: [AppController],
  providers: [ProductRepository],
})
export class ProductModule {}
