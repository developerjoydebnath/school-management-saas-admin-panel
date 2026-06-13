'use client';

import { useSidebar } from '@/shared/components/ui/sidebar';
import React from 'react';

export const ScreenWidthForDataTable = () => {
    const [innerWidth, setInnerWidth] = React.useState<number>(0);
    const [innerWidthLoading, setInnerWidthLoading] =
        React.useState<boolean>(true);
    const { state } = useSidebar();

    // get the inner size to make table scrollable while overflowed out of screen
    React.useEffect(() => {
        const updateInnerWidth = () => {
            if (window !== undefined) {
                const width = window.innerWidth;
                setInnerWidth(
                    width > 1024
                        ? width - (state === 'expanded' ? 320 : 116)
                        : width - 64,
                );
            }
        };

        // Call the update function initially and whenever the window is resized
        updateInnerWidth();
        window.addEventListener('resize', updateInnerWidth);
        setInnerWidthLoading(false);

        // Clean up the event listener when component unmounts
        return () => {
            setInnerWidthLoading(false);
            window.removeEventListener('resize', updateInnerWidth);
        };
    }, [state]);

    return { innerWidth, innerWidthLoading };
};
