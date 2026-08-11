import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreatePlayerMapMarkers1776000000000 implements MigrationInterface {
    name = 'CreatePlayerMapMarkers1776000000000';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "player_map_markers_status_enum" AS ENUM ('active', 'hidden', 'completed')`,
        );
        await queryRunner.query(
            `CREATE TABLE "player_map_markers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "message" character varying(280), "status" "player_map_markers_status_enum" NOT NULL DEFAULT 'active', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_player_map_markers" PRIMARY KEY ("id"), CONSTRAINT "CHK_marker_latitude" CHECK ("latitude" BETWEEN -90 AND 90), CONSTRAINT "CHK_marker_longitude" CHECK ("longitude" BETWEEN -180 AND 180), CONSTRAINT "FK_marker_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT)`,
        );
        await queryRunner.query(
            `CREATE INDEX "player_map_markers_active_location_idx" ON "player_map_markers" ("status", "latitude", "longitude")`,
        );
        await queryRunner.query(
            `CREATE INDEX "player_map_markers_user_id_idx" ON "player_map_markers" ("user_id")`,
        );
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "public"."player_map_markers_user_id_idx"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."player_map_markers_active_location_idx"`,
        );
        await queryRunner.query(`DROP TABLE "player_map_markers"`);
        await queryRunner.query(`DROP TYPE "player_map_markers_status_enum"`);
    }
}
