import { useState } from "react";
import PageContainer from "../layout/PageContainer";
import Title from "../Title";

export default function LoadingPage({ page }: { page: number }) {
    const [generationComplete, setGenerationComplete] = useState(false);

    return (
        <PageContainer page={page} nextPageAllowed={generationComplete} onNextPageClick={() => {}}>
            <Title title="Dein Bild wird generiert!" />
        </PageContainer>
    )
}