import { baseTemplate } from './base';

export const reportTemplate = (message: string) => {
  const title = 'Reporte Generado';
  const content = `
        <h1 class="title">${title}</h1>
        
        <div class="info-box">
            <p style="margin: 0;">${message}</p>
        </div>
        
        <p>El documento solicitado se encuentra adjunto a este correo en formato PDF.</p>
        <p>Si tienes problemas para visualizarlo, asegúrate de tener instalado un lector de PDF.</p>
    `;
  return baseTemplate(title, content);
};
