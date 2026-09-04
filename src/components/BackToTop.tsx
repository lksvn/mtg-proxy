import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type BackToTopProps = {
    label?: string;
}

export function BackToTop({ label }: BackToTopProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        function checkScroll() {
            setVisible(window.scrollY > window.innerHeight)
        }
        checkScroll()
        window.addEventListener('scroll', checkScroll, { passive: true })
        return () => window.removeEventListener('scroll', checkScroll)
    }, [])

    if (!visible) return null

    return(
        <a href="#top" aria-label={label || 'Back to top'}><Icon name="corner-up"/></a>
    );
}