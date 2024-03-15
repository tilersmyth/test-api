import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NonConformingProductGroupEntity } from 'src/entities/nonconforming-product-group.entity';
import { NonConformingProductEntity } from 'src/entities/nonconforming-product.entity';

import { NonconformingProductController } from './nonconforming-product.controller';
import { NonconformingProductService } from './nonconforming-product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NonConformingProductEntity,
      NonConformingProductGroupEntity,
    ]),
  ],
  controllers: [NonconformingProductController],
  providers: [NonconformingProductService],
})
export class NonconformingProductModule {}
