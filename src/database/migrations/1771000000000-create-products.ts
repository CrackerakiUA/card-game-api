import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProducts1771000000000 implements MigrationInterface {
    name = 'CreateProducts1771000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "products_type_enum" AS ENUM ('base_game', 'premium_material', 'premium_card')`,
        );
        await queryRunner.query(
            `CREATE TYPE "products_status_enum" AS ENUM ('draft', 'published', 'hidden', 'archived')`,
        );
        await queryRunner.query(
            `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(160) NOT NULL, "slug" character varying(180) NOT NULL, "short_description" character varying(500) NOT NULL, "description" text, "type" "products_type_enum" NOT NULL, "category" character varying(64) NOT NULL, "price_amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "cover_image" character varying(2048), "gallery" jsonb NOT NULL DEFAULT '[]', "stripe_price_id" character varying(255), "status" "products_status_enum" NOT NULL DEFAULT 'draft', "show_on_home" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_products_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_products_slug" UNIQUE ("slug"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "products_status_created_at_idx" ON "products" ("status", "created_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "products_category_status_idx" ON "products" ("category", "status")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."products_category_status_idx"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."products_status_created_at_idx"`,
        );
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "products_status_enum"`);
        await queryRunner.query(`DROP TYPE "products_type_enum"`);
    }
}
