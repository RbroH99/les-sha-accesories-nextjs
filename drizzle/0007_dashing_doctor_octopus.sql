ALTER TABLE "discount_products" ALTER COLUMN "product_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "product_tags" ALTER COLUMN "product_id" SET DATA TYPE varchar;