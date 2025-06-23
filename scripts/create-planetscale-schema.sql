-- Actualizar la tabla de productos para incluir los nuevos campos
ALTER TABLE products 
ADD COLUMN availability_type ENUM('stock_only', 'stock_and_order', 'order_only') DEFAULT 'stock_only' NOT NULL,
ADD COLUMN estimated_delivery_days INT DEFAULT 7;

-- Modificar la columna images para permitir arrays vacíos
ALTER TABLE products 
MODIFY COLUMN images JSON NOT NULL DEFAULT '[]';
