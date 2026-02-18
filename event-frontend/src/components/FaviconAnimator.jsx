import { useEffect } from 'react';

const FaviconAnimator = () => {
    useEffect(() => {
        const emojis = ['🎓', '🚀', '💻', '🌟', '🔥'];
        let index = 0;
        const interval = setInterval(() => {
            const link = document.querySelector("link[rel~='icon']");
            if (link) {
                link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emojis[index]}</text></svg>`;
                document.title = `${emojis[index]} EventHub`;
            }
            index = (index + 1) % emojis.length;
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    return null;
};

export default FaviconAnimator;
