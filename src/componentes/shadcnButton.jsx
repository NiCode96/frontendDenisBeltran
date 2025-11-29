
import { Button } from "@/components/ui/button"

export function ShadcnButton({ nombre, funcion }) {
    return (
        <div className="flex flex-wrap items-center gap-2 md:flex-row">
            <Button
                onClick={funcion}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                {nombre}
            </Button>
        </div>
    )
}
