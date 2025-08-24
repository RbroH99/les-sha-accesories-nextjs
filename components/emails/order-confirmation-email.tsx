import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  orderDate: string;
  totalAmount: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    name: string;
    quantity: number;
    finalPrice: string;
    image?: string;
  }[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  orderDate,
  totalAmount,
  shippingAddress,
  items,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirmación de tu pedido en Lesha Accesorios</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          {/* Asegúrate de que el logo esté accesible públicamente */}
          <Img
            src={`${baseUrl}/logolessha.svg`}
            width="150"
            height="auto"
            alt="Lesha Accesorios"
          />
        </Section>
        <Heading style={h1}>¡Gracias por tu compra!</Heading>
        <Text style={paragraph}>Hola {customerName},</Text>
        <Text style={paragraph}>
          Hemos recibido tu pedido y ya lo estamos preparando. Aquí tienes los
          detalles:
        </Text>

        <Section style={detailsSection}>
          <Row>
            <Column style={detailsColumn}>
              <Text style={detailsTitle}>Número de Pedido</Text>
              <Text style={detailsValue}>{orderId}</Text>
            </Column>
            <Column style={detailsColumn}>
              <Text style={detailsTitle}>Fecha del Pedido</Text>
              <Text style={detailsValue}>{orderDate}</Text>
            </Column>
          </Row>
        </Section>

        <Hr style={hr} />

        <Section>
          <Heading as="h2" style={h2}>
            Resumen del Pedido
          </Heading>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={{ width: "64px" }}>
                <Img
                  src={item.image || `${baseUrl}/placeholder.svg`}
                  width="40"
                  height="40"
                  alt={item.name}
                  style={itemImage}
                />
              </Column>
              <Column>
                <Text style={itemTitle}>{item.name}</Text>
                <Text style={itemDescription}>Cantidad: {item.quantity}</Text>
              </Column>
              <Column style={itemPriceColumn}>
                <Text style={itemPrice}>{item.finalPrice}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Hr style={hr} />

        <Section style={totalSection}>
          <Row>
            <Column align="right">
              <Text style={totalText}>Total</Text>
            </Column>
          </Row>
          <Row>
            <Column align="right">
              <Text style={totalValue}>{totalAmount}</Text>
            </Column>
          </Row>
        </Section>

        <Hr style={hr} />

        {shippingAddress && (
          <Section>
            <Heading as="h2" style={h2}>
              Dirección de Envío
            </Heading>
            <Text style={addressText}>
              {shippingAddress.address}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
              <br />
              {shippingAddress.country}
            </Text>
          </Section>
        )}

        <Text style={paragraph}>
          Te notificaremos de nuevo cuando tu pedido haya sido enviado.
        </Text>
        <Text style={paragraph}>¡Gracias por confiar en Lesha Accesorios!</Text>

        <Hr style={hr} />

        <Section style={footer}>
          <Text>Lesha Accesorios &copy; {new Date().getFullYear()}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

// Estilos
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const logoContainer = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const h2 = {
  color: "#555",
  fontSize: "18px",
  fontWeight: "600",
  margin: "20px 0 10px",
  padding: "0 20px",
};

const paragraph = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 20px",
};

const detailsSection = {
  padding: "0 20px",
};

const detailsColumn = {
  width: "50%",
};

const detailsTitle = {
  color: "#888",
  fontSize: "14px",
};

const detailsValue = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const itemRow = {
  padding: "10px 20px",
};

const itemImage = {
  borderRadius: "4px",
};

const itemTitle = {
  fontSize: "16px",
  color: "#333",
  fontWeight: "600",
  margin: 0,
};

const itemDescription = {
  fontSize: "14px",
  color: "#777",
  margin: "2px 0 0",
};

const itemPriceColumn = {
  textAlign: "right" as const,
  verticalAlign: "middle",
};

const itemPrice = {
  fontSize: "16px",
  color: "#333",
  fontWeight: "bold",
};

const totalSection = {
  padding: "0 20px",
};

const totalText = {
  fontSize: "16px",
  color: "#888",
  margin: 0,
};

const totalValue = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#333",
  margin: "4px 0 0",
};

const addressText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#555",
  padding: "0 20px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center" as const,
  lineHeight: "15px",
  paddingTop: "20px",
};
