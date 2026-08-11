import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateSupport1778000000000 implements MigrationInterface {
    name = 'CreateSupport1778000000000';
    async up(q: QueryRunner) {
        await q.query(
            `CREATE TYPE "support_status_enum" AS ENUM ('open','in_progress','answered','closed')`,
        );
        await q.query(
            `CREATE TABLE "support_tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"user_id" uuid NOT NULL,"subject" varchar(200) NOT NULL,"status" "support_status_enum" NOT NULL DEFAULT 'open',"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),"closed_at" timestamptz,PRIMARY KEY("id"))`,
        );
        await q.query(
            `CREATE TABLE "support_ticket_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),"ticket_id" uuid NOT NULL,"author_user_id" uuid NOT NULL,"message" varchar(4000) NOT NULL,"created_at" timestamptz NOT NULL DEFAULT now(),PRIMARY KEY("id"),FOREIGN KEY("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE)`,
        );
    }
    async down(q: QueryRunner) {
        await q.query(`DROP TABLE "support_ticket_messages"`);
        await q.query(`DROP TABLE "support_tickets"`);
        await q.query(`DROP TYPE "support_status_enum"`);
    }
}
