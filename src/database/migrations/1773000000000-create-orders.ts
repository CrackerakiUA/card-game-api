import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1773000000000 implements MigrationInterface {
    name = 'CreateOrders1773000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "orders_status_enum" AS ENUM ('pending', 'waiting_payment', 'paid', 'payment_failed', 'processing', 'shipped', 'completed')`,
        );
        await queryRunner.query(
            `CREATE TYPE "orders_payment_status_enum" AS ENUM ('pending', 'paid', 'failed')`,
        );
        await queryRunner.query(
            `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "status" "orders_status_enum" NOT NULL DEFAULT 'pending', "payment_status" "orders_payment_status_enum" NOT NULL DEFAULT 'pending', "delivery_method" character varying(64), "delivery_address" jsonb, "total_amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "stripe_checkout_session_id" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "paid_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_orders_total_non_negative" CHECK ("total_amount" >= 0), CONSTRAINT "FK_orders_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `CREATE INDEX "orders_user_id_created_at_idx" ON "orders" ("user_id", "created_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "orders_status_created_at_idx" ON "orders" ("status", "created_at")`,
        );
        await queryRunner.query(
            `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price_amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_order_items_quantity_positive" CHECK ("quantity" > 0), CONSTRAINT "CHK_order_items_price_non_negative" CHECK ("unit_price_amount" >= 0), CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_order_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `CREATE INDEX "order_items_order_id_idx" ON "order_items" ("order_id")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."order_items_order_id_idx"`,
        );
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(
            `DROP INDEX "public"."orders_status_created_at_idx"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."orders_user_id_created_at_idx"`,
        );
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "orders_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "orders_status_enum"`);
    }
}
