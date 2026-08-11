import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateCards1775000000000 implements MigrationInterface {
    name = 'CreateCards1775000000000';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "cards_status_enum" AS ENUM ('available', 'registered', 'blocked', 'archived')`,
        );
        await queryRunner.query(
            `CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "card_identifier" character varying(128) NOT NULL, "title" character varying(160) NOT NULL, "description" text, "image_url" character varying(2048), "category" character varying(64) NOT NULL, "status" "cards_status_enum" NOT NULL DEFAULT 'available', "current_owner_user_id" uuid, "registered_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cards_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_cards_identifier" UNIQUE ("card_identifier"), CONSTRAINT "FK_cards_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT, CONSTRAINT "FK_cards_owner" FOREIGN KEY ("current_owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT)`,
        );
        await queryRunner.query(
            `CREATE INDEX "cards_owner_status_idx" ON "cards" ("current_owner_user_id", "status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "cards_product_id_idx" ON "cards" ("product_id")`,
        );
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."cards_product_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."cards_owner_status_idx"`);
        await queryRunner.query(`DROP TABLE "cards"`);
        await queryRunner.query(`DROP TYPE "cards_status_enum"`);
    }
}
