import { baseTemplate } from './base';

export const companyNotificationTemplate = (
  titleText: string,
  message: string,
  actionLink?: string,
  actionText?: string,
) => {
  let buttonHtml = '';
  if (actionLink && actionText) {
    buttonHtml = `<a href="${actionLink}" class="button">${actionText}</a>`;
  }

  const content = `
        <h1 class="title">${titleText}</h1>
        
        <div class="info-box">
            <p style="margin: 0;">${message}</p>
        </div>
        
        ${buttonHtml}

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Has recibido esta notificación porque eres parte de una compañía en Spot-On.
        </p>
    `;
  return baseTemplate(titleText, content);
};
