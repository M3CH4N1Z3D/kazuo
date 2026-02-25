import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1730907187782 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auth0Id" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_auth0Id" ON "users" ("auth0Id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Implementation for reverting the changes
        // We can't easily check "IF EXISTS" in standard drop column in all drivers without raw SQL too, 
        // but for down migrations, standard methods are usually fine unless partial rollback is expected.
        // However, to be consistent and safe:
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_users_auth0Id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "auth0Id"`);
    }
}
