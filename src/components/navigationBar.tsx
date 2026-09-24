import { Icon } from "./Icon"
import { useI18n } from "../i18n/context"

type navigationBarProps = {
    label: string;
    className?: string;
}

export function NavigationBar({ label, className } : navigationBarProps) {
    const { t } = useI18n();
    return (
        <nav aria-label={label} className={className}>
            <ul>
                <li><a href="https://lksvn.com.br"><Icon name="arrow-right" className="flip-h"/> {t('home')}</a></li>
                <li><a href="#lists">{t('deckLists')} (v0.7.2)</a></li>
                <li><a href="#editor">{t('customCard')} (v0.1.2)</a></li>
                <li><a href="https://github.com/lksvn/mtg-proxy" target="_blank" rel="noopener noreferrer"><Icon name="github" /> {t('githubRepository')}</a></li>
            </ul>
        </nav>
    )
}
