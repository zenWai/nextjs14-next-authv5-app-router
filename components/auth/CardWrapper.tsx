"use client"

import {BackButton} from "@/components/auth/BackButton";
import {Header} from "@/components/auth/Header";
import {Social} from "@/components/auth/Social";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export function CardWrapper({children, headerLabel, backButtonLabel, backButtonHref, showSocial}: CardWrapperProps) {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label={headerLabel}/>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {showSocial && (
        <CardFooter>
          <Social/>
        </CardFooter>
      )}
      <CardFooter>
        <BackButton
          label={backButtonLabel}
          href={backButtonHref}
        >
        </BackButton>
      </CardFooter>
    </Card>
  );
}