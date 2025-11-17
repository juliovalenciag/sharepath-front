'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function TerminosPage() {
 

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <header className="flex items-start justify-between p-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900">Términos y Condiciones</h1>
            </div>
              <Link href="/sign-up">
                <Button className="rounded-full">Regresar</Button>
              </Link>
          </header>

          <section className="terminos mt-6 border rounded-lg max-h-[64vh] overflow-y-auto px-4 py-4 bg-white text-gray-700">

            <article className="prose prose-sm sm:prose">
              <p>
                Bienvenid@ a nuestra aplicación <strong>Share Path</strong>.
                Al acceder, registrarse o utilizar cualquiera de nuestros servicios, usted acepta
                cumplir con los presentes <strong>Términos y Condiciones</strong><br /> Si no está de acuerdo con ellos, le
                solicitamos que no utilice la Aplicación.
              </p> <br /> <br />

              <h2 className="font-bold">1. Sobre nuestra Aplicación</h2><br />
              <p>
                La Aplicación permite al usuario responder cuestionarios interactivos relacionados
                con sus preferencias turísticas, culturales o recreativas. El propósito es brindar
                una experiencia personalizada y de entretenimiento, sin requerir información
                sensible o privada.
              </p><br />

              <h2 className="font-bold">2. Aceptación de los términos</h2><br />
              <p>
                Al usar esta Aplicación, usted reconoce haber leído, comprendido y aceptado los
                presentes Términos, así como cualquier política adicional que pueda establecerse
                (por ejemplo, Política de Privacidad o uso de cookies).
              </p> <br />

              <h2 className="font-bold">3. Requisitos de uso</h2> <br />
              <p>
                Para utilizar esta Aplicación, usted declara que: tiene al menos <strong>18 años </strong>
                 usa la aplicación para fines personales y no comerciales y no empleará la Aplicación para fines ilegales, difamatorios o que
                afecten a terceros.
              </p> <br />

              <h2 className="font-bold">4. Cuentas y seguridad</h2> <br />
              <p>
                En caso de que la Aplicación permita crear cuentas o iniciar sesión, el usuario será
                responsable de la confidencialidad de sus credenciales y del uso que se haga de su
                cuenta. Nos reservamos el derecho de suspender o eliminar cuentas que violen estos
                Términos.
              </p> <br />

              <h2 className="font-bold">5. Contenido del usuario</h2> <br />
              <p>
                El contenido que usted introduzca (por ejemplo, respuestas a preguntas o selecciones
                de opciones) es de su propiedad. Usted concede a la Aplicación una licencia no
                exclusiva, temporal y revocable para almacenar y procesar sus respuestas con el
                único fin de ofrecer la funcionalidad del servicio.
              </p>
              <p>
                Usted se compromete a no incluir en sus respuestas información personal de terceros
                sin su consentimiento, contenido ofensivo, ilegal o que infrinja derechos de
                autor.
              </p>

              <br /><h2 className="font-bold">6. Almacenamiento y privacidad de datos</h2><br />
              <p>
                La Aplicación utiliza almacenamiento local en su navegador para guardar
                temporalmente sus respuestas o preferencias. Esto significa que los datos permanecen
                únicamente en su dispositivo, no se transmiten a ningún servidor externo y usted puede
                eliminarlos en cualquier momento borrando los datos de su navegador.
              </p>
              <p>
                Nos reservamos el derecho de implementar un sistema de cuentas o sincronización en el
                futuro, lo cual será debidamente informado al usuario.
              </p>

              <br /><h2 className="font-bold">7. Propiedad intelectual</h2><br />
              <p>
                Todo el código fuente, diseño, logotipos, interfaz y contenidos de la Aplicación son
                propiedad del desarrollador o de sus respectivos titulares. Usted no podrá copiar,
                modificar, distribuir, revender o crear obras derivadas sin autorización previa por
                escrito.
              </p> <br />

              <h2 className="font-bold">8. Conducta del usuario</h2> <br />
              <p>
                Usted se compromete a no interferir con el funcionamiento normal de la Aplicación, a
                no intentar acceder a datos, sistemas o funciones no autorizadas y a no usar scripts,
                bots o automatizaciones para manipular la funcionalidad. El incumplimiento podrá
                resultar en la suspensión o bloqueo del acceso.
              </p> <br />

              <h2 className="font-bold">9. Limitación de responsabilidad</h2> <br />
              <p>
                La Aplicación se ofrece “tal cual” y “según disponibilidad”, sin garantías de ningún
                tipo. No garantizamos que el servicio esté libre de errores, interrupciones o pérdida
                de datos. En ningún caso seremos responsables por daños directos o indirectos
                derivados del uso o la imposibilidad de uso de la Aplicación.
              </p> <br />

              <h2 className="font-bold">10. Modificaciones y actualizaciones</h2> <br />
              <p>
                Podemos modificar estos Términos en cualquier momento para reflejar cambios en la
                funcionalidad, requisitos legales o políticas internas. Las versiones actualizadas
                estarán disponibles en la misma Aplicación, y su uso continuo implicará la aceptación
                de dichas modificaciones.
              </p> <br />

              <h2 className="font-bold">11. Suspensión o terminación del servicio</h2> <br />
              <p>
                Nos reservamos el derecho de suspender o cancelar temporal o permanentemente la
                Aplicación, o el acceso del usuario, sin previo aviso, en caso de detectar abuso,
                fraude o incumplimiento de los Términos.
              </p> <br />

              <h2 className="font-bold">12. Enlaces a terceros</h2>
              <p>
                La Aplicación puede incluir enlaces a sitios externos. No somos responsables del
                contenido ni de las políticas de privacidad de dichos sitios. Se recomienda revisar
                los términos correspondientes al acceder a páginas de terceros.
              </p> <br />

              <h2 className="font-bold">13. Legislación aplicable y jurisdicción</h2> <br />
              <p>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes de México. Cualquier controversia será resuelta ante los tribunales
                competentes.
              </p> <br />

              <h2 className="font-bold">14. Contacto</h2> <br />
              <p>
                Si tiene preguntas o comentarios sobre estos Términos, puede contactarnos en: <br />
                <strong>soporteHarolovers@gmail.com</strong>
              </p> <br />

              <h2 className="font-bold">15. Aceptación final</h2> <br />
              <p>
                Al utilizar la Aplicación, usted reconoce que ha leído, entendido y aceptado todos los
                Términos y Condiciones aquí descritos.
              </p> <br />
            </article>
          </section>

          <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2025 Todos los derechos reservados.</p>
            <div className="flex items-center gap-3"></div>
          </footer>
        </div>
      </div>
    </div>
  );
}