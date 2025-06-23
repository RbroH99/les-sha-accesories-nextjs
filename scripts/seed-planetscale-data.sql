-- Actualizar los datos de ejemplo para incluir los nuevos campos
UPDATE products SET 
  availability_type = 'stock_only',
  estimated_delivery_days = 3
WHERE id = 1;

UPDATE products SET 
  availability_type = 'stock_and_order',
  estimated_delivery_days = 7
WHERE id = 2;

-- Insertar un producto sin imagen y solo a pedido
INSERT INTO products (
  name, description, price, category_id, images, stock, 
  availability_type, estimated_delivery_days, is_new, 
  has_warranty, warranty_duration, warranty_unit
) VALUES (
  'Anillo Personalizado',
  'Anillo único hecho completamente a medida según tus especificaciones',
  85.00,
  'cat_4',
  '[]',
  0,
  'order_only',
  14,
  true,
  true,
  1,
  'years'
);
