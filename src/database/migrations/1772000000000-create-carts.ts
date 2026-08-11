import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCarts1772000000000 implements MigrationInterface {
    name = 'CreateCarts1772000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "carts_status_enum" AS ENUM ('active', 'converted', 'abandoned')`,
        );
        await queryRunner.query(
            `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "status" "carts_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_carts_id" PRIMARY KEY ("id"), CONSTRAINT "FK_carts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "carts_active_user_id_key" ON "carts" ("user_id") WHERE status = 'active'`,
        );
        await queryRunner.query(
            `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cart_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price_amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cart_items_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_cart_items_cart_product" UNIQUE ("cart_id", "product_id"), CONSTRAINT "CHK_cart_items_quantity_positive" CHECK ("quantity" > 0), CONSTRAINT "CHK_cart_items_price_non_negative" CHECK ("unit_price_amount" >= 0), CONSTRAINT "FK_cart_items_cart_id" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_cart_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `CREATE INDEX "cart_items_cart_id_idx" ON "cart_items" ("cart_id")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."cart_items_cart_id_idx"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(
            `DROP INDEX "public"."carts_active_user_id_key"`,
        );
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TYPE "carts_status_enum"`);
    }
}
