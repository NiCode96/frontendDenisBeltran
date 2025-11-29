import { Input } from "@/components/ui/input"

export function ShadcnInput({placeholder, value, onChange}) {

    return <Input
        className="border-blue-800"
        onChange={onChange} value={value} type="text" placeholder={placeholder} />
}
