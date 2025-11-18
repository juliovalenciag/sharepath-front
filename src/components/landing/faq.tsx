import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "Soporte",
    questions: [
      {
        question: "¿Cómo empiezo a planear un itinerario en SharePath?",
        answer:
          "Solo busca un destino, añade lugares a tu día y organiza tu ruta con un solo clic.",
      },
      {
        question: "¿SharePath puede sugerirme lugares para visitar?",
        answer:
          "Sí. Nuestra búsqueda inteligente muestra lugares populares, recomendaciones y puntos relevantes cercanos a ti.",
      },
      {
        question: "¿Puedo optimizar mi ruta automáticamente?",
        answer:
          "SharePath ordena tu día según distancia, horarios y lógica del recorrido.",
      },
    ],
  },
  {
    title: "Tu cuenta",
    questions: [
      {
        question: "¿SharePath es gratis?",
        answer:
          "Sí. Puedes usarlo completamente gratis. Más funciones avanzadas llegarán pronto.",
      },
      {
        question: "¿Puedo ver mis itinerarios desde cualquier dispositivo?",
        answer:
          "Sí. Con tu cuenta puedes abrir y editar tus itinerarios desde cualquier lugar.",
      },
    ],
  },
  {
    title: "Otras preguntas",
    questions: [
      {
        question: "¿Puedo compartir mis itinerarios con otras personas?",
        answer:
          "Sí. Generamos un enlace público para compartir tu itinerario de forma clara y bonita.",
      },
      {
        question: "¿Pronto habrá más ciudades disponibles?",
        answer:
          "Sí, SharePath crecerá continuamente a más estados y países.",
      },
    ],
  },
];

export const FAQ = ({
  headerTag = "h2",
  className,
  className2,
}: {
  headerTag?: "h1" | "h2";
  className?: string;
  className2?: string;
}) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className={cn("mx-auto grid gap-16 lg:grid-cols-2", className2)}>
          <div className="space-y-4">
            {headerTag === "h1" ? (
              <h1 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                ¿Tienes preguntas?
              </h1>
            ) : (
              <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                ¿Tienes preguntas?
              </h2>
            )}
            <p className="text-muted-foreground max-w-md leading-snug lg:mx-auto">
              Si no encuentras lo que estás buscando,{" "}
              <Link href="/contact" className="underline underline-offset-4">
                ponte en contacto
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-6 text-start">
            {categories.map((category, categoryIndex) => (
              <div key={category.title} className="">
                <h3 className="text-muted-foreground border-b py-4">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${categoryIndex}-${i}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
