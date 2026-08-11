import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateNotifications1779000000000 implements MigrationInterface {
    name = 'CreateNotifications1779000000000';
    async up(queryRunner: QueryRunner) {
        await queryRunner.query(
            `CREATE TYPE "notifications_type_enum" AS ENUM ('duel_challenge','duel_accepted','duel_result','card_received','support_reply','order_status_changed')`,
        );
        await queryRunner.query(
            `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"user_id" uuid NOT NULL,"type" "notifications_type_enum" NOT NULL,"title" varchar(200) NOT NULL,"message" varchar(1000) NOT NULL,"link_url" varchar(2048),"is_read" boolean NOT NULL DEFAULT false,"created_at" timestamptz NOT NULL DEFAULT now(),PRIMARY KEY("id"))`,
        );
    }
    async down(queryRunner: QueryRunner) {
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "notifications_type_enum"`);
    }
}
