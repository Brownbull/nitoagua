import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">nitoagua</CardTitle>
          <CardDescription>Coordina tu entrega de agua</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Conectamos consumidores de agua con proveedores de camiones cisterna en Chile rural.
          </p>
          <Button className="w-full" size="lg">
            Solicitar Agua
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
