import Image from "next/image";
// Importa los iconos que necesites. Lucide es una excelente opción con Tailwind.
import {
  CheckCircle2,
  Map,
  Users,
  Camera,
  Share2,
} from "lucide-react";

// Componente para un item de la lista de beneficios (para no repetir código)
const FeatureItem = ({ icon, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 flex-shrink-0 text-sky-500">{icon}</div>
    <span className="text-muted-foreground">{children}</span>
  </div>
);

export default function ContentSection() {
  return (
    <section className="py-20 md:py-32 bg-white dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl space-y-12 px-6 md:space-y-20">
        {/* Título con un gradiente sutil para darle más peso visual */}
        <h2 className="relative z-10 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-400">
          Explora, comparte y arma tus viajes con SharePath
        </h2>

        <div className="grid gap-12 sm:grid-cols-2 md:gap-16 lg:gap-24">
          <div className="relative mb-6 sm:mb-0">
            {/* Sombra más pronunciada para dar profundidad a la imagen */}
            <div className="relative aspect-[76/59] rounded-2xl bg-gradient-to-b from-zinc-300 to-transparent p-px dark:from-zinc-700 shadow-xl shadow-sky-900/10">
              <Image
                src="/cdmx-dark.jpg"
                className="hidden rounded-[15px] dark:block"
                alt="Ciudad de México de noche"
                width={1207}
                height={929}
              />
              <Image
                src="/cdmx-light.jpg"
                className="rounded-[15px] shadow-lg shadow-zinc-900/10 dark:hidden"
                alt="Ciudad de México de día"
                width={1207}
                height={929}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <p className="text-muted-foreground md:text-lg">
              SharePath reúne todo lo que necesitas para planear{" "}
              <span className="font-semibold text-foreground">
                tu próxima aventura:
              </span>{" "}
              descubre lugares verificados, arma itinerarios y encuentra
              publicaciones reales de otros viajeros.
            </p>
            <p className="text-muted-foreground md:text-lg">
              Nuestra plataforma integra mapas, reseñas y herramientas
              colaborativas para que planificar sea simple y divertido.
            </p>

            {/* Lista de beneficios rediseñada con iconos */}
            <div className="space-y-4 border-t pt-6 dark:border-zinc-800">
              <FeatureItem icon={<CheckCircle2 size={20} />}>
                Itinerarios inteligentes con tiempos y distancias.
              </FeatureItem>
              <FeatureItem icon={<Map size={20} />}>
                Lugares curados y actualizados por la comunidad.
              </FeatureItem>
              <FeatureItem icon={<Camera size={20} />}>
                Publicaciones con fotos, tips y experiencias reales.
              </FeatureItem>
              <FeatureItem icon={<Share2 size={20} />}>
                Comparte y colabora en la planificación con amigos.
              </FeatureItem>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}