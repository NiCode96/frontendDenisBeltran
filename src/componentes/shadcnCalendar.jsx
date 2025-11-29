"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"

export function ShadcnCalendar() {
    // Estado donde guardamos la fecha seleccionada
    const [date, setDate] = React.useState(new Date())

    return (
        <div className="p-4">
            <Calendar
                mode="single"               // Primer ejemplo: selección de una sola fecha
                selected={date}             // Valor actual
                onSelect={setDate}          // Qué hacer cuando se selecciona una fecha
                className="rounded-md border shadow-sm"
            />

            <p className="mt-2 text-sm text-muted-foreground">
                Fecha seleccionada:{" "}
                {date ? date.toLocaleDateString("es-CL") : "Ninguna"}
            </p>
        </div>
    )
}