import React from 'react';
import Lottie from 'lottie-react';

// You would need to actually have these JSON files in your assets.
// For now we will use placeholders or try to import them if they exist.
// If not, we might fail at runtime or build time if strict.
// So we will create a safe wrapper that returns null if animation data is missing.

/*
   Since we don't have the actual JSON files yet (they were "installed" as dependencies but assets might be missing),
   we will create a component that accepts animationData.
*/

interface LottieAnimationProps {
    animationData: any;
    loop?: boolean;
    autoplay?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
    animationData,
    loop = true,
    autoplay = true,
    style,
    className
}) => {
    if (!animationData) return null;

    return (
        <div className={className} style={style}>
            <Lottie
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
            />
        </div>
    );
};

// We can export specific pre-configured animations here once we have the assets
// e.g. export const SuccessAnimation = () => <LottieAnimation animationData={require('../../assets/lottie/success.json')} />
