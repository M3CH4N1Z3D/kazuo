"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("global");

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FaTimes className="text-xl" />
                </button>

                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900 mb-6 text-center border-b pb-4"
                >
                  Términos y Condiciones de Uso y Política de Cookies
                </Dialog.Title>

                <div className="mt-4 text-gray-700 space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm text-justify">
                  <p>
                    Bienvenido a los sitios web propiedad de <strong>SPM INTEGRAL</strong>. Al acceder y navegar en nuestros sitios, usted acepta los siguientes Términos y Condiciones, así como nuestra Política de Privacidad y Cookies. Le recomendamos leer detenidamente este documento.
                  </p>

                  <h4 className="font-bold text-lg text-gray-900">1. Aceptación de los Términos</h4>
                  <p>
                    El acceso y uso de este sitio web implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal. Si no está de acuerdo con alguna de las condiciones aquí establecidas, no deberá usar este sitio web.
                  </p>

                  <h4 className="font-bold text-lg text-gray-900">2. Uso de Cookies</h4>
                  <p>
                    Este sitio web utiliza cookies para mejorar la experiencia del usuario, analizar el tráfico del sitio y personalizar el contenido. Una cookie es un pequeño archivo de texto que se almacena en su navegador cuando visita casi cualquier página web.
                  </p>
                  <p>
                    Las cookies nos permiten recordar sus preferencias, entender cómo interactúa con nuestro sitio y asegurar que los anuncios que vea sean relevantes para usted. Puede configurar su navegador para rechazar todas o algunas cookies, pero esto podría afectar la funcionalidad del sitio.
                  </p>

                  <h4 className="font-bold text-lg text-gray-900">3. Política de Tratamiento de Datos (Habeas Data - Colombia)</h4>
                  <p>
                    En cumplimiento de la <strong>Ley 1581 de 2012</strong> y el Decreto Reglamentario 1377 de 2013 de la República de Colombia, SPM INTEGRAL informa que los datos personales que se recolecten a través de este sitio web serán tratados de manera segura y confidencial.
                  </p>
                  <p>
                    Como titular de los datos, usted tiene derecho a:
                  </p>
                  <ul className="list-disc pl-5">
                    <li>Conocer, actualizar y rectificar sus datos personales.</li>
                    <li>Solicitar prueba de la autorización otorgada.</li>
                    <li>Ser informado sobre el uso que se le ha dado a sus datos.</li>
                    <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
                    <li>Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.</li>
                  </ul>

                  <h4 className="font-bold text-lg text-gray-900">4. Normativa Internacional y Privacidad</h4>
                  <p>
                    SPM INTEGRAL se compromete a cumplir con los estándares internacionales de protección de datos. Respetamos su privacidad y protegemos sus datos personales conforme a las mejores prácticas de la industria y regulaciones aplicables en las jurisdicciones donde operamos.
                  </p>

                  <h4 className="font-bold text-lg text-gray-900">5. Propiedad Intelectual</h4>
                  <p>
                    Todo el contenido de este sitio web, incluyendo textos, gráficos, logotipos, iconos, imágenes y software, es propiedad de SPM INTEGRAL o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual internacionales y de Colombia.
                  </p>

                  <h4 className="font-bold text-lg text-gray-900">6. Modificaciones</h4>
                  <p>
                    SPM INTEGRAL se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor tan pronto como sean publicadas en el sitio web. Se recomienda revisar esta página periódicamente.
                  </p>

                  <h4 className="font-bold text-lg text-gray-900">7. Contacto</h4>
                  <p>
                    Si tiene preguntas sobre estos términos, el uso de cookies o el tratamiento de sus datos personales, puede contactarnos a través de los canales oficiales dispuestos en nuestro sitio web.
                  </p>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 px-6 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Entendido
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TermsModal;
