import { NonconformingProductGroupEnum } from '../../../entities/nonconforming-product.entity';

export class CreateNonconformingProductDto {
  id: number;
  weight: string;
  protein_group: number;
  processor_id: number;
  lot_number: string;
  vistatrac_sku: string;
  reason: number;
  scan_type: NonconformingProductGroupEnum;
  operator_id: number;
  created_at: Date;
}
