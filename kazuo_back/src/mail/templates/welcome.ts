import { baseTemplate } from './base';

export const welcomeTemplate = (name: string) => {
    const title = "¡Bienvenido a Kazuo!";
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const content = `
        <h1 class="title">${title}</h1>
        <p class="subtitle">Estamos emocionados de tenerte con nosotros.</p>
        
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a utilizar todos nuestros servicios para gestionar tu inventario y empresa de manera eficiente.</p>
        
        <img src="${frontendUrl}/assets/estadisticas.jpg" alt="Bienvenido a Kazuo" class="hero-image" style="width: 100%; max-width: 400px; margin: 20px auto; display: block; border-radius: 8px;">

        <div class="steps">
            <h2 style="margin-top: 0;">Próximos pasos</h2>

            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <div class="step-title">Inicia Sesión</div>
                    <p style="margin: 0;">Accede a tu cuenta y explora el panel de control.</p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <div class="step-title">Configura tu Perfil</div>
                    <p style="margin: 0;">Completa tu información personal y de seguridad.</p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <div class="step-title">Crea tu Empresa</div>
                    <p style="margin: 0;">Registra tu empresa y comienza a añadir inventario.</p>
                </div>
            </div>
        </div>
        
        <a href="${frontendUrl}/Login" class="button">Iniciar Sesión</a>
    `;
    return baseTemplate(title, content);
};
