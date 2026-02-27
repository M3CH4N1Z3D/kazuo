import { baseTemplate } from './base';

export const resetPasswordTemplate = (name: string, url: string) => {
  const title = 'Restablecer Contraseña';
  const content = `
        <h1 class="title">${title}</h1>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Spot-On.</p>
        
        <div class="info-box">
            <p style="margin: 0;">Para continuar con el proceso, haz clic en el siguiente botón. Este enlace expirará en 24 horas.</p>
        </div>

        <a href="${url}" class="button">Restablecer Contraseña</a>
        
        <div class="warning-box">
            <p style="margin: 0;"><strong>Seguridad:</strong> Si tú no solicitaste este cambio, por favor ignora este correo y asegúrate de que tu cuenta esté segura.</p>
        </div>
    `;
  return baseTemplate(title, content);
};
