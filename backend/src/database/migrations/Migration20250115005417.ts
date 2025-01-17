import { Migration } from '@mikro-orm/migrations';

export class Migration20250115005417 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "User" ("id" serial primary key, "created_at" date not null, "updated_at" date not null, "username" text not null, "password" text not null);`);
    this.addSql(`alter table "User" add constraint "User_username_unique" unique ("username");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "User" cascade;`);
  }

}
