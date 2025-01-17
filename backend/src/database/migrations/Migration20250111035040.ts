import { Migration } from '@mikro-orm/migrations';

export class Migration20250111035040 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "Post" ("id" serial primary key, "created_at" date not null, "updated_at" date not null, "title" text not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "Post" cascade;`);
  }

}
