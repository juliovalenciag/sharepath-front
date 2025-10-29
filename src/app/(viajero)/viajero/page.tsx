export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Viajero</h1>
      <p className="text-sm text-muted-foreground">
        Landing de Viajero (placeholder).
      </p>
      <ul className="mt-4 list-disc pl-5 text-sm">
        <li>
          <a className="underline" href="/viajero/itinerarios/constructor">
            Abrir constructor
          </a>
        </li>
        <li>
          <a className="underline" href="/viajero/itinerarios/nuevo">
            Crear itinerario
          </a>
        </li>
        <li>
          <a className="underline" href="/viajero/itinerarios/abc123">
            Ver itinerario “abc123”
          </a>
        </li>
      </ul>
    </main>
  );
}
