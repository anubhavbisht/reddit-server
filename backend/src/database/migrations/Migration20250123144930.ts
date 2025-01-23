import { Migration } from '@mikro-orm/migrations';

export class Migration20250123144930 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "User" add column "email" text not null;`);
    this.addSql(`alter table "User" add constraint "User_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "User" drop constraint "User_email_unique";`);
    this.addSql(`alter table "User" drop column "email";`);
  }

}
