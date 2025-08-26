import { type Order } from "@/lib/repositories/orders";

// Función para formatear los detalles de los productos en el mensaje
function formatOrderItems(
  items: Array<{
    name: string;
    quantity: number;
    finalPrice?: number | null;
    originalPrice?: number | null;
  }>
): string {
  return items
    .map((item) => {
      const price = (item.finalPrice ?? item.originalPrice ?? 0).toFixed(2);
      return `- (${item.quantity}) x ${item.name} - $${price}`;
    })
    .join("\n");
}

// Función para formatear la dirección de envío
function formatShippingAddress(address: Order["shippingAddress"]): string {
  if (!address) return "No especificada";
  // Usamos trim() para eliminar espacios en blanco al inicio y final
  return `
- Dirección: ${address.address}
- Ciudad: ${address.city}
- Estado: ${address.state}
- Cód. Postal: ${address.zipCode}
- País: ${address.country}
  `.trim();
}

export async function sendTelegramOrderNotification(order: Order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "Telegram environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) are not set."
    );
    return; // No continuar si las variables no están configuradas
  }

  // Formatear el mensaje usando Markdown para Telegram
  // Esta plantilla es más limpia y evita errores de sintaxis
  const message = [
    `📦 *¡Nueva Orden Recibida!* 📦`,
    ``,
    `*ID de Orden:* ${order.id}`,
    ``,
    `*Cliente:*`,
    `- Nombre: ${order.customerName}`,
    `- Email: ${order.customerEmail}`,
    `- Teléfono: ${order.customerPhone || "No especificado"}`,
    ``,
    `*Dirección de Envío:*`,
    `${formatShippingAddress(order.shippingAddress)}`,
    ``,
    `*Productos:*`,
    `${formatOrderItems(order.items)}`,
    ``,
    `*Notas del Cliente:*`,
    `${order.notes || "Sin notas"}`,
    ``,
    `*Total:* $${order.totalAmount}`,
  ].join("\n");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to send Telegram notification:", result);
    } else {
      console.log("Telegram notification sent successfully!");
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}
