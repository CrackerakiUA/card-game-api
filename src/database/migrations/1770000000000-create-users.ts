import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1770000000000 implements MigrationInterface {
    name = 'CreateUsers1770000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(
            `CREATE TYPE "users_role_enum" AS ENUM ('player', 'author', 'store_manager', 'support', 'admin')`,
        );
        await queryRunner.query(
            `CREATE TYPE "users_status_enum" AS ENUM ('active', 'blocked', 'deleted')`,
        );
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "auth_id" uuid NOT NULL, "email" character varying(320) NOT NULL, "nickname" character varying(32), "display_name" character varying(80), "slug" character varying(64), "avatar_url" character varying(2048), "bio" character varying(500), "role" "users_role_enum" NOT NULL DEFAULT 'player', "status" "users_status_enum" NOT NULL DEFAULT 'active', "locale" character varying(10) NOT NULL DEFAULT 'en', "show_cards_publicly" boolean NOT NULL DEFAULT true, "show_duel_history_publicly" boolean NOT NULL DEFAULT true, "last_seen_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_users_auth_id" UNIQUE ("auth_id"), CONSTRAINT "UQ_users_nickname" UNIQUE ("nickname"), CONSTRAINT "UQ_users_slug" UNIQUE ("slug"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "users_status_created_at_idx" ON "users" ("status", "created_at")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."users_status_created_at_idx"`,
        );
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "users_status_enum"`);
        await queryRunner.query(`DROP TYPE "users_role_enum"`);
    }
}
