import {CardWrapper} from "@/components/auth/CardWrapper";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";

export function ErrorCard() {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonLabel="Back to login"
      backButtonHref="/login"
    >
      <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive"/>
      </div>
    </CardWrapper>
  )
}