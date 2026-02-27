export const baseTemplate = (title: string, content: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body {
                font-family: 'Roboto', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f7fa;
                color: #333;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background-color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .logo {
                width: 80px;
                height: auto;
            }
            
            .content {
                padding: 30px;
                text-align: center; /* Default center for titles/subtitles */
            }
            
            /* Allow left alignment for specific blocks */
            .text-left {
                text-align: left;
            }

            .title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 15px;
                color: #333;
            }
            
            .subtitle {
                font-size: 18px;
                margin-bottom: 25px;
                color: #555;
            }
            
            .hero-image {
                width: 100%;
                max-width: 400px;
                margin: 20px auto;
                display: block;
                border-radius: 4px;
            }

            .button {
                display: inline-block;
                background-color: #2563EB;
                color: #ffffff;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                margin-top: 20px;
                transition: background-color 0.3s;
            }
            
            .button:hover {
                background-color: #1d4ed8;
            }

            .info-box {
                background-color: #eff6ff;
                border-left: 4px solid #2563EB;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
                border-radius: 4px;
            }
            
            .warning-box {
                background-color: #fef2f2;
                border-left: 4px solid #ef4444;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
                border-radius: 4px;
                color: #b91c1c;
            }

            .steps {
                background-color: #f8f9fa;
                padding: 25px;
                border-radius: 6px;
                margin: 30px 0;
                text-align: left;
            }
            
            .step {
                display: flex;
                margin-bottom: 20px;
                align-items: flex-start;
            }
            
            .step-number {
                background-color: #2563EB;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 15px;
                flex-shrink: 0;
            }
            
            .step-content {
                flex: 1;
            }
            
            .step-title {
                font-weight: 600;
                margin-bottom: 5px;
                color: #333;
            }

            .footer {
                background-color: #f1f3f4;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }

            .social-icons {
                margin: 15px 0;
            }
            
            .social-icon {
                display: inline-block;
                width: 32px;
                height: 32px;
                margin: 0 5px;
                background-color: #2563EB;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
            }
            
            .social-icon img {
                width: 16px;
                height: 16px;
            }

            @media only screen and (max-width: 600px) {
                .container {
                    width: 100%;
                    border-radius: 0;
                }
                
                .content {
                    padding: 20px;
                }
                
                .steps {
                    padding: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${frontendUrl}/images/icons/icon-128x128.png" alt="Spot-On" class="logo">
            </div>
            
            <div class="content">
                ${content}
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Spot-On. Todos los derechos reservados.</p>
                <p>Si tienes alguna pregunta, contáctanos en <a href="mailto:soporte@spot-on.com" style="color: #2563EB; text-decoration: none;">soporte@spot-on.com</a></p>
                <p><small>Este es un mensaje automático, por favor no respondas.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};
