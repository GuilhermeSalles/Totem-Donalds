"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ConsumptionMethod } from "@prisma/client";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2Icon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createOrder } from "../actions/create-order";
import { createStripeCheckout } from "../actions/create-stripe-checkout";
import { CartContext } from "../contexts/cart";
import { isValidCpf } from "../helpers/cpf";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  // Guardamos a string formatada, mas validamos os dígitos
  cpf: z
    .string()
    .trim()
    .min(1, { message: "O CPF é obrigatório." })
    .refine((value) => isValidCpf(value), { message: "CPF inválido." }),
});

type FormSchema = z.infer<typeof formSchema>;

interface FinishOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FinishOrderDialog = ({ open, onOpenChange }: FinishOrderDialogProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useContext(CartContext);
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", cpf: "" },
    shouldUnregister: true,
  });

  const normalizeConsumptionMethod = (
    raw: string | null,
  ): ConsumptionMethod | null => {
    if (!raw) return null;
    const norm = raw.trim().replace(/[-\s]/g, "_").toUpperCase(); // dine-in -> DINE_IN
    if (norm === "DINE_IN" || norm === "TAKEAWAY") {
      return norm as ConsumptionMethod;
    }
    return null;
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);

      // 1) Normalizar/validar o consumptionMethod da URL (ou usar default)
      const cm = normalizeConsumptionMethod(
        searchParams.get("consumptionMethod"),
      );
      const consumptionMethod: ConsumptionMethod =
        cm ?? ConsumptionMethod.TAKEAWAY;
      // ^ troque o default se preferir DINE_IN

      // 2) Carrinho vazio?
      if (!products || products.length === 0) {
        throw new Error("Your cart is empty.");
      }

      // 3) Criar pedido
      const order = await createOrder({
        consumptionMethod,
        customerCpf: data.cpf, // server action já remove pontuação
        customerName: data.name,
        products,
        slug,
      });

      // 4) Stripe Checkout
      const { sessionId } = await createStripeCheckout({
        products,
        orderId: order.id,
        slug,
        consumptionMethod,
        cpf: data.cpf,
      });

      const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
      if (!pk) throw new Error("Stripe public key not configured.");

      const stripe = await loadStripe(pk);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error(err);
      // Coloque seu toast aqui se tiver
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Como o Drawer é controlado via props, o Trigger é opcional.
          Se quiser manter, deixe com um filho. */}
      <DrawerTrigger asChild></DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Finalizar Pedido</DrawerTitle>
          <DrawerDescription>
            Insira suas informações abaixo para finalizar o seu pedido.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu CPF</FormLabel>
                    <FormControl>
                      <PatternFormat
                        placeholder="Digite seu CPF..."
                        format="###.###.###-##"
                        customInput={Input}
                        // Integração correta com RHF:
                        value={field.value}
                        onValueChange={(vals) => field.onChange(vals.value)} // apenas dígitos -> RHF
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        allowEmptyFormatting
                        mask="_"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DrawerFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  className="rounded-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2Icon className="animate-spin" />}
                  Finalizar
                </Button>
                <DrawerClose asChild>
                  <Button className="w-full rounded-full" variant="outline">
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FinishOrderDialog;
