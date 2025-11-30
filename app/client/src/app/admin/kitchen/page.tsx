import { Metadata } from "next";
import { KitchenDisplayView } from "@/modules/kitchen/views/KitchenDisplayView";

export const metadata: Metadata = {
    title: "Kitchen Display | Restaurant Management",
    description: "Real-time kitchen order management system",
};

export default function KitchenPage() {
    return <KitchenDisplayView />;
}
