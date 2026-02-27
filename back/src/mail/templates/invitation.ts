import { baseTemplate } from './base';

export const invitationTemplate = (link: string) => {
  const title = 'Invitación a Spot-On';
  const content = `
        <h1 class="title">${title}</h1>
        
        <div class="info-box">
            <p style="margin: 0;">Has sido invitado a formar parte de nuestra plataforma para gestionar inventarios y empresas.</p>
        </div>
        
        <p>Únete a nosotros para acceder a todas las funcionalidades que ofrecemos y optimizar tu flujo de trabajo.</p>
        
        <a href="${link}" class="button">Aceptar Invitación</a>
        
        <p style="margin-top: 20px; font-size: 14px; color: #666;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
    `;
  return baseTemplate(title, content);
};
