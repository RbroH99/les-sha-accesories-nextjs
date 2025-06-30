CREATE TABLE "refresh_tokens" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
