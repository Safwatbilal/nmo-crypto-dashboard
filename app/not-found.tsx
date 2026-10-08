import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";

export default function NotFound() {
  return (
    <Card>
      <StatePanel
        icon="map_outlined"
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link href="/" className={buttonVariants()}>
            Back to the market
          </Link>
        }
      />
    </Card>
  );
}
