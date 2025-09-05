-- Insertar datos de ejemplo para la tienda de bisutería
USE bisuteria_store;

-- Insertar categorías
INSERT INTO categories (name, description) VALUES
('collares', 'Collares artesanales únicos y elegantes'),
('aretes', 'Aretes delicados y llamativos para toda ocasión'),
('pulseras', 'Pulseras cómodas y hermosas hechas a mano'),
('accesorios', 'Anillos, broches y otros accesorios especiales');

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category_id, image_url, stock, is_new) VALUES
-- Collares
('Collar Luna Dorada', 'Elegante collar con dije de luna en baño de oro, perfecto para ocasiones especiales', 45.00, 1, '/placeholder.svg?height=300&width=300', 15, TRUE),
('Collar Cadena Infinito', 'Collar con símbolo de infinito en plata, representa el amor eterno', 52.00, 1, '/placeholder.svg?height=300&width=300', 8, TRUE),
('Collar Perlas Vintage', 'Collar clásico con perlas naturales, estilo vintage elegante', 68.00, 1, '/placeholder.svg?height=300&width=300', 5, FALSE),
('Collar Corazón Rosa', 'Delicado collar con dije de corazón en tonos rosados', 38.00, 1, '/placeholder.svg?height=300&width=300', 12, FALSE),

-- Aretes
('Aretes Cristal Rosa', 'Delicados aretes con cristales rosados que capturan la luz', 28.00, 2, '/placeholder.svg?height=300&width=300', 20, FALSE),
('Aretes Gota Esmeralda', 'Aretes en forma de gota con piedras verdes naturales', 38.00, 2, '/placeholder.svg?height=300&width=300', 15, FALSE),
('Aretes Pluma Dorada', 'Aretes únicos con diseño de pluma en baño de oro', 32.00, 2, '/placeholder.svg?height=300&width=300', 10, TRUE),
('Aretes Estrella Plata', 'Pequeños aretes con forma de estrella en plata', 25.00,
