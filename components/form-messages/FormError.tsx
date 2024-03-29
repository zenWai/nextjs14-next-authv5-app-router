import {ExclamationTriangleIcon} from "@radix-ui/react-icons"

interface FormErrorProps {
  message?: string;
}

export function FormError({message}: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center text-sm gap-x-2 text-destructive">
      <ExclamationTriangleIcon/>
      <p>{message}</p>
    </div>
  );
}