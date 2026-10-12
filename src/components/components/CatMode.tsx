import { useState } from "react";
import Image from "next/image";

const CAT_IMAGES = [
    "/assets/cats/cat1.png",
    "/assets/cats/cat3.gif",
    "/assets/cats/cat4.gif",
    "/assets/cats/cat5.gif",
    "/assets/cats/cat6.gif",
    "/assets/cats/cat7.gif",
    "/assets/cats/cat8.gif",
];
const CAT_COUNT = 14;
const LIGHT_COLORS = ["#ff004c", "#ffd600", "#00e5ff", "#7cff00", "#d500f9"];

interface Cat {
    src: string;
    size: number;
    spinDuration: number;
    moveXDuration: number;
    moveYDuration: number;
    // Negative delays start each cat at a random point of its path
    moveXDelay: number;
    moveYDelay: number;
    popDelay: number;
    reverse: boolean;
}

function createCats(): Cat[] {
    return Array.from({ length: CAT_COUNT }, (_, i) => ({
        src: CAT_IMAGES[i % CAT_IMAGES.length],
        size: Math.round(200 + Math.random() * 200),
        spinDuration: 0.8 + Math.random() * 2,
        moveXDuration: 1.8 + Math.random() * 2,
        moveYDuration: 1.4 + Math.random() * 1.8,
        moveXDelay: -Math.random() * 4,
        moveYDelay: -Math.random() * 4,
        popDelay: Math.random() * 0.6,
        reverse: Math.random() > 0.5,
    }));
}

export default function CatMode({ durationMs }: { durationMs: number }) {
    // Cats are generated once per activation; the parent remounts this component via `key`
    const [cats] = useState(createCats);

    return (
        <div
            className="cat-mode fixed inset-0 z-40 pointer-events-none overflow-hidden"
            style={{ animationDuration: `${durationMs}ms` }}
        >
            <div className="cat-mode-rainbow absolute inset-0" />
            {LIGHT_COLORS.map((color, i) => (
                <div
                    key={color}
                    className="cat-mode-light absolute rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                        left: `${(i * 23) % 90 - 10}%`,
                        top: `${(i * 37) % 80 - 10}%`,
                        animationDelay: `${i * 0.15}s`,
                    }}
                />
            ))}
            {cats.map((cat, i) => (
                <div
                    key={i}
                    className="cat-mode-cat-x absolute left-0 top-0"
                    style={{
                        "--cat-size": `${cat.size}px`,
                        animationDuration: `${cat.moveXDuration}s`,
                        animationDelay: `${cat.moveXDelay}s`,
                    } as React.CSSProperties}
                >
                    <div
                        className="cat-mode-cat-y"
                        style={{
                            animationDuration: `${cat.moveYDuration}s`,
                            animationDelay: `${cat.moveYDelay}s`,
                        }}
                    >
                        <Image
                            src={cat.src}
                            alt=""
                            width={cat.size}
                            height={cat.size}
                            unoptimized
                            className="cat-mode-cat object-contain"
                            style={{
                                width: cat.size,
                                height: cat.size,
                                animationDuration: `0.4s, ${cat.spinDuration}s`,
                                animationDelay: `${cat.popDelay}s, ${cat.popDelay}s`,
                                animationDirection: `normal, ${cat.reverse ? "reverse" : "normal"}`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
