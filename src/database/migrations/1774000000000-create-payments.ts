import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1774000000000 implements MigrationInterface {
    name = 'CreatePayments1774000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "payments_provider_enum" AS ENUM ('stripe')`,
        );
        await queryRunner.query(
            `CREATE TYPE "payments_status_enum" AS ENUM ('pending', 'paid', 'failed', 'refunded')`,
        );
        await queryRunner.query(
            `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "provider" "payments_provider_enum" NOT NULL, "status" "payments_status_enum" NOT NULL DEFAULT 'pending', "amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "provider_session_id" character varying(255), "provider_payment_id" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "paid_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_payments_amount_non_negative" CHECK ("amount" >= 0), CONSTRAINT "FK_payments_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "payments_order_provider_key" ON "payments" ("order_id", "provider")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "payments_provider_session_id_key" ON "payments" ("provider_session_id") WHERE "provider_session_id" IS NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."payments_provider_session_id_key"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."payments_order_provider_key"`,
        );
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "payments_provider_enum"`);
    }
}
