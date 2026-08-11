import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateDuels1777000000000 implements MigrationInterface {
    name = 'CreateDuels1777000000000';
    public async up(q: QueryRunner) {
        await q.query(`CREATE TYPE "duel_type_enum" AS ENUM ('standard')`);
        await q.query(
            `CREATE TYPE "duel_status_enum" AS ENUM ('pending','in_progress','waiting_player_results','completed','undetermined','declined','cancelled','expired')`,
        );
        await q.query(
            `CREATE TYPE "duel_result_status_enum" AS ENUM ('pending','agreed','disputed','undetermined')`,
        );
        await q.query(
            `CREATE TYPE "duel_role_enum" AS ENUM ('challenger','opponent')`,
        );
        await q.query(
            `CREATE TYPE "declared_result_enum" AS ENUM ('win','loss','draw')`,
        );
        await q.query(
            `CREATE TABLE "duel_challenges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "challenger_user_id" uuid NOT NULL, "opponent_user_id" uuid NOT NULL, "referee_user_id" uuid, "type" "duel_type_enum" NOT NULL DEFAULT 'standard', "status" "duel_status_enum" NOT NULL DEFAULT 'pending', "message" varchar(500), "winner_user_id" uuid, "result_status" "duel_result_status_enum" NOT NULL DEFAULT 'pending', "started_at" timestamptz, "responded_at" timestamptz, "completed_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY("id"))`,
        );
        await q.query(
            `CREATE TABLE "duel_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "duel_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role_in_duel" "duel_role_enum" NOT NULL, "declared_result" "declared_result_enum" NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY("id"), UNIQUE("duel_id","user_id"), FOREIGN KEY("duel_id") REFERENCES "duel_challenges"("id") ON DELETE CASCADE)`,
        );
        await q.query(
            `CREATE TABLE "duel_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "duel_id" uuid NOT NULL, "user_id" uuid NOT NULL, "comment" varchar(1000) NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY("id"), FOREIGN KEY("duel_id") REFERENCES "duel_challenges"("id") ON DELETE CASCADE)`,
        );
    }
    public async down(q: QueryRunner) {
        await q.query(`DROP TABLE "duel_comments"`);
        await q.query(`DROP TABLE "duel_results"`);
        await q.query(`DROP TABLE "duel_challenges"`);
        await q.query(`DROP TYPE "declared_result_enum"`);
        await q.query(`DROP TYPE "duel_role_enum"`);
        await q.query(`DROP TYPE "duel_result_status_enum"`);
        await q.query(`DROP TYPE "duel_status_enum"`);
        await q.query(`DROP TYPE "duel_type_enum"`);
    }
}
