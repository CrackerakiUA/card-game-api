import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateArticles1780000000000 implements MigrationInterface {
    name = 'CreateArticles1780000000000';
    async up(q: QueryRunner) {
        await q.query(
            `CREATE TYPE "articles_status_enum" AS ENUM ('draft','published','hidden','archived')`,
        );
        await q.query(
            `CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"title" varchar(200) NOT NULL,"slug" varchar(220) NOT NULL UNIQUE,"excerpt" varchar(500) NOT NULL,"content" text NOT NULL,"cover_image" varchar(2048),"author_user_id" uuid NOT NULL,"status" "articles_status_enum" NOT NULL DEFAULT 'draft',"is_featured" boolean NOT NULL DEFAULT false,"published_at" timestamptz,"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),PRIMARY KEY("id"))`,
        );
    }
    async down(q: QueryRunner) {
        await q.query(`DROP TABLE "articles"`);
        await q.query(`DROP TYPE "articles_status_enum"`);
    }
}
