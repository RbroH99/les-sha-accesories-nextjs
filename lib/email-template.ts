import fs from "fs/promises";
import path from "path";

// Solo válido en API Routes (servidor)
const emailTemplatePath = path.join(
  process.cwd(),
  "public",
  "emails",
  "order-confirmation-email.html"
);

export async function getOrderConfirmationEmailHtml(data: any) {
  try {
    let html = await fs.readFile(emailTemplatePath, "utf-8");

    // Reemplaza cada variable
    html = html.replace(/{{customerName}}/g, data.customerName);
    html = html.replace(/{{orderId}}/g, data.orderId);
    html = html.replace(/{{orderDate}}/g, data.orderDate);
    html = html.replace(/{{totalAmount}}/g, data.totalAmount);
    html = html.replace(/{{year}}/g, new Date().getFullYear().toString());

    // Dirección
    const addr = data.shippingAddress || {};
    html = html.replace(/{{shippingAddress\.address}}/g, addr.address || "");
    html = html.replace(/{{shippingAddress\.city}}/g, addr.city || "");
    html = html.replace(/{{shippingAddress\.state}}/g, addr.state || "");
    html = html.replace(/{{shippingAddress\.zipCode}}/g, addr.zipCode || "");
    html = html.replace(/{{shippingAddress\.country}}/g, addr.country || "");

    // Items (esto es más delicado, pero funciona para un caso simple)
    let itemsHtml = "";
    data.items.forEach((item: any) => {
      itemsHtml += `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
          <tr>
            <td style="width: 64px; vertical-align: middle;">
              <img src="${
                item.image || "https://tu-dominio.com/placeholder.svg"
              }" width="40" height="40" alt="${
        item.name
      }" style="border-radius: 4px;" />
            </td>
            <td style="vertical-align: middle; padding-left: 10px;">
              <p style="font-size: 16px; color: #333; font-weight: 600; margin: 0;">${
                item.name
              }</p>
              <p style="font-size: 14px; color: #777; margin: 0;">Cantidad: ${
                item.quantity
              }</p>
            </td>
            <td style="vertical-align: middle; text-align: right;">
              <p style="font-size: 16px; color: #333; font-weight: bold; margin: 0;">${
                item.finalPrice
              }</p>
            </td>
          </tr>
        </table>
      `;
    });

    html = html.replace(/{{#items}}[\s\S]*?{{\/items}}/g, itemsHtml);

    return html;
  } catch (error) {
    console.error("Error al cargar la plantilla de email:", error);
    throw error;
  }
}
