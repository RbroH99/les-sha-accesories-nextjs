ALTER TABLE "order_items" RENAME COLUMN "price" TO "original_price";--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "final_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "discount_type" "discount_type";--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "discount_value" numeric(10, 2);