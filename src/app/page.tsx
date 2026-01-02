import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BackToTopButton } from "@/components/back-to-top-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllRestaurants } from "@/data/get-all-restaurants";

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  avatarImageUrl: string;
}

export default async function HomePage() {
  const restaurants = await getAllRestaurants();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header minimalista */}
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <UtensilsCrossed
              className="h-6 w-6 text-primary"
              aria-hidden="true"
            />
            Totem Restaurants
          </h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Restaurantes</h1>
        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants && restaurants.length > 0 ? (
              restaurants.map((restaurant: Restaurant) => (
                <Card
                  key={restaurant.id}
                  className="border-0 bg-white/95 shadow-md transition-all hover:shadow-xl dark:bg-background/80"
                >
                  <Link
                    href={`/${restaurant.slug}`}
                    className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                      {restaurant.coverImageUrl && (
                        <Image
                          src={restaurant.coverImageUrl}
                          alt={restaurant.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority
                        />
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        {restaurant.avatarImageUrl && (
                          <Image
                            src={restaurant.avatarImageUrl}
                            alt={restaurant.name}
                            width={48}
                            height={48}
                            className="rounded-full border"
                          />
                        )}
                        <div>
                          <CardTitle className="line-clamp-1 text-lg leading-tight">
                            {restaurant.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {restaurant.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="mt-2 w-full">
                        Ver cardápio
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))
            ) : (
              <div className="col-span-full mt-10 text-center text-muted-foreground">
                Nenhum restaurante cadastrado ainda.
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Rodapé multinacional */}
      <footer className="mt-10 w-full border-t bg-background py-8 shadow-inner">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row">
          <span className="font-semibold tracking-wide">
            &copy; {new Date().getFullYear()} Totem Solutions S.A. Todos os
            direitos reservados. Desenvolvido por Guilherme Baltazar
          </span>
          <span className="opacity-80">
            Este site é protegido por direitos autorais e políticas de
            privacidade. Proibida a reprodução total ou parcial.
          </span>
        </div>
      </footer>

      {/* Botão flutuante para voltar ao topo */}
      <BackToTopButton />
    </div>
  );
}
