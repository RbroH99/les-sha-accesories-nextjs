-- Agregar campo de período de devoluciones a la tabla de productos
ALTER TABLE products 
ADD COLUMN return_period_days INT NOT NULL DEFAULT 30 
AFTER estimated_delivery_days;

-- Actualizar productos existentes con períodos de devolución específicos
UPDATE products 
SET return_period_days = 7 
WHERE availability_type = 'order_only';

UPDATE products 
SET return_period_days = 15 
WHERE name LIKE '%personalizado%' OR name LIKE '%custom%';
