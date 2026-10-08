import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";

export default function AssetNotFound() {
  return (
    <Card>
      <StatePanel
        icon="search_error_outlined"
        title="Asset not found"
        description="We couldn't find a crypto asset with that id. It may have been delisted or the link is mistyped."
        action={
          <Link href="/" className={buttonVariants()}>
            Search the market
          </Link>
        }
      />
    </Card>
  );
}
