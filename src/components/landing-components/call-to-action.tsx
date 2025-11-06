import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Comienza a explorar el mundo con Share Path
          </h2>
          <p className="mt-4">Libera tu espíritu aventurero y descubre nuevos horizontes.</p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/">
                <span>Comenzar</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/">
                <span>Ingresar</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}