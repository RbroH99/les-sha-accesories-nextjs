import { NextRequest, NextResponse } from "next/server";
import {
  editTelegramMessage,
  sendTelegramMessage,
  answerCallbackQuery,
} from "@/lib/telegram";
import { getOrderById, updateOrderStatus } from "@/lib/repositories/orders";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Verificar si es un callback de botón
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      console.log(`Received callback: ${data}`);

      // Procesar diferentes acciones
      if (data.startsWith("confirm_order_")) {
        const orderId = data.replace("confirm_order_", "");
        await handleConfirmOrder(orderId, chatId, messageId, callbackQuery.id);
      } else if (data.startsWith("prepare_shipping_")) {
        const orderId = data.replace("prepare_shipping_", "");
        await handlePrepareShipping(
          orderId,
          chatId,
          messageId,
          callbackQuery.id
        );
      } else if (data.startsWith("view_details_")) {
        const orderId = data.replace("view_details_", "");
        await handleViewDetails(orderId, chatId, messageId, callbackQuery.id);
      } else if (data.startsWith("cancel_order_")) {
        const orderId = data.replace("cancel_order_", "");
        await handleCancelOrder(orderId, chatId, messageId, callbackQuery.id);
      } else if (data.startsWith("send_email_")) {
        const orderId = data.replace("send_email_", "");
        await handleSendEmail(orderId, chatId, messageId, callbackQuery.id);
      } else if (data.startsWith("no_phone_")) {
        const orderId = data.replace("no_phone_", "");
        await handleNoPhone(orderId, chatId, messageId, callbackQuery.id);
      } else if (data.startsWith("view_stats_")) {
        const orderId = data.replace("view_stats_", "");
        await handleViewStats(orderId, chatId, messageId, callbackQuery.id);
      } else {
        // Callback no reconocido
        await answerCallbackQuery(callbackQuery.id, "Acción no reconocida");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Manejar confirmación de orden
async function handleConfirmOrder(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    // Actualizar estado de la orden en la base de datos
    await updateOrderStatus(orderId, "aceptado");

    // Editar mensaje original para mostrar confirmación
    await editTelegramMessage(
      chatId,
      messageId,
      `
*✅ ORDEN CONFIRMADA*

*ORDER ID:* #${orderId}
*STATUS:* CONFIRMADA Y EN PROCESO
*ACCIÓN:* Confirmada por administrador
*TIMESTAMP:* ${new Date().toLocaleString("es-MX")}

La orden ha sido confirmada y está siendo procesada.
El cliente recibirá una notificación automática.

*═══════════════════════════════*
*PRÓXIMOS PASOS:*
• Preparar productos para envío
• Generar etiqueta de envío
• Notificar al cliente
*═══════════════════════════════*
    `
    );

    await answerCallbackQuery(
      callbackQueryId,
      "✅ Orden confirmada exitosamente"
    );
  } catch (error) {
    console.error("Error confirming order:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error al confirmar orden");
  }
}

// Manejar preparación de envío
async function handlePrepareShipping(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    // Actualizar estado de la orden
    await updateOrderStatus(orderId, "pendiente");

    // Enviar nuevo mensaje con opciones de envío
    await sendTelegramMessage(
      chatId,
      `
*📦 PREPARANDO ENVÍO*

*ORDER ID:* #${orderId}
*STATUS:* EN PREPARACIÓN

*═══════════════════════════════*
*CHECKLIST DE ENVÍO:*
*═══════════════════════════════*

□ Verificar productos en stock
□ Empacar productos con cuidado
□ Generar etiqueta de envío
□ Programar recolección
□ Actualizar tracking al cliente

*TIEMPO ESTIMADO DE PREPARACIÓN: 2-4 HRS*

¿Necesitas generar la etiqueta de envío ahora?
    `,
      {
        inline_keyboard: [
          [
            {
              text: "📝 GENERAR ETIQUETA",
              callback_data: `generate_label_${orderId}`,
            },
            {
              text: "📋 LISTA EMPAQUE",
              callback_data: `packing_list_${orderId}`,
            },
          ],
          [
            {
              text: "🚚 PROGRAMAR RECOLECCIÓN",
              callback_data: `schedule_pickup_${orderId}`,
            },
          ],
          [
            {
              text: "✅ MARCAR COMO LISTO",
              callback_data: `mark_ready_${orderId}`,
            },
          ],
        ],
      }
    );

    await answerCallbackQuery(callbackQueryId, "📦 Modo preparación activado");
  } catch (error) {
    console.error("Error preparing shipping:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error en preparación");
  }
}

// Manejar ver detalles completos
async function handleViewDetails(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      await answerCallbackQuery(callbackQueryId, "❌ Orden no encontrada");
      return;
    }

    const detailedMessage = `
*🔍 DETALLES COMPLETOS DE LA ORDEN*

*═══════════════════════════════*
*INFORMACIÓN GENERAL*
*═══════════════════════════════*

*ORDER ID:* #${order.id}
*FECHA CREACIÓN:* ${new Date(order.createdAt).toLocaleString("es-MX")}
*ESTADO ACTUAL:* ${order.status?.toUpperCase() || "PENDIENTE"}

*═══════════════════════════════*
*DATOS DEL CLIENTE*
*═══════════════════════════════*

*NOMBRE COMPLETO:* ${order.customerName}
*EMAIL:* ${order.customerEmail}
*TELÉFONO:* ${order.customerPhone || "No especificado"}

*═══════════════════════════════*
*DIRECCIÓN COMPLETA DE ENVÍO*
*═══════════════════════════════*

*CALLE:* ${order.shippingAddress?.address || "No especificada"}
*CIUDAD:* ${order.shippingAddress?.city || "No especificada"}
*ESTADO:* ${order.shippingAddress?.state || "No especificado"}
*CÓDIGO POSTAL:* ${order.shippingAddress?.zipCode || "No especificado"}
*PAÍS:* ${order.shippingAddress?.country || "No especificado"}

*═══════════════════════════════*
*PRODUCTOS DETALLADOS*
*═══════════════════════════════*

${order.items
  .map((item, index) => {
    const price = (item.finalPrice ?? item.originalPrice ?? 0).toFixed(2);
    const subtotal = (parseFloat(price) * item.quantity).toFixed(2);
    return `*${index + 1}.* ${item.name}
  • Cantidad: ${item.quantity}
  • Precio unitario: $${price}
  • Subtotal: $${subtotal}`;
  })
  .join("\n\n")}

*═══════════════════════════════*
*RESUMEN FINANCIERO*
*═══════════════════════════════*

*SUBTOTAL:* $${order.items
      .reduce((sum, item) => {
        const price = item.finalPrice ?? item.originalPrice ?? 0;
        return sum + price * item.quantity;
      }, 0)
      .toFixed(2)}
*ENVÍO:* $0.00
*DESCUENTOS:* $0.00
*─────────────────────*
*TOTAL FINAL:* $${order.totalAmount}

${
  order.notes
    ? `*═══════════════════════════════*\n*NOTAS ESPECIALES DEL CLIENTE*\n*═══════════════════════════════*\n\n"${order.notes}"`
    : ""
}

*═══════════════════════════════*
*INFORMACIÓN TÉCNICA*
*═══════════════════════════════*

*FECHA ÚLTIMA ACTUALIZACIÓN:* ${new Date(
      order.updatedAt || order.createdAt
    ).toLocaleString("es-MX")}
*TOTAL DE PRODUCTOS:* ${order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )} artículos
*VALOR PROMEDIO POR ITEM:* $${(
      parseFloat(order.totalAmount) /
      order.items.reduce((sum, item) => sum + item.quantity, 0)
    ).toFixed(2)}
    `;

    await sendTelegramMessage(chatId, detailedMessage);
    await answerCallbackQuery(callbackQueryId, "📋 Detalles enviados");
  } catch (error) {
    console.error("Error viewing details:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error al obtener detalles");
  }
}

// Manejar cancelación de orden
async function handleCancelOrder(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    // Actualizar estado de la orden
    await updateOrderStatus(orderId, "cancelado");

    await editTelegramMessage(
      chatId,
      messageId,
      `
*❌ ORDEN CANCELADA*

*ORDER ID:* #${orderId}
*STATUS:* CANCELADA
*FECHA CANCELACIÓN:* ${new Date().toLocaleString("es-MX")}

⚠️ *IMPORTANTE:*
• La orden ha sido cancelada en el sistema
• Se debe notificar al cliente inmediatamente
• Revisar si requiere reembolso

*PRÓXIMAS ACCIONES REQUERIDAS:*
□ Contactar al cliente
□ Explicar motivo de cancelación
□ Procesar reembolso (si aplica)
□ Actualizar inventario
    `
    );

    await answerCallbackQuery(callbackQueryId, "❌ Orden cancelada");
  } catch (error) {
    console.error("Error cancelling order:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error al cancelar orden");
  }
}

// Manejar envío de email
async function handleSendEmail(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      await answerCallbackQuery(callbackQueryId, "❌ Orden no encontrada");
      return;
    }

    await sendTelegramMessage(
      chatId,
      `
*📧 CONTACTO POR EMAIL*

*ORDER ID:* #${orderId}
*CLIENTE:* ${order.customerName}
*EMAIL:* ${order.customerEmail}

*PLANTILLAS SUGERIDAS:*

*1. CONFIRMACIÓN DE ORDEN:*
"Hola ${order.customerName}, hemos recibido tu pedido #${orderId} por $${order.totalAmount}. Lo estamos preparando y te notificaremos cuando esté listo para envío."

*2. CONSULTA SOBRE PEDIDO:*
"Hola ${order.customerName}, nos ponemos en contacto respecto a tu pedido #${orderId}. ¿Hay algo en lo que podamos ayudarte?"

*3. ACTUALIZACIÓN DE ESTADO:*
"Tu pedido #${orderId} está siendo procesado. Te mantendremos informado del progreso."

Puedes copiar cualquiera de estos textos y enviarlos por email a ${order.customerEmail}
    `
    );

    await answerCallbackQuery(
      callbackQueryId,
      "📧 Plantillas de email enviadas"
    );
  } catch (error) {
    console.error("Error sending email templates:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error con plantillas");
  }
}

// Manejar falta de teléfono
async function handleNoPhone(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      await answerCallbackQuery(callbackQueryId, "❌ Orden no encontrada");
      return;
    }

    await sendTelegramMessage(
      chatId,
      `
*⚠️ CLIENTE SIN TELÉFONO*

*ORDER ID:* #${orderId}
*CLIENTE:* ${order.customerName}
*EMAIL ÚNICO:* ${order.customerEmail}

*OPCIONES DE CONTACTO:*

*1. EMAIL DIRECTO:*
📧 ${order.customerEmail}

*2. FORMULARIO DE CONTACTO:*
Revisar si hay formulario en el sitio web

*3. REDES SOCIALES:*
Buscar al cliente en redes sociales de Les Sha Accesorios

*RECOMENDACIÓN:*
Envía un email solicitando número de teléfono para futuras comunicaciones más efectivas.

*PLANTILLA SUGERIDA:*
"Hola ${order.customerName}, para brindarte mejor servicio con tu pedido #${orderId}, nos gustaría tener tu número de teléfono para contactarte más fácilmente. ¿Podrías compartirlo con nosotros?"
    `
    );

    await answerCallbackQuery(
      callbackQueryId,
      "📞 Opciones de contacto enviadas"
    );
  } catch (error) {
    console.error("Error handling no phone:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error en opciones");
  }
}

// Manejar ver estadísticas
async function handleViewStats(
  orderId: string,
  chatId: string,
  messageId: number,
  callbackQueryId: string
) {
  try {
    const order = await getOrderById(orderId);

    if (!order) {
      await answerCallbackQuery(callbackQueryId, "❌ Orden no encontrada");
      return;
    }

    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const avgItemPrice = parseFloat(order.totalAmount) / totalItems;
    const processingTime =
      new Date().getTime() - new Date(order.createdAt).getTime();
    const processingHours = Math.floor(processingTime / (1000 * 60 * 60));
    const processingMinutes = Math.floor(
      (processingTime % (1000 * 60 * 60)) / (1000 * 60)
    );

    await sendTelegramMessage(
      chatId,
      `
*📊 ESTADÍSTICAS DE LA ORDEN*

*═══════════════════════════════*
*MÉTRICAS PRINCIPALES*
*═══════════════════════════════*

*ORDER ID:* #${orderId}
*VALOR TOTAL:* $${order.totalAmount}
*TOTAL ITEMS:* ${totalItems} productos
*PRECIO PROMEDIO:* $${avgItemPrice.toFixed(2)} por item

*═══════════════════════════════*
*ANÁLISIS DE TIEMPO*
*═══════════════════════════════*

*FECHA ORDEN:* ${new Date(order.createdAt).toLocaleDateString("es-MX")}
*HORA ORDEN:* ${new Date(order.createdAt).toLocaleTimeString("es-MX")}
*TIEMPO TRANSCURRIDO:* ${processingHours}h ${processingMinutes}m
*ESTADO ACTUAL:* ${order.status?.toUpperCase() || "PENDIENTE"}

*═══════════════════════════════*
*CLASIFICACIÓN*
*═══════════════════════════════*

*TIPO DE ORDEN:* ${
        parseFloat(order.totalAmount) > 200
          ? "🔥 ORDEN PREMIUM"
          : parseFloat(order.totalAmount) > 100
          ? "⭐ ORDEN ESTÁNDAR"
          : "💚 ORDEN BÁSICA"
      }
*PRIORIDAD:* ${parseFloat(order.totalAmount) > 200 ? "ALTA" : "NORMAL"}
*COMPLEJIDAD:* ${totalItems > 5 ? "ALTA" : totalItems > 2 ? "MEDIA" : "BAJA"}

*═══════════════════════════════*
*INFORMACIÓN DEL CLIENTE*
*═══════════════════════════════*

*MÉTODO CONTACTO:* ${
        order.customerPhone ? "📱 WhatsApp + 📧 Email" : "📧 Solo Email"
      }
*UBICACIÓN:* ${order.shippingAddress?.city || "No especificada"}, ${
        order.shippingAddress?.state || "N/A"
      }
*NOTAS ESPECIALES:* ${order.notes ? "SÍ" : "NO"}

*═══════════════════════════════*
*RECOMENDACIONES*
*═══════════════════════════════*

${
  parseFloat(order.totalAmount) > 150
    ? "• Considerar descuento para futuras compras\n• Solicitar reseña después del envío\n• Agregar a lista de clientes VIP"
    : "• Ofrecer productos complementarios\n• Enviar cupón para próxima compra"
}
    `
    );

    await answerCallbackQuery(callbackQueryId, "📊 Estadísticas generadas");
  } catch (error) {
    console.error("Error viewing stats:", error);
    await answerCallbackQuery(callbackQueryId, "❌ Error en estadísticas");
  }
}
