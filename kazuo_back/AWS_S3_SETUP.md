# Configuración de AWS S3 para Kazuo

Esta guía explica cómo configurar un bucket de AWS S3 y obtener las credenciales necesarias para el funcionamiento del servicio de carga de archivos en `kazuo_back`.

## 1. Crear el Bucket S3

1.  Inicie sesión en la [Consola de administración de AWS](https://aws.amazon.com/console/).
2.  Navegue al servicio **S3**.
3.  Haga clic en **Create bucket** (Crear bucket).
4.  **Bucket name**: Ingrese un nombre único para su bucket (ej. `kazuo-uploads`). Este nombre debe ir en la variable `AWS_S3_BUCKET_NAME` en su archivo `.env`.
5.  **AWS Region**: Seleccione la región deseada (ej. `us-east-1`). Esta región debe ir en la variable `AWS_REGION`.
6.  **Object Ownership**: Deje la configuración recomendada (ACLs disabled) o habilítela si requiere control por ACL, pero se recomienda usar políticas de bucket.
7.  **Block Public Access settings**:
    *   Si desea que las imágenes sean accesibles públicamente (por ejemplo, para mostrarlas en el frontend directamente desde la URL de S3), **desmarque** la opción "Block all public access" y confirme la advertencia.
    *   Si mantiene el acceso público bloqueado, necesitará configurar CloudFront o generar URLs firmadas (la implementación actual asume URLs públicas directas, por lo que se recomienda permitir acceso público de lectura o configurar una política adecuada).
8.  Haga clic en **Create bucket**.

## 2. Configurar la Política del Bucket (Para acceso público de lectura)

Si desmarcó "Block all public access", debe agregar una política para permitir que cualquiera lea los objetos (imágenes de perfil, etc.).

1.  Haga clic en el nombre del bucket recién creado.
2.  Vaya a la pestaña **Permissions** (Permisos).
3.  Desplácese hacia abajo hasta **Bucket policy** y haga clic en **Edit**.
4.  Pegue el siguiente JSON (reemplace `NOMBRE_DE_SU_BUCKET` con el nombre real de su bucket):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::NOMBRE_DE_SU_BUCKET/*"
        }
    ]
}
```

5.  Haga clic en **Save changes**.

## 3. Crear Usuario IAM y Credenciales

Para que el backend pueda subir archivos, necesita credenciales de un usuario con permisos de escritura en el bucket.

1.  Navegue al servicio **IAM** en la consola de AWS.
2.  Vaya a **Users** (Usuarios) y haga clic en **Create user**.
3.  Ingrese un nombre (ej. `kazuo-backend-user`) y haga clic en **Next**.
4.  En "Permission options", seleccione **Attach policies directly**.
5.  Busque la política `AmazonS3FullAccess` y selecciónela (Para mayor seguridad, se recomienda crear una política personalizada que solo permita `PutObject` y `DeleteObject` en el bucket específico, pero `AmazonS3FullAccess` funcionará para empezar).
6.  Haga clic en **Next** y luego en **Create user**.
7.  Haga clic en el usuario recién creado en la lista.
8.  Vaya a la pestaña **Security credentials**.
9.  Desplácese hasta **Access keys** y haga clic en **Create access key**.
10. Seleccione **Application running outside AWS** (u otra opción relevante) y continúe.
11. Copie el **Access key ID** y el **Secret access key**.

## 4. Configurar Variables de Entorno

Actualice su archivo `.development.env` (o el que esté utilizando) con los valores obtenidos:

```env
AWS_S3_BUCKET_NAME=nombre-de-su-bucket
AWS_REGION=us-east-1 (o la región que eligió)
AWS_ACCESS_KEY_ID=SU_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=SU_SECRET_ACCESS_KEY
```

## 5. Correo (Nodemailer)

Además, asegúrese de configurar las credenciales de correo electrónico, ya que se ha actualizado la configuración para usar Gmail de forma consistente:

```env
EMAIL_USER=su-email@gmail.com
EMAIL_PASS=su-contraseña-de-aplicación
```

*Nota: Para Gmail, debe generar una "Contraseña de aplicación" desde la configuración de su cuenta de Google si tiene activada la autenticación de dos factores.*
