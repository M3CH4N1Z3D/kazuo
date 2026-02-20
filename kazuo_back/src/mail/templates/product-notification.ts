import { baseTemplate } from './base';

export const productNotificationTemplate = (productName: string, action: string, details: string) => {
    const title = "Actualización de Producto";
    
    // Determine color based on action (simple logic)
    let actionColor = "#2563EB";
    if (action.toLowerCase().includes('elimina')) actionColor = "#ef4444";
    if (action.toLowerCase().includes('cread')) actionColor = "#10b981";

    const content = `
        <h1 class="title">${title}</h1>
        <p class="subtitle">Se ha realizado una acción en el inventario.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${actionColor}; text-align: left;">
            <p style="margin: 0 0 10px 0;"><strong>Producto:</strong> ${productName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Acción:</strong> <span style="color: ${actionColor}; font-weight: bold;">${action}</span></p>
            <p style="margin: 0;"><strong>Detalles:</strong> ${details}</p>
        </div>

        <a href="${process.env.FRONTEND_URL}/Products" class="button">Ver Inventario</a>
    `;
    return baseTemplate(title, content);
};
