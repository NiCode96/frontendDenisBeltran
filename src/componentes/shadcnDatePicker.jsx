"use client"

import React, { useState } from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date) {
    if (!date) return ""
    return date.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

export default function ShadcnDatePicker({ label = "Fecha", value, onChange }) {
    const [open, setOpen] = useState(false)
    const [textValue, setTextValue] = useState(value || "")
    const [date, setDate] = useState(value ? new Date(value) : undefined)
    const [month, setMonth] = useState(date)

    const handleSelect = (selectedDate) => {
        setDate(selectedDate)
        const formatted = formatDate(selectedDate)
        setTextValue(formatted)
        setOpen(false)

        if (onChange) {
            // Devuelvo aaa-mm-dd que es ideal para tu backend:
            onChange(selectedDate.toISOString().split("T")[0])
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Label className="px-1 text-sm font-medium text-slate-700">{label}</Label>

            <div className="relative flex gap-2">
                <Input
                    value={textValue}
                    placeholder="Selecciona fecha"
                    className="bg-white border border-gray-200 rounded-md pr-10 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-500"
                    onChange={(e) => {
                        setTextValue(e.target.value)
                        const parsed = parseDate(e.target.value)
                        if (parsed) {
                            setDate(parsed)
                            setMonth(parsed)
                            if (onChange) onChange(parsed.toISOString().split("T")[0])
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full text-sky-600 hover:bg-sky-50"
                        >
                            <CalendarIcon className="w-4 h-4 text-sky-600" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        align="end"
                        className="w-auto p-3 z-50 bg-white text-slate-900 rounded-lg border border-gray-200 shadow-lg"
                    >
                        {/* Header accent dentro del popover para aspecto profesional */}
                        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-gray-100">
                            <div className="text-sm font-semibold text-sky-700">Seleccionar fecha</div>
                            <div className="text-xs text-gray-400">{date ? formatDate(date) : ''}</div>
                        </div>
                        <div className="rounded-md overflow-hidden">
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                month={month}
                                onMonthChange={setMonth}
                                onSelect={handleSelect}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}