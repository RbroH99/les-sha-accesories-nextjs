import { type Order } from "@/lib/repositories/orders";

// Interfaces para Telegram
interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineButton[][];
}

// Función para limpiar y validar número de teléfono
function cleanPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remover espacios, guiones, paréntesis
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Solo números y el símbolo +
  cleaned = cleaned.replace(/[^\d+]/g, "");

  // Para México, asegurar formato correcto
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("53")) {
      cleaned = "+" + cleaned;
    } else if (cleaned.length === 10) {
      // Número de 10 dígitos, asumir México
      cleaned = "+53" + cleaned;
    } else {
      cleaned = "+53" + cleaned;
    }
  }

  // Validar longitud mínima
  return cleaned.length >= 9 ? cleaned : null;
}

// Función para generar URL de WhatsApp con mensaje predefinido
function generateWhatsAppURL(phoneNumber: string, order: Order): string {
  if (!phoneNumber) {
    return "https://web.whatsapp.com/";
  }

  const cleanPhone = cleanPhoneNumber(phoneNumber);

  if (!cleanPhone) {
    console.warn(`Invalid phone number for order ${order.id}: ${phoneNumber}`);
    return "https://web.whatsapp.com/";
  }

  const whatsappMessage = generateCustomerMessage(order);

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    whatsappMessage
  )}`;
}

// Función para generar mensaje personalizado para WhatsApp
function generateCustomerMessage(order: Order): string {
  const productsList = order.items
    .map((item) => `• ${item.quantity}x ${item.name}`)
    .join("\n");

  const shippingAddress = order.shippingAddress
    ? `${order.shippingAddress.address}, ${order.shippingAddress.city}`
    : "Por confirmar";

  return `¡Hola ${order.customerName}! 👋

Soy de *Les Sha Accesorios* y me pongo en contacto contigo respecto a tu pedido reciente.

📦 *Detalles de tu orden:*
• Número: ${order.id.slice(-8).toUpperCase()}
• Fecha: ${new Date(order.createdAt).toLocaleDateString()}
• Total: $${order.totalAmount}

🛍️ *Productos ordenados:*
${productsList}

¿Hay algo en lo que pueda ayudarte con tu pedido? ¿Tienes alguna pregunta sobre los productos o el envío?

¡Gracias por confiar en Les Sha Accesorios! ✨

_Este mensaje fue generado automáticamente desde nuestro sistema de órdenes._`;
}

// Función para formatear los detalles de los productos en el mensaje de Telegram
function formatOrderItemsProfessional(
  items: Array<{
    name: string;
    quantity: number;
    finalPrice?: number | null;
    originalPrice?: number | null;
  }>
): string {
  return items
    .map((item, index) => {
      const price = (item.finalPrice ?? item.originalPrice ?? 0).toFixed(2);
      const subtotal = (price * item.quantity).toFixed(2);
      return `• ${item.name}\n  Cantidad: ${item.quantity} unidad${
        item.quantity > 1 ? "es" : ""
      }\n  Precio unitario: $${price}\n  Subtotal: $${subtotal}`;
    })
    .join("\n\n");
}

// Función para formatear la dirección de envío profesionalmente
function formatShippingAddressProfessional(
  address: Order["shippingAddress"]
): string {
  if (!address) return "No especificada";

  return `${address.address}\n${address.city}, ${address.state}\nCódigo Postal: ${address.zipCode}\n${address.country}`;
}

// Función para determinar prioridad de la orden
function determinePriority(order: Order): string {
  const orderValue = parseFloat(order.totalAmount);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  if (orderValue > 200 || itemCount > 5) {
    return "ALTA";
  } else if (orderValue > 100 || itemCount > 2) {
    return "MEDIA";
  }
  return "NORMAL";
}

// Función para formatear el mensaje principal de Telegram
function formatProfessionalMessage(order: Order): string {
  const timestamp = new Date(order.createdAt)
    .toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
    .toUpperCase();

  const subtotal = order.items
    .reduce((sum, item) => {
      const price = item.finalPrice ?? item.originalPrice ?? 0;
      return sum + price * item.quantity;
    }, 0)
    .toFixed(2);

  return `
    📦 *¡Nueva Orden Recibida!* 📦

*ID DE ORDEN:*
#${order.id.slice(-8).toUpperCase()}

*─── INFORMACIÓN DEL CLIENTE ───*

*NOMBRE:* ${order.customerName}
*EMAIL:* ${order.customerEmail}
*TELÉFONO:* ${order.customerPhone || "No especificado"}

*─── DIRECCIÓN DE ENTREGA ───*

${formatShippingAddressProfessional(order.shippingAddress)}

${order.notes ? `*─── NOTAS DEL CLIENTE ───*\n\n"${order.notes}"\n\n` : ""}
*─── DESGLOSE DE PRODUCTOS ───*

${formatOrderItemsProfessional(order.items)}

*SUBTOTAL:* $${subtotal}
*ENVÍO:* $0.00
*DESCUENTO:* $0.00
*────────────────*
*TOTAL A PAGAR:* $${order.totalAmount}
`;
}

// Función principal para enviar notificación de orden con botones
export async function sendTelegramOrderNotification(order: Order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "Telegram environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) are not set."
    );
    return;
  }

  // Mensaje principal con formato profesional
  const message = formatProfessionalMessage(order);

  // Configuración de botones inline
  const hasValidPhone =
    order.customerPhone && cleanPhoneNumber(order.customerPhone);

  const keyboard: TelegramInlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "✓ CONFIRMAR ORDEN",
          callback_data: `confirm_order_${order.id}`,
        },
      ],
      [
        {
          text: "📋 PREPARAR ENVÍO",
          callback_data: `prepare_shipping_${order.id}`,
        },
      ],
      [
        {
          text: "👁️ VER DETALLES COMPLETOS",
          callback_data: `view_details_${order.id}`,
        },
      ],
      // Botones de contacto - condicionales según disponibilidad de teléfono
      hasValidPhone
        ? [
            {
              text: "💬 WHATSAPP CLIENTE",
              url: generateWhatsAppURL(order.customerPhone, order),
            },
          ]
        : [
            {
              text: "📧 ENVIAR EMAIL",
              callback_data: `send_email_${order.id}`,
            },
            {
              text: "👤 SIN TELÉFONO",
              callback_data: `no_phone_${order.id}`,
            },
          ],
      [
        {
          text: "❌ CANCELAR ORDEN",
          callback_data: `cancel_order_${order.id}`,
        },
        {
          text: "📊 VER ESTADÍSTICAS",
          callback_data: `view_stats_${order.id}`,
        },
      ],
    ],
  };

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
        reply_markup: keyboard, // ← Aquí van los botones
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to send Telegram notification:", result);
      console.error("Error details:", result.description);
    } else {
      console.log("Telegram notification with buttons sent successfully!");
      console.log(`Order ${order.id} notification sent to chat ${chatId}`);
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}

// Función para enviar mensaje de Telegram (auxiliar)
export async function sendTelegramMessage(
  chatId: string,
  message: string,
  keyboard?: TelegramInlineKeyboard
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        reply_markup: keyboard,
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

// Función para editar mensaje de Telegram
export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  newText: string,
  keyboard?: TelegramInlineKeyboard
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/editMessageText`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: "Markdown",
        reply_markup: keyboard,
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error editing Telegram message:", error);
    return false;
  }
}

// Función para responder a callback queries
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || "Acción procesada ✓",
        show_alert: false,
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Error answering callback query:", error);
    return false;
  }
}
