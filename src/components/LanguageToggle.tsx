import { Icon } from "./Icon";
import { useI18n } from '../i18n/context';

type LanguageToggleProps = {
	label?: string;
}

export function LanguageToggle({ label }: LanguageToggleProps) {
    const { language, setLanguage, t } = useI18n()

	return(
        <button
            type="button"
            className="color-scheme-toggle"
            onClick={() => setLanguage(language === 'en-US' ? 'pt-BR' : 'en-US')}
            aria-label={label || t('changeLanguage')}
        >
            <Icon name="language"/> <small className="pl-1">{t('language')}</small>
        </button>
	);
}
