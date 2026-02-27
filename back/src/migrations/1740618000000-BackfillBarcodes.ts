import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillBarcodes1740618000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fetch all products with NULL barcode or empty string
    const products = await queryRunner.query(
      `SELECT id FROM products WHERE barcode IS NULL OR barcode = ''`,
    );

    // Use a Set to ensure generated barcodes are unique within this batch
    const generatedBarcodes = new Set<string>();

    for (const product of products) {
      let barcode = this.generateBarcode();
      // Retry if collision in current batch (unlikely with high entropy but safe)
      while (generatedBarcodes.has(barcode)) {
        barcode = this.generateBarcode();
      }
      generatedBarcodes.add(barcode);

      await queryRunner.query(
        `UPDATE products SET barcode = '${barcode}' WHERE id = '${product.id}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot revert safely without knowing which ones were NULL
  }

  private generateBarcode(): string {
    // Generate a 12-digit numeric string to match typical EAN/UPC style if possible,
    // but ensure high entropy.
    // Timestamp (last 8 digits) + Random (4 digits)
    // 8 digits covers ~100 seconds, so collision possible if running very fast?
    // Let's use 13 digits: timestamp(9) + random(4)

    const timestamp = Date.now().toString().slice(-9);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${timestamp}${random}`;
  }
}
