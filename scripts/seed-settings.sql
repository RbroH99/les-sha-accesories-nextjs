-- Insertar configuraciones iniciales en la tabla de settings
-- Estos valores se pueden modificar desde el panel de administración

-- Configuración de envíos
INSERT INTO "settings" ("key", "value") VALUES ('shippingEnabled', 'true')
ON CONFLICT ("key") DO UPDATE SET "value" = 'true';

INSERT INTO "settings" ("key", "value") VALUES ('shippingMessage', '"3-5 días hábiles"')
ON CONFLICT ("key") DO UPDATE SET "value" = '"3-5 días hábiles"';

-- Configuración de pagos
INSERT INTO "settings" ("key", "value") VALUES ('paymentEnabled', 'true')
ON CONFLICT ("key") DO UPDATE SET "value" = 'true';

INSERT INTO "settings" ("key", "value") VALUES ('paymentMessage', '"Los pagos en línea están deshabilitados. Contáctanos para coordinar el pago."')
ON CONFLICT ("key") DO UPDATE SET "value" = '"Los pagos en línea están deshabilitados. Contáctanos para coordinar el pago."';

-- Configuración de impuestos
INSERT INTO "settings" ("key", "value") VALUES ('taxEnabled', 'true')
ON CONFLICT ("key") DO UPDATE SET "value" = 'true';

INSERT INTO "settings" ("key", "value") VALUES ('taxRate', '16')
ON CONFLICT ("key") DO UPDATE SET "value" = '16';

INSERT INTO "settings" ("key", "value") VALUES ('taxName', '"IVA"')
ON CONFLICT ("key") DO UPDATE SET "value" = '"IVA"';
