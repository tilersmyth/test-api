import { Module } from '@nestjs/common';

import { NonconformingProductModule } from './nonconforming-product/nonconforming-product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, NonconformingProductModule],
})
export class ApiModule {}
