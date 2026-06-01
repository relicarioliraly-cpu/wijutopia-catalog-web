export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-8">
        <p className="inline-flex rounded-full border border-wiju-gold/50 px-4 py-2 text-sm font-bold text-wiju-crimson dark:text-wiju-gold">Next.js + Express.js + MySQL</p>
        <h1 className="text-5xl font-black leading-tight md:text-7xl">Comercio electrónico TCG para la comunidad de Trujillo.</h1>
        <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-300">
          Prototipo académico de plataforma full-stack para catálogo de cartas, boosters y accesorios, con métricas implícitas, roles de empleado/cliente, captcha visual y estética inspirada en mesas competitivas TCG.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="/client" className="rounded-2xl bg-wiju-crimson px-6 py-4 font-black text-white dark:bg-wiju-gold dark:text-black">Explorar catálogo</a>
          <a href="/admin" className="rounded-2xl border border-wiju-borderLight px-6 py-4 font-black dark:border-wiju-borderDark">Panel administrativo</a>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <a href="/games" className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 font-black shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">Explorar juegos ramificados →</a>
        <a href="/store-tags/en-vitrina" className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 font-black shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">Vista por etiquetas internas de tienda →</a>
      </section>
      <section className="rounded-[2rem] border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
        <h2 className="text-2xl font-black">Alcance del examen</h2>
        <ul className="mt-6 space-y-4 text-slate-600 dark:text-slate-300">
          <li>• CRUD de productos protegido por rol empleado.</li>
          <li>• Catálogo cliente con filtros y carrito persistido en LocalStorage.</li>
          <li>• Tracking no bloqueante con keepalive y dashboard de proporción de interacción.</li>
          <li>• Registro/login con captcha visual generado en backend.</li>
        </ul>
      </section>
    </main>
  );
}
