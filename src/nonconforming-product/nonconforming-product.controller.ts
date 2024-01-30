import { Body, Controller, Get, Post } from '@nestjs/common';
import { NonconformingProductService } from './nonconforming-product.service';
import { CreateNonconformingProductDto } from './dto/create-ncp-product';

@Controller('nonconforming_products')
export class NonconformingProductController {
  constructor(private readonly ncpService: NonconformingProductService) {}

  @Post()
  create(@Body() product: CreateNonconformingProductDto) {
    return this.ncpService.create(product);
  }

  @Get('/groups')
  findGroups() {
    return this.ncpService.findGroups();
  }
}
